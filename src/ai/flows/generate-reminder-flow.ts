'use server';
/**
 * @fileOverview A Genkit flow for generating a reminder email for an invoice.
 *
 * - generateReminderEmail - A function that generates the email content.
 * - GenerateReminderInput - The input type for the flow.
 * - GenerateReminderOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns';

const GenerateReminderInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  invoiceNumber: z.string().describe('The invoice number.'),
  dueDate: z.string().describe('The due date of the invoice in a readable format (e.g., "July 26, 2024").'),
  totalAmount: z.string().describe('The total amount of the invoice, formatted as a currency (e.g., "$1,234.56").'),
});
export type GenerateReminderInput = z.infer<typeof GenerateReminderInputSchema>;

const GenerateReminderOutputSchema = z.object({
  subject: z.string().describe('The subject line for the reminder email.'),
  body: z.string().describe('The body content of the reminder email, formatted in plain text.'),
});
export type GenerateReminderOutput = z.infer<typeof GenerateReminderOutputSchema>;

export async function generateReminderEmail(input: GenerateReminderInput): Promise<GenerateReminderOutput> {
  return generateReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReminderPrompt',
  input: {schema: GenerateReminderInputSchema},
  output: {schema: GenerateReminderOutputSchema},
  prompt: `You are an expert accountant's assistant. Your task is to write a polite, professional, and clear reminder email to a client about an upcoming or overdue invoice.

The tone should be friendly but firm, especially if the invoice is past due.

Use the following information to draft the email:
Client's Name: {{{customerName}}}
Invoice Number: {{{invoiceNumber}}}
Due Date: {{{dueDate}}}
Total Amount: {{{totalAmount}}}

Generate a subject line and a body for the email. The body should be plain text, with newlines for paragraph breaks. Do not include any HTML.
Keep the email concise and to the point.
`,
});

const generateReminderFlow = ai.defineFlow(
  {
    name: 'generateReminderFlow',
    inputSchema: GenerateReminderInputSchema,
    outputSchema: GenerateReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
