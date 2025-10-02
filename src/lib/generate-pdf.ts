
'use server';

import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import InvoicePDF from '@/components/invoices/invoice-pdf';
import { type Invoice } from '@/types';
import fs from 'fs';
import path from 'path';

// Helper to read global CSS for PDF styling
const getGlobalCss = () => {
    try {
        const cssPath = path.resolve(process.cwd(), 'src', 'app', 'globals.css');
        return fs.readFileSync(cssPath, 'utf-8');
    } catch (error) {
        console.error("Could not read globals.css for PDF generation:", error);
        return '';
    }
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    const globalCss = getGlobalCss();
    const pdfSpecificCss = `
        body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background-color: #fff; 
        }
    `;

    const invoiceHtml = ReactDOMServer.renderToString(
        <InvoicePDF invoice={invoice} />
    );

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
        
        // Set a high-resolution viewport for better quality
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
