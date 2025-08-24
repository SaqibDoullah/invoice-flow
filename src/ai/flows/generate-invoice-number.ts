'use server';

/**
 * @fileOverview A flow to generate invoice numbers in the format INV-YYYY-#####.
 *
 * - generateInvoiceNumber - A function that generates a unique invoice number.
 * - GenerateInvoiceNumberInput - The input type for the generateInvoiceNumber function.
 * - GenerateInvoiceNumberOutput - The return type for the generateInvoiceNumber function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInvoiceNumberInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer.'),
});
export type GenerateInvoiceNumberInput = z.infer<typeof GenerateInvoiceNumberInputSchema>;

const GenerateInvoiceNumberOutputSchema = z.object({
  invoiceNumber: z
    .string()
    .describe('The generated invoice number in the format INV-YYYY-#####.'),
});
export type GenerateInvoiceNumberOutput = z.infer<typeof GenerateInvoiceNumberOutputSchema>;

export async function generateInvoiceNumber(input: GenerateInvoiceNumberInput): Promise<GenerateInvoiceNumberOutput> {
  return generateInvoiceNumberFlow(input);
}

const generateInvoiceNumberPrompt = ai.definePrompt({
  name: 'generateInvoiceNumberPrompt',
  input: {schema: GenerateInvoiceNumberInputSchema},
  output: {schema: GenerateInvoiceNumberOutputSchema},
  prompt: `You are an invoice number generator. Generate a unique invoice number in the format INV-YYYY-#####. Ensure that the generated invoice number is unique.

  Consider the customer ID: {{{customerId}}}. Use this ID to generate a unique part of the invoice number.
  Today's year is: {{year}}`,
  system: `When generating the invoice, take into account the year of the invoice. Every invoice should have a unique 5 digit suffix, reset every year.`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 256,
  },
});

const generateInvoiceNumberFlow = ai.defineFlow(
  {
    name: 'generateInvoiceNumberFlow',
    inputSchema: GenerateInvoiceNumberInputSchema,
    outputSchema: GenerateInvoiceNumberOutputSchema,
  },
  async input => {
    const year = new Date().getFullYear();
    const {output} = await generateInvoiceNumberPrompt({...input, year});
    return output!;
  }
);
