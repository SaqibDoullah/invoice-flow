'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { type Invoice } from '@/types';

const sendInvoiceSchema = z.object({
  invoiceObject: z.any(), // Still needed for customer email, totals etc. on the action
  subject: z.string(),
  body: z.string(),
});

export async function sendInvoiceEmail(formData: FormData) {
  let rawData;
  try {
      // Re-hydrate the invoice object. FormData can't handle complex objects.
      const invoiceObject = JSON.parse(formData.get('invoiceObject') as string);
      
      rawData = {
        invoiceObject: invoiceObject,
        subject: formData.get('subject'),
        body: formData.get('body'),
      };
    
    const validatedData = sendInvoiceSchema.parse(rawData);
    const invoice = validatedData.invoiceObject as Invoice;

    await sendEmail({
      to: invoice.customerEmail,
      subject: validatedData.subject,
      html: validatedData.body.replace(/\n/g, '<br>'), // Convert newlines to breaks for HTML email
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
