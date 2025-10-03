// DO NOT put "use server" here
import 'server-only';

export async function generateInvoicePdf(html: string): Promise<Buffer> {
  // serverless-friendly Chromium + puppeteer-core
  const chromium = await import('@sparticuz/chromium');
  const puppeteer = (await import('puppeteer-core')).default;

  const browser = await puppeteer.launch({
    executablePath: await (chromium as any).executablePath(),
    args: [...(chromium as any).args, '--no-sandbox', '--disable-setuid-sandbox'],
    headless: (chromium as any).headless,
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
}
