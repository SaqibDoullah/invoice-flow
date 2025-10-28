
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

export const quoteSchema = z.object({
  quoteNumber: z.string().optional(),
  customerId: z.string().min(1, 'Please select a customer.'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  quoteDate: z.date(),
  expiryDate: z.date(),
  status: z.enum(['draft', 'sent', 'accepted', 'declined']),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  subtotal: z.number(),
  discount: z.coerce.number().min(0, 'Discount must be non-negative').default(0),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  total: z.number(),
  createdAt: z.custom<Timestamp>(),
  ownerId: z.string().optional(),
  // Company details per quote
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

export type QuoteFormData = z.infer<typeof quoteSchema>;

export interface Quote
  extends Omit<
    QuoteFormData,
    'quoteDate' | 'expiryDate' | 'quoteNumber' | 'createdAt' | 'ownerId'
  > {
  id: string;
  quoteNumber: string;
  createdAt: Timestamp;
  quoteDate: Timestamp;
  expiryDate: Timestamp;
  discount: number;
}

export type QuoteCreateInput = Omit<QuoteFormData, 'id' | 'createdAt' | 'ownerId'>;
export type QuoteUpdateInput = Omit<QuoteFormData, 'createdAt' | 'ownerId'>;


export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
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
    quantityReserved: z.coerce.number().optional(),
    quantityOnOrder: z.coerce.number().optional(),
    quantityAvailable: z.coerce.number().optional(),
    salesVelocity: z.coerce.number().optional(),
    averageCost: z.coerce.number().optional(),
    totalValue: z.coerce.number().optional(),
    casesOnHand: z.coerce.number().optional(),
    casesOnOrder: z.coerce.number().optional(),
    casesAvailable: z.coerce.number().optional(),
    sublocation: z.string().optional(),
    productStatus: z.string().optional(),
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    stdBuyPrice: z.coerce.number().optional(),
    stdPacking: z.string().optional(),
    stdBinId: z.string().optional(),
    unitOfMeasure: z.string().optional(),
    stdAccountingCost: z.coerce.number().optional(),
    lastPurchasePrice: z.coerce.number().optional(),
    lastPurchaseDate: z.date().optional(),
    // Reordering
    reorderCalculationMethod: z.string().optional(),
    stdReorderPoint: z.coerce.number().optional(),
    stdReorderPointMax: z.coerce.number().optional(),
    stdReorderInQtyOf: z.coerce.number().optional(),
    // Selling
    itemPrice: z.coerce.number().optional(),
    casePrice: z.coerce.number().optional(),
    stdLeadDays: z.coerce.number().optional(),
    amazonAsin: z.string().optional(),
    upc: z.string().optional(),
    ean: z.string().optional(),
    code128: z.string().optional(),
    // Manufacturer
    mfgProductId: z.string().optional(),
    // Shipping
    weightPerUnit: z.coerce.number().optional(),
    weightUnit: z.string().optional(),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export interface InventoryItem extends InventoryItemFormData {
    id: string;
    supplier?: Supplier;
}

export const productLookupFormSchema = z.object({
  productLookup: z.string().min(1, 'Product lookup is required'),
  productId: z.string().optional(),
  notes: z.string().optional(),
  lotId: z.string().optional(),
  packing: z.string().optional(),
  stores: z.string().optional(),
});

export type ProductLookupFormData = z.infer<typeof productLookupFormSchema>;

export interface ProductLookup extends ProductLookupFormData {
    id: string;
    description: string;
    status: 'Active' | 'Inactive';
}

export const productGroupSchema = z.object({
    type: z.enum(['Goods', 'Service']),
    name: z.string().min(1, "Item Group Name is required"),
    description: z.string().optional(),
    isReturnable: z.boolean().default(false),
    unit: z.string().optional(),
    manufacturer: z.string().optional(),
    brand: z.string().optional(),
    valuationMethod: z.string().default('FIFO'),
    createAttributes: z.boolean().default(false),
    attributes: z.array(z.object({
        attribute: z.string(),
        options: z.string(),
    })).optional(),
    itemType: z.array(z.string()).optional(),
});

export type ProductGroupFormData = z.infer<typeof productGroupSchema>;

export interface ProductGroup extends ProductGroupFormData {
    id: string;
    // Add other fields as they are defined for Firestore
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

export interface BillPayment {
    id: string;
    status: 'Draft' | 'Posted';
    date: Date;
    paymentId: string;
    supplier: string | null;
    amount: number;
    method: string | null;
    recordCreated: Date;
    recordLastUpdated: Date;
}

export interface StockHistoryEntry {
    id: string;
    recordDate: Timestamp;
    user: string;
    timestamp: Timestamp;
    productId: string;
    description: string;
    sublocation: string;
    transaction: string;
    quantity: number;
    onHand: number;
    avgCost: number;
    amount: number;
    balance: number;
    details: string;
    warning: string;
    packing: string;
    lotId: string;
}

export interface SalesOrder {
    id: string;
    orderId: string;
    orderDate: Date | Timestamp;
    customerId: string | null;
    source: string;
    origin: string;
    estimatedShipDate: Date | Timestamp | null;
    customerPO: string;
    fulfillment: string;
    terms: string;
    requestedShipping: string;
    priceLevel: string;
    batchId: string;
    billToAddress: string;
    shipToAddress: string;
    employeeName: string;
    productType: string;
    salesPerson: string;
    businessType: string;
    items: LineItem[];
    subtotal: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
    total: number;
    status: 'Draft' | 'Committed' | 'Completed' | 'Canceled';
}
