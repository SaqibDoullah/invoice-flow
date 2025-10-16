
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
  invoiceNumber: z.string().optional(),
  customerId: z.string().min(1, 'Please select a customer.'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  invoiceDate: z.date(),
  dueDate: z.date(),
  status: z.enum(['draft', 'sent', 'paid', 'void']),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number(),
  discount: z.coerce.number().min(0, 'Discount must be non-negative').default(0),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  total: z.number(),
  createdAt: z.custom<Timestamp>(),
  ownerId: z.string().optional(),
  // Company details per invoice
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
});

export type LineItem = z.infer<typeof lineItemSchema>;

// The type for an invoice when being created or edited in a form
export type InvoiceFormData = z.infer<typeof invoiceSchema>;


// The type for an invoice fetched from Firestore (dueDate is a Timestamp)
export interface Invoice
  extends Omit<
    InvoiceFormData,
    'invoiceDate' | 'dueDate' | 'invoiceNumber' | 'createdAt' | 'ownerId'
  > {
  id: string;
  invoiceNumber: string;
  createdAt: Timestamp;
  invoiceDate: Timestamp; // Firestore Timestamp on read
  dueDate: Timestamp;     // Firestore Timestamp on read

  // 👇 add/ensure this is REQUIRED to match the parent type
  discount: number;
}

export type InvoiceCreateInput = Omit<InvoiceFormData, 'id' | 'createdAt' | 'ownerId'>;
export type InvoiceUpdateInput = Omit<InvoiceFormData, 'createdAt' | 'ownerId'>;

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address').optional().or(z
.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export interface Customer extends CustomerFormData {
  id: string;
}

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

export interface Supplier extends SupplierFormData {
  id: string;
}

export const inventoryItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    sku: z.string().optional(),
    quantity: z.coerce.number().min(0, 'Quantity must be non-negative'),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    supplierId: z.string().optional(),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export interface InventoryItem extends InventoryItemFormData {
    id: string;
    supplier?: Supplier;
}

export interface PurchaseOrder {
    id: string;
    status: 'draft' | 'committed';
    orderDate: Date;
    orderId: string;
    supplierName: string;
    destination: string;
    shipments: string;
    estimatedReceiveDate: Date | null;
    total: number;
}

export interface Bill {
    id: string;
    status: 'Posted';
    billDate: Date;
    billDueDate: Date;
    billId: string;
    supplier: string;
    referenceNumber: string | null;
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
    paymentStatus: 'Unpaid' | 'Paid';
}
