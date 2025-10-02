'use client';

import * as React from 'react';
import { format } from 'date-fns';

import { type Invoice } from '@/types';
import StatusBadge from './status-badge';
import { Separator } from '../ui/separator';

interface InvoicePDFProps {
  invoice: Invoice;
}

/** Safely coerce Firestore Timestamp | Date | string to Date */
function toDate(v: any): Date {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate();
  if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
  }
  // Return a placeholder date if conversion fails to avoid crashing
  return new Date(0);
}

// This component is rendered on the server to generate a PDF, but also used on the client.
// forwardRef was causing issues with ReactDOMServer.renderToString, so we use a simple functional component.
export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatCurrency = (amount: number | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      amount ?? 0
    );

  const getDiscountAmount = () => {
    if (!invoice.discount) return 0;
    if (invoice.discountType === 'fixed') return invoice.discount;
    return (invoice.subtotal ?? 0) * ((invoice.discount ?? 0) / 100);
  };

  const discountAmount = getDiscountAmount();

  const invoiceDate = toDate(invoice.invoiceDate);
  const dueDate = toDate(invoice.dueDate);
  
  return (
    <div
      id="invoice-print"
      className="
        not-prose
        p-6 sm:p-8
        mx-auto w-full
        max-w-[1100px]         /* clamp width on wide screens */
        print:max-w-none       /* let @page define width for PDF */
      "
    >
      {/* Header */}
      <header className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="md:pr-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary uppercase leading-tight tracking-wider">
              {invoice.companyName || 'Your Company'}
            </h1>
            {invoice.companyAddress && (
              <p className="text-muted-foreground mt-2 text-sm">
                {invoice.companyAddress}
              </p>
            )}
            {invoice.companyCity && (
              <p className="text-muted-foreground text-sm">
                {invoice.companyCity}
              </p>
            )}
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-4xl font-bold uppercase tracking-wider text-foreground">
              Invoice
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              # {invoice.invoiceNumber}
            </p>
          </div>
        </div>
      </header>

      {/* Bill To + Dates */}
      <section className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Bill To
            </h3>
            <p className="font-bold text-base">{invoice.customerName}</p>
            {invoice.customerEmail && (
              <p className="text-muted-foreground text-sm">{invoice.customerEmail}</p>
            )}
          </div>

          <div className="space-y-2 md:text-right">
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Invoice Date:</span>
              <span>{invoiceDate.getTime() !== 0 ? format(invoiceDate, 'PPP') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Due Date:</span>
              <span>{dueDate.getTime() !== 0 ? format(dueDate, 'PPP') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Status:</span>
              <div className="flex justify-end">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[420px]">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">Product</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-center w-20">Qty</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right w-32">Price</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{item.name}</p>
                    {item.specification && (
                      <p className="text-sm text-muted-foreground break-words">
                        {item.specification}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals */}
      <section className="flex justify-end mt-10 sm:mt-12 avoid-break">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Discount (
              {invoice.discountType === 'percentage'
                ? `${invoice.discount ?? 0}%`
                : formatCurrency(invoice.discount ?? 0)}
              )
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-xl text-primary">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-16 sm:mt-20 pt-6 border-t text-center text-sm text-muted-foreground avoid-break">
        <p>Thank you for your business!</p>
      </footer>
    </div>
  );
}
