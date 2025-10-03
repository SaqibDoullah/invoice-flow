import 'server-only';
import PDFDocument from 'pdfkit';
import fontkit from 'fontkit';
import { format } from 'date-fns';
import { type Invoice } from '@/types';

// Helper to safely coerce Firestore Timestamp | Date | string to Date
function toDate(v: any): Date {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate();
  if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
  }
  // Return a placeholder date if conversion fails to avoid crashing
  return new Date(0);
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // Register a fallback font
  try {
    doc.registerFont('Inter', require.resolve('pdfkit/js/data/Helvetica.afm'));
    doc.font('Inter');
  } catch (error) {
    console.warn("Could not register fallback font. Using default.", error);
    // pdfkit will use its default font
  }

  const bufs: Buffer[] = [];
  doc.on('data', (d) => bufs.push(d));
  const done = new Promise<Buffer>((res, rej) => {
    doc.on('end', () => res(Buffer.concat(bufs)));
    doc.on('error', rej);
  });
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  // --- Start of PDF Content ---

  // Header
  doc
    .fontSize(20)
    .fillColor('#4B0082') // Deep Indigo
    .text(invoice.companyName || 'Your Company', { align: 'left' })
    .fontSize(10)
    .fillColor('#333')
    .text(invoice.companyAddress || '', { align: 'left' })
    .text(invoice.companyCity || '', { align: 'left' });

  doc
    .fontSize(20)
    .fillColor('#4B0082')
    .text('INVOICE', { align: 'right' })
    .fontSize(10)
    .fillColor('#333')
    .text(`# ${invoice.invoiceNumber}`, { align: 'right' });

  doc.moveDown(2);

  // Bill To and Dates
  const billToY = doc.y;
  doc
    .fontSize(10)
    .text('Bill To', { align: 'left' })
    .fontSize(12)
    .text(invoice.customerName, { align: 'left' })
    .fontSize(10)
    .text(invoice.customerEmail || '', { align: 'left' });
  
  const invoiceDate = toDate(invoice.invoiceDate);
  const dueDate = toDate(invoice.dueDate);
  
  const detailsX = 350;
  doc.fontSize(10).text('Invoice Date:', detailsX, billToY, { align: 'left' });
  doc.text(invoiceDate.getTime() !== 0 ? format(invoiceDate, 'PP') : '-', { align: 'right' });
  doc.text('Due Date:', detailsX, doc.y, { align: 'left' });
  doc.text(dueDate.getTime() !== 0 ? format(dueDate, 'PP') : '-', { align: 'right' });
  doc.text('Status:', detailsX, doc.y, { align: 'left' });
  doc.text(invoice.status.toUpperCase(), { align: 'right' });

  doc.moveDown(2);

  // Items Table
  const tableTop = doc.y;
  const itemX = 50;
  const qtyX = 300;
  const priceX = 370;
  const totalX = 440;

  doc
    .fontSize(10)
    .text('Product', itemX, tableTop)
    .text('Quantity', qtyX, tableTop, {width: 60, align: 'right'})
    .text('Price', priceX, tableTop, {width: 60, align: 'right'})
    .text('Line Total', totalX, tableTop, {width: 70, align: 'right'});

  let i = 0;
  invoice.items.forEach(item => {
    const y = tableTop + 25 + i * 25;
    doc
      .fontSize(10)
      .text(item.name, itemX, y)
      .text(String(item.quantity), qtyX, y, {width: 60, align: 'right'})
      .text(formatCurrency(item.price), priceX, y, {width: 60, align: 'right'})
      .text(formatCurrency(item.lineTotal), totalX, y, {width: 70, align: 'right'});
    i++;
  });
  
  doc.y = tableTop + 25 + invoice.items.length * 25;
  doc.moveDown(2);
  
  // Totals
  const subtotal = invoice.subtotal || 0;
  const discountValue = invoice.discount || 0;
  const discountAmount = invoice.discountType === 'percentage'
    ? subtotal * (discountValue / 100)
    : discountValue;
  const total = invoice.total || 0;

  doc.fontSize(10).text('Subtotal:', 300, doc.y, { align: 'right', width: 100 });
  doc.text(formatCurrency(subtotal), { align: 'right' });
  doc.moveDown(0.5);

  doc.fontSize(10).text('Discount:', 300, doc.y, { align: 'right', width: 100 });
  doc.text(`- ${formatCurrency(discountAmount)}`, { align: 'right' });
  doc.moveDown(0.5);

  doc.fontSize(12).fillColor('#4B0082').text('Total:', 300, doc.y, { align: 'right', width: 100 });
  doc.text(formatCurrency(total), { align: 'right' });

  // Footer
  doc
    .fontSize(10)
    .text(
      'Thank you for your business.',
      50,
      750,
      { align: 'center', width: 500 }
    );

  // --- End of PDF Content ---

  doc.end();
  return done;
}
