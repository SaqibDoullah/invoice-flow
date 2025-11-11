
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Workflow } from 'lucide-react';

import { type Invoice } from '@/types';

interface InvoicePDFProps {
  invoice: Invoice;
}

function toDate(v: any): Date {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate();
  if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatCurrency = (amount: number | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      amount ?? 0
    );

  const invoiceDate = toDate(invoice.invoiceDate);
  const dueDate = toDate(invoice.dueDate);
  
  return (
    <div
      id="invoice-print"
      className="
        not-prose
        p-6 sm:p-8
        mx-auto w-full
        bg-white text-gray-900
        max-w-[1100px]
        print:max-w-none
      "
    >
      <header className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 grid-cols-[1fr_auto] items-start">
          <div className="flex items-center gap-4">
             <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary/90 text-primary-foreground">
                <Workflow className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 uppercase leading-tight tracking-wider">
                {invoice.companyName || 'Heartland'}
              </h1>
          </div>

          <div className="text-right">
            <h2 className="text-4xl font-bold uppercase tracking-wider text-primary">
              INVOICE
            </h2>
            <div className="mt-4 space-y-1 text-sm">
                <div className="grid grid-cols-[120px_1fr] text-right">
                    <span className="font-semibold">INVOICE NUMBER:</span>
                    <span>{invoice.invoiceNumber}</span>
                </div>
                 <div className="grid grid-cols-[120px_1fr] text-right">
                    <span className="font-semibold">INVOICE DATE:</span>
                    <span>{invoiceDate.getTime() !== 0 ? format(invoiceDate, 'MM/dd/yyyy') : '-'}</span>
                </div>
                 <div className="grid grid-cols-[120px_1fr] text-right">
                    <span className="font-semibold">DUE DATE:</span>
                    <span>{dueDate.getTime() !== 0 ? format(dueDate, 'MM/dd/yyyy') : '-'}</span>
                </div>
            </div>
          </div>
        </div>
      </header>
      
      <hr className="my-8 border-gray-300" />

      <section className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border rounded-lg">
            <div className="bg-primary/80 text-white p-2 rounded-t-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                Ship from
                </h3>
            </div>
            <div className="p-4 text-sm">
                <p className="font-bold">{invoice.companyName || 'Heartland'}</p>
            </div>
          </div>
           <div className="border rounded-lg">
                <div className="bg-primary/80 text-white p-2 rounded-t-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Bill to
                    </h3>
                </div>
                <div className="p-4 text-sm">
                    <p className="font-bold">{invoice.customerName}</p>
                    {invoice.customerEmail && (
                        <p>{invoice.customerEmail}</p>
                    )}
                </div>
          </div>
          <div className="border rounded-lg">
                <div className="bg-primary/80 text-white p-2 rounded-t-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Ship to
                    </h3>
                </div>
                <div className="p-4 text-sm">
                     <p className="font-bold">{invoice.customerName}</p>
                </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">Product ID</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider w-2/5">Description</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-center w-24">Packing</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right w-24">Quantity</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right w-32">Price</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-3 align-top">{item.specification}</td>
                  <td className="p-3 align-top">{item.name}</td>
                  <td className="p-3 text-center align-top"></td>
                  <td className="p-3 text-right align-top">{item.quantity}</td>
                  <td className="p-3 text-right align-top">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right align-top">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex justify-between items-start mt-10 sm:mt-12 avoid-break">
        <div className="text-sm">
            <p className="font-semibold">We prefer ACH / Wire / Check payments</p>
            <p>Please note that credit / Debit cards will be charged 3.5% above the invoice amount</p>
        </div>
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Total paid:</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Outstanding balance:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </section>

    </div>
  );
}
