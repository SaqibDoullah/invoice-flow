'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { type Invoice } from '@/types';
import { generateInvoicePdf } from '@/lib/generate-pdf';
import { format } from 'date-fns';

const sendInvoiceSchema = z.object({
  invoiceObject: z.any(),
  subject: z.string(),
  body: z.string(),
});

export async function sendInvoiceEmail(formData: FormData) {
  try {
      const invoiceObject = JSON.parse(formData.get('invoiceObject') as string);
      
      const rawData = {
        invoiceObject: invoiceObject,
        subject: formData.get('subject'),
        body: formData.get('body'),
      };
    
    const validatedData = sendInvoiceSchema.parse(rawData);
    const invoice = validatedData.invoiceObject as Invoice;

    // Generate the PDF from the invoice data
    const pdfBuffer = await generateInvoicePdf(invoice);
    
    const to = invoice.customerEmail;
    if (!to) {
        throw new Error('Cannot send invoice: customer email is missing.');
    }

    await sendEmail({
      to,
      subject: validatedData.subject,
      html: validatedData.body.replace(/\n/g, '<br>'),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { success: true, message: "Email with PDF attachment sent successfully!" };
  } catch (error: any) {
    console.error("[Send Invoice Action Error]", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data provided.", errors: error.errors };
    }
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}
