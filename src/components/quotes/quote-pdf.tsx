
'use client';

import * as React from 'react';
import { format } from 'date-fns';

import { type Quote } from '@/types';
import StatusBadge from './status-badge';
import { Separator } from '../ui/separator';

interface QuotePDFProps {
  quote: Quote;
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

export default function QuotePDF({ quote }: QuotePDFProps) {
  const formatCurrency = (amount: number | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      amount ?? 0
    );

  const getDiscountAmount = () => {
    if (!quote.discount) return 0;
    if (quote.discountType === 'fixed') return quote.discount;
    return (quote.subtotal ?? 0) * ((quote.discount ?? 0) / 100);
  };

  const discountAmount = getDiscountAmount();

  const quoteDate = toDate(quote.quoteDate);
  const expiryDate = toDate(quote.expiryDate);
  
  return (
    <div
      id="quote-print"
      className="not-prose p-6 sm:p-8 mx-auto w-full max-w-[1100px] print:max-w-none"
    >
      <header className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="md:pr-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary uppercase leading-tight tracking-wider">
              {quote.companyName || 'Your Company'}
            </h1>
            {quote.companyAddress && (
              <p className="text-muted-foreground mt-2 text-sm">
                {quote.companyAddress}
              </p>
            )}
            {quote.companyCity && (
              <p className="text-muted-foreground text-sm">
                {quote.companyCity}
              </p>
            )}
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-4xl font-bold uppercase tracking-wider text-foreground">
              Quote
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              # {quote.quoteNumber}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-10 sm:mb-12 avoid-break">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Quote For
            </h3>
            <p className="font-bold text-base">{quote.customerName}</p>
            {quote.customerEmail && (
              <p className="text-muted-foreground text-sm">{quote.customerEmail}</p>
            )}
          </div>

          <div className="space-y-2 md:text-right">
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Quote Date:</span>
              <span>{quoteDate.getTime() !== 0 ? format(quoteDate, 'PPP') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Expiry Date:</span>
              <span>{expiryDate.getTime() !== 0 ? format(expiryDate, 'PPP') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <span className="font-semibold">Status:</span>
              <div className="flex justify-end">
                <StatusBadge status={quote.status} />
              </div>
            </div>
          </div>
        </div>
      </section>

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
              {quote.items.map((item, index) => (
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

      <section className="flex justify-end mt-10 sm:mt-12 avoid-break">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Discount (
              {quote.discountType === 'percentage'
                ? `${quote.discount ?? 0}%`
                : formatCurrency(quote.discount ?? 0)}
              )
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-xl text-primary">
            <span>Total</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-16 sm:mt-20 pt-6 border-t text-center text-sm text-muted-foreground avoid-break">
        <p>This quote is valid until {expiryDate.getTime() !== 0 ? format(expiryDate, 'PPP') : 'N/A'}.</p>
      </footer>
    </div>
  );
}
