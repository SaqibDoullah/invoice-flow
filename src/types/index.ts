import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

export const lineItemSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  specification: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  lineTotal: z.number(),
});

export const invoiceSchema = z.object({
  ownerId: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  createdAt: z.custom<Timestamp>(),
  status: z.enum(['draft', 'sent', 'paid', 'void']),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number(),
  tax: z.coerce.number().min(0, 'Tax must be non-negative'),
  total: z.number(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

// The type for an invoice when being created or edited (Timestamp might not be set yet)
export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// The type for an invoice fetched from Firestore
export interface Invoice extends Omit<InvoiceFormData, 'createdAt'> {
  id: string;
  createdAt: Timestamp;
}
