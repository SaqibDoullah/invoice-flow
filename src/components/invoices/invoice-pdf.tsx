'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { type Invoice } from '@/types';
import StatusBadge from './status-badge';
import { Separator } from '../ui/separator';
import { FileText } from 'lucide-react';
import { db, auth } from '@/lib/firebase';

interface InvoicePDFProps {
  invoice: Invoice;
}

interface CompanyInfo {
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
}

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

    useEffect(() => {
      const fetchCompanyInfo = async () => {
        if (!auth.currentUser) return;
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompanyInfo(docSnap.data());
        }
      };
      fetchCompanyInfo();
    }, []);

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
    <div className="text-foreground">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center text-3xl font-bold text-primary">
                <FileText className="h-8 w-8 mr-2"/>
                <h1>{companyInfo.companyName || 'InvoiceFlow'}</h1>
            </div>
            <p className="text-muted-foreground">{companyInfo.companyAddress || '123 Business St, Suite 100'}</p>
            <p className="text-muted-foreground">{companyInfo.companyCity || 'City, State, 12345'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold uppercase tracking-wider">Invoice</h2>
            <p className="text-muted-foreground mt-2">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-muted-foreground mb-2">BILL TO</h3>
            <p className="font-bold text-lg">{invoice.customerName}</p>
            <p>{invoice.customerEmail}</p>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-2">
                <span className="font-semibold text-muted-foreground">Invoice Date:</span>
                <span>{format(invoice.createdAt.toDate(), 'PPP')}</span>
            </div>
             <div className="grid grid-cols-2 mt-1">
                <span className="font-semibold text-muted-foreground">Due Date:</span>
                <span>{format(invoice.dueDate.toDate(), 'PPP')}</span>
            </div>
            <div className="grid grid-cols-2 mt-1">
                <span className="font-semibold text-muted-foreground">Status:</span>
                <div className="flex justify-end"><StatusBadge status={invoice.status} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold text-center w-20">Qty</th>
              <th className="p-3 font-semibold text-right w-32">Price</th>
              <th className="p-3 font-semibold text-right w-32">Total</th>
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

      <section className="flex justify-end">
        <div className="w-full max-w-xs space-y-2">
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

      <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
      </footer>
    </div>
  );
}
