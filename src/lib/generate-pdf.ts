
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
    // In a serverless function, the path might be different.
    // This assumes the file is available at the specified path during execution.
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    if (fs.existsSync(cssPath)) {
        return fs.readFileSync(cssPath, 'utf8');
    }
    console.warn("globals.css not found at path:", cssPath)
    return '';
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
                
                body { 
                    font-family: 'Inter', sans-serif; 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                    background-color: #fff;
                    color: #111;
                    margin: 0;
                    font-size: 14px;
                }
                .container {
                    padding: 32px;
                    margin: 0 auto;
                    width: 100%;
                    max-width: 1000px;
                    box-sizing: border-box;
                }
                .avoid-break { 
                    break-inside: avoid; 
                    page-break-inside: avoid; 
                }
                table { width: 100% !important; page-break-inside: auto; border-collapse: collapse; }
                tr, th, td { break-inside: avoid; }
                .text-muted { color: #6b7280; }
                .text-primary { color: #6d28d9; }
                .font-bold { font-weight: 700; }
                .uppercase { text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="mb-12 avoid-break" style="margin-bottom: 48px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: flex-start;">
                        <div>
                            <h1 style="font-size: 1.875rem; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2;">
                                ${invoice.companyName || 'Your Company'}
                            </h1>
                            <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.875rem;">${invoice.companyAddress || ''}</p>
                            <p class="text-muted" style="font-size: 0.875rem;">${invoice.companyCity || ''}</p>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="font-size: 2.25rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Invoice</h2>
                            <p class="text-muted" style="margin-top: 0.25rem; font-size: 0.875rem;"># ${invoice.invoiceNumber}</p>
                        </div>
                    </div>
                </header>

                <section class="mb-12 avoid-break" style="margin-bottom: 48px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div>
                            <h3 style="font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Bill To</h3>
                            <p style="font-weight: 700;">${invoice.customerName}</p>
                            <p class="text-muted" style="font-size: 0.875rem;">${invoice.customerEmail || ''}</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; gap: 0.5rem; font-size: 14px;">
                            <div style="display: grid; grid-template-columns: auto auto; align-items: center; gap: 1rem; justify-content: flex-end;"><span style="font-weight: 600;">Invoice Date:</span><span>${invoiceDate.getTime() !== 0 ? format(invoiceDate, 'PP') : '-'}</span></div>
                            <div style="display: grid; grid-template-columns: auto auto; align-items: center; gap: 1rem; justify-content: flex-end;"><span style="font-weight: 600;">Due Date:</span><span>${dueDate.getTime() !== 0 ? format(dueDate, 'PP') : '-'}</span></div>
                            <div style="display: grid; grid-template-columns: auto auto; align-items: center; gap: 1rem; justify-content: flex-end;">
                                <span style="font-weight: 600;">Status:</span>
                                <div style="display: flex; justify-content: flex-end;">
                                  <span style="background-color: ${statusColor.bg}; color: ${statusColor.text}; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 9999px; text-transform: capitalize;">${invoice.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mb-8" style="margin-bottom: 32px;">
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead style="background-color: #f3f4f6;">
                            <tr>
                                <th style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Product</th>
                                <th style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; width: 5rem;">Qty</th>
                                <th style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; width: 8rem;">Price</th>
                                <th style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; width: 8rem;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 12px; vertical-align: top;">
                                        <p style="font-weight: 500;">${item.name}</p>
                                        <p style="font-size: 0.875rem; color: #6b7280;">${item.specification || ''}</p>
                                    </td>
                                    <td style="padding: 12px; text-align: center; vertical-align: top;">${item.quantity}</td>
                                    <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.price)}</td>
                                    <td style="padding: 12px; text-align: right; vertical-align: top;">${formatCurrency(item.lineTotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <section class="flex justify-end mt-12 avoid-break" style="display: flex; justify-content: flex-end; margin-top: 48px;">
                    <div style="width: 100%; max-width: 24rem; display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between;"><span class="text-muted">Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span class="text-muted">Discount (${invoice.discountType === 'percentage' ? `${invoice.discount ?? 0}%` : formatCurrency(invoice.discount ?? 0)})</span><span>-${formatCurrency(discountAmount)}</span></div>
                        <hr style="border-color: #e5e7eb; margin: 8px 0;" />
                        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.25rem;" class="text-primary"><span>Total</span><span>${formatCurrency(invoice.total)}</span></div>
                    </div>
                </section>

                <footer class="mt-20 pt-6 border-t text-center text-sm text-muted avoid-break" style="margin-top: 80px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
        </body>
        </html>
    `;
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  let browser;
  try {
    const executablePath = await chrome.executablePath;

    if (!executablePath) {
      throw new Error('Chrome executable not found. Make sure chrome-aws-lambda is installed correctly.');
    }
    
    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath,
      headless: chrome.headless,
    });
    
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
    // Throwing the error will be caught by the server action
    throw new Error('Could not generate invoice PDF.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
