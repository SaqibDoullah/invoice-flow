import 'server-only';
import { type Invoice } from '@/types';

// This is a placeholder for PDF generation.
// The `pdfkit` library was causing build issues and has been temporarily removed.
export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  console.log("PDF generation is temporarily disabled.", invoice);
  
  // Return a dummy buffer to avoid breaking the email attachment logic.
  // In a real scenario, you would re-implement PDF generation with a library
  // that is more compatible with Next.js server environments, like `@react-pdf/renderer`.
  const dummyContent = `
    Invoice: ${invoice.invoiceNumber}
    Customer: ${invoice.customerName}
    Total: ${invoice.total}
    
    PDF generation is temporarily disabled.
  `;

  return Buffer.from(dummyContent, 'utf-8');
}
