// DO NOT put "use server" here
import 'server-only';

export async function generateInvoicePdf(html: string): Promise<Buffer> {
  // Correct dynamic imports
  const { default: chromium } = await import('@sparticuz/chromium');

  // Prefer serverless Chromium when available; fall back to full Puppeteer locally
  const exe = await chromium.executablePath();

  if (exe) {
    const { default: puppeteerCore } = await import('puppeteer-core');
    const browser = await puppeteerCore.launch({
      executablePath: exe,
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      headless: chromium.headless,
      defaultViewport: { width: 1200, height: 1600 },
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.emulateMediaType('screen');
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return pdf;
    } finally {
      await browser.close();
    }
  } else {
    // Local/dev fallback (no system Chrome): use full Puppeteer which downloads Chromium
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.emulateMediaType('screen');
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return pdf;
    } finally {
      await browser.close();
    }
  }
}
