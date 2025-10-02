'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { generateInvoicePdf } from '@/lib/generate-pdf';
import { type Invoice } from '@/types';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { auth } from 'firebase-admin';
import { headers } from 'next/headers';

const sendInvoiceSchema = z.object({
  invoiceId: z.string(),
  invoiceObject: z.any(), // Still needed for customer email, totals etc. on the action
  subject: z.string(),
  body: z.string(),
  ownerId: z.string(),
});

export async function sendInvoiceWithAttachment(formData: FormData) {
  let rawData;
  try {
      // Re-hydrate the invoice object. FormData can't handle complex objects.
      const invoiceObject = JSON.parse(formData.get('invoiceObject') as string);
      
      rawData = {
        invoiceId: formData.get('invoiceId'),
        invoiceObject: invoiceObject,
        subject: formData.get('subject'),
        body: formData.get('body'),
        ownerId: formData.get('ownerId'),
      };
    
    const validatedData = sendInvoiceSchema.parse(rawData);
    const invoice = validatedData.invoiceObject as Invoice;

    // 1. Generate PDF by calling our internal API
    const pdfBuffer = await generateInvoicePdf(validatedData.invoiceId, validatedData.ownerId);

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
