'use server';
/**
 * @fileOverview A Genkit flow for generating an email to send a new invoice.
 *
 * - generateInvoiceEmail - A function that generates the email content.
 * - GenerateInvoiceEmailInput - The input type for the flow.
 * - GenerateInvoiceEmailOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateInvoiceEmailInputSchema = z.object({
  customerName: z.string().describe("The name of the customer."),
  invoiceNumber: z.string().describe("The invoice number."),
  dueDate: z.string().describe('The due date of the invoice in a readable format (e.g., "July 26, 2024").'),
  totalAmount: z.string().describe('The total amount of the invoice, formatted as a currency (e.g., "$1,234.56").'),
  invoiceLink: z.string().describe("A link where the customer can view the invoice online.")
});
export type GenerateInvoiceEmailInput = z.infer<typeof GenerateInvoiceEmailInputSchema>;

const GenerateInvoiceEmailOutputSchema = z.object({
  subject: z.string().describe("The subject line for the invoice email."),
  body: z.string().describe("The body content of the invoice email, formatted in plain text with newlines."),
});
export type GenerateInvoiceEmailOutput = z.infer<typeof GenerateInvoiceEmailOutputSchema>;

export async function generateInvoiceEmail(input: GenerateInvoiceEmailInput): Promise<GenerateInvoiceEmailOutput> {
  return generateInvoiceEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvoiceEmailPrompt',
  input: {schema: GenerateInvoiceEmailInputSchema},
  output: {schema: GenerateInvoiceEmailOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert accountant's assistant. Your task is to write a polite, professional, and clear email to a client attaching a new invoice.

The tone should be friendly and professional.

Use the following information to draft the email:
Client's Name: {{{customerName}}}
Invoice Number: {{{invoiceNumber}}}
Due Date: {{{dueDate}}}
Total Amount: {{{totalAmount}}}
Link to Invoice: {{{invoiceLink}}}

Generate a subject line and a body for the email. The body should be plain text, with newlines for paragraph breaks. Do not include any HTML.
The email should clearly state that a new invoice is attached, mention the key details (number, due date, amount), and provide the link for them to view it.
Keep the email concise and to the point.
`,
});

const generateInvoiceEmailFlow = ai.defineFlow(
  {
    name: 'generateInvoiceEmailFlow',
    inputSchema: GenerateInvoiceEmailInputSchema,
    outputSchema: GenerateInvoiceEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
