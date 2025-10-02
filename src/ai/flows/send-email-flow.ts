'use server';
/**
 * @fileOverview A Genkit flow for sending an email.
 *
 * - sendEmail - A function that handles sending the email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { sendEmail as sendEmailService } from '@/lib/email';
import { z } from 'zod';

export const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient of the email.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body of the email in plain text.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; message: string }> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      await sendEmailService({
        to: input.to,
        subject: input.subject,
        text: input.body,
      });
      return { success: true, message: 'Email sent successfully.' };
    } catch (error: any) {
      console.error('Error sending email:', error);
      // It's important to throw the error or return a structured error response
      // so the client-side can know the operation failed.
      return { success: false, message: error.message || 'Failed to send email.' };
    }
  }
);
