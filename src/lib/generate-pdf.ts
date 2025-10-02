'use server';

import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import { type Invoice } from '@/types';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

// Helper to convert dates
function toDate(v: any): Date {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate(); // Firestore Timestamp
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0); // Invalid date
}

function getGlobalCss(): string {
  try {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    return fs.readFileSync(cssPath, 'utf8');
  } catch (error) {
    console.error("Could not read globals.css:", error);
    return '';
  }
}

function generateHtml(invoice: Invoice): string {
    const formatCurrency = (amount: number | undefined) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);

    const getDiscountAmount = () => {
        if (!invoice.discount) return 0;
        if (invoice.discountType === 'fixed') return invoice.discount;
        return (invoice.subtotal ?? 0) * ((invoice.discount ?? 0) / 100);
    };

    const discountAmount = getDiscountAmount();
    const invoiceDate = toDate(invoice.invoiceDate);
    const dueDate = toDate(invoice.dueDate);
    const globalCss = getGlobalCss();

    const statusColors: Record<Invoice['status'], { bg: string; text: string }> = {
      draft: { bg: '#E5E7EB', text: '#374151' },
      sent: { bg: '#DBEAFE', text: '#1E40AF' },
      paid: { bg: '#D1FAE5', text: '#065F46' },
      void: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const statusColor = statusColors[invoice.status] || statusColors.draft;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                ${globalCss}
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .avoid-break { break-inside: avoid; page-break-inside: avoid; }
            </style>
        </head>
        <body class="bg-white">
            <div class="p-8 mx-auto w-full max-w-[1100px]">
                <header class="mb-12 avoid-break">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: flex-start;">
                        <div>
                            <h1 style="font-size: 1.875rem; font-weight: 700; color: hsl(var(--primary)); text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2;">
                                ${invoice.companyName || 'Your Company'}
                            </h1>
                            <p style="color: hsl(var(--muted-foreground)); margin-top: 0.5rem; font-size: 0.875rem;">${invoice.companyAddress || ''}</p>
                            <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">${invoice.companyCity || ''}</p>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="font-size: 2.25rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Invoice</h2>
                            <p style="color: hsl(var(--muted-foreground)); margin-top: 0.25rem; font-size: 0.875rem;"># ${invoice.invoiceNumber}</p>
                        </div>
                    </div>
                </header>

                <section class="mb-12 avoid-break">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div>
                            <h3 style="font-size: 0.75rem; font-weight: 600; color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Bill To</h3>
                            <p style="font-weight: 700;">${invoice.customerName}</p>
                            <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">${invoice.customerEmail || ''}</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; gap: 0.5rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 0.5rem;"><span style="font-weight: 600;">Invoice Date:</span><span>${invoiceDate.getTime() !== 0 ? format(invoiceDate, 'PPP') : '-'}</span></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 0.5rem;"><span style="font-weight: 600;">Due Date:</span><span>${dueDate.getTime() !== 0 ? format(dueDate, 'PPP') : '-'}</span></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 0.5rem;">
                                <span style="font-weight: 600;">Status:</span>
                                <div style="display: flex; justify-content: flex-end;">
                                  <span style="background-color: ${statusColor.bg}; color: ${statusColor.text}; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 9999px; text-transform: capitalize;">${invoice.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mb-8">
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead style="background-color: hsl(var(--muted));">
                            <tr>
                                <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Product</th>
                                <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; width: 5rem;">Qty</th>
                                <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; width: 8rem;">Price</th>
                                <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; width: 8rem;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr style="border-bottom: 1px solid hsl(var(--border));">
                                    <td style="padding: 0.75rem;">
                                        <p style="font-weight: 500;">${item.name}</p>
                                        <p style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">${item.specification || ''}</p>
                                    </td>
                                    <td style="padding: 0.75rem; text-align: center;">${item.quantity}</td>
                                    <td style="padding: 0.75rem; text-align: right;">${formatCurrency(item.price)}</td>
                                    <td style="padding: 0.75rem; text-align: right;">${formatCurrency(item.lineTotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <section class="flex justify-end mt-12 avoid-break">
                    <div style="width: 100%; max-width: 24rem; display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between;"><span style="color: hsl(var(--muted-foreground));">Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span style="color: hsl(var(--muted-foreground));">Discount (${invoice.discountType === 'percentage' ? `${invoice.discount ?? 0}%` : formatCurrency(invoice.discount ?? 0)})</span><span>-${formatCurrency(discountAmount)}</span></div>
                        <hr style="border-color: hsl(var(--border));" />
                        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.25rem; color: hsl(var(--primary));"><span>Total</span><span>${formatCurrency(invoice.total)}</span></div>
                    </div>
                </section>

                <footer class="mt-20 pt-6 border-t text-center text-sm text-muted-foreground avoid-break">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
        </body>
        </html>
    `;
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const options = {
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  };

  let browser;
  try {
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const htmlContent = generateHtml(invoice);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        right: '16mm',
        bottom: '16mm',
        left: '16mm',
      },
    });

    return pdf;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error('Could not generate invoice PDF.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
