// DO NOT put "use server" here
import 'server-only';

export async function generateInvoicePdf(html: string): Promise<Buffer> {
  // dynamic import so it never ships to client
  const puppeteer = (await import('puppeteer')).default;

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
