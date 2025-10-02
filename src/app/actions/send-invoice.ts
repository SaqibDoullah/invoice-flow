'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/generate-pdf';
import { type Invoice } from '@/types';

const sendInvoiceSchema = z.object({
  invoice: z.any(), // Not ideal, but hard to validate complex nested object with server actions
  subject: z.string(),
  body: z.string(),
});

export async function sendInvoiceWithAttachment(formData: FormData) {
  let rawData;
  try {
      // Re-hydrate the invoice object. FormData can't handle complex objects.
      const invoiceObject = JSON.parse(formData.get('invoice') as string);
      
      rawData = {
        invoice: invoiceObject,
        subject: formData.get('subject'),
        body: formData.get('body'),
      };
    
    const validatedData = sendInvoiceSchema.parse(rawData);
    const invoice = validatedData.invoice as Invoice;

    // 1. Generate PDF
    const pdfBuffer = await generateInvoicePdf(invoice);

    // 2. Send Email with PDF attachment
    await sendEmail({
      to: invoice.customerEmail,
      subject: validatedData.subject,
      html: validatedData.body.replace(/\n/g, '<br>'), // Convert newlines to breaks for HTML email
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { success: true, message: "Email sent successfully!" };
  } catch (error: any) {
    console.error("[Send Invoice Action Error]", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data provided.", errors: error.errors };
    }
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
