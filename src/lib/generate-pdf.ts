'use server';

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const getGlobalCss = () => {
    try {
        const cssPath = path.resolve(process.cwd(), 'src', 'app', 'globals.css');
        return fs.readFileSync(cssPath, 'utf-8');
    } catch (error) {
        console.error("Could not read globals.css for PDF generation:", error);
        return '';
    }
}

async function getInvoiceHtml(invoiceId: string, ownerId: string): Promise<string> {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://your-production-url.com' // Replace with your actual production URL
        : 'http://localhost:9003';

    const response = await fetch(`${baseUrl}/api/invoice-html`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Simple secret to protect this internal endpoint
            'X-Internal-Secret': process.env.INTERNAL_API_SECRET || 'your-secret-key',
        },
        body: JSON.stringify({ invoiceId, ownerId }),
        // Disable cache to ensure fresh data
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch invoice HTML: ${response.statusText}`);
    }

    return response.text();
}


export async function generateInvoicePdf(invoiceId: string, ownerId: string): Promise<Buffer> {
    const globalCss = getGlobalCss();
    const pdfSpecificCss = `
        body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background-color: #fff; 
        }
    `;

    const invoiceHtml = await getInvoiceHtml(invoiceId, ownerId);
    
    const html = `
        <html>
            <head>
                <style>${globalCss}\n${pdfSpecificCss}</style>
            </head>
            <body>
                ${invoiceHtml}
            </body>
        </html>
    `;

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
        
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        throw new Error('Could not generate PDF.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
