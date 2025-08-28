
'use client';

import * as React from 'react';
import { format } from 'date-fns';

import { type Invoice } from '@/types';
import StatusBadge from './status-badge';
import { Separator } from '../ui/separator';
import { FileText } from 'lucide-react';

interface InvoicePDFProps {
  invoice: Invoice;
}

const InvoicePDF = React.forwardRef<HTMLDivElement, InvoicePDFProps>(({ invoice }, ref) => {
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const getDiscountAmount = () => {
        if (!invoice.discount) return 0;
        if (invoice.discountType === 'fixed') {
            return invoice.discount;
        }
        return invoice.subtotal * (invoice.discount / 100);
    }
    
    const discountAmount = getDiscountAmount();

  return (
    <div ref={ref} className="text-foreground bg-card p-4 rounded-lg">
      <header className="mb-12">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary uppercase">{invoice.companyName || 'Your Company'}</h1>
                <p className="text-sm text-muted-foreground">{invoice.companyAddress}</p>
                <p className="text-sm text-muted-foreground">{invoice.companyCity}</p>
              </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold uppercase tracking-wider text-gray-800">Invoice</h2>
            <p className="text-muted-foreground mt-1 text-sm"># {invoice.invoiceNumber}</p>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">BILL TO</h3>
            <p className="font-bold text-lg">{invoice.customerName}</p>
            <p className="text-muted-foreground">{invoice.customerEmail}</p>
          </div>
          <div className="text-right space-y-2">
            <div className="grid grid-cols-2 items-center gap-1">
                <span className="font-semibold">Invoice Date:</span>
                <span>{format(invoice.invoiceDate.toDate(), 'PPP')}</span>
            </div>
             <div className="grid grid-cols-2 items-center gap-1">
                <span className="font-semibold">Due Date:</span>
                <span>{format(invoice.dueDate.toDate(), 'PPP')}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-1">
                <span className="font-semibold">Status:</span>
                <div className="flex justify-end"><StatusBadge status={invoice.status} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <table className="w-full text-left">
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
                    <p className="text-sm text-muted-foreground">{item.specification}</p>
                  )}
                </td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                <td className="p-3 text-right">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end mt-12">
        <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Discount ({invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount)})</span>
                <span>-{formatCurrency(discountAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-xl text-primary">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
            </div>
        </div>
      </section>

      <footer className="mt-20 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
      </footer>
    </div>
  );
});

InvoicePDF.displayName = 'InvoicePDF';

export default InvoicePDF;
