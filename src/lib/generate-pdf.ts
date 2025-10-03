
'use server';

import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function generateInvoicePdf(html: string) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox'], // helpful in containers
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    
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
