'use client';

import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

// Helper to safely convert values to Firestore Timestamps
function toTimestamp(v: unknown): Timestamp | null {
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (v instanceof Timestamp) return v;
  if (typeof v === 'string' && v) {
    const date = new Date(v);
    if (!isNaN(date.getTime())) return Timestamp.fromDate(date);
  }
  return null;
}

// Helper to remove any `undefined` properties from an object
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  }
  return newObj;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateInvoice = async (data: Omit<InvoiceFormData, 'createdAt' | 'ownerId'>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      const invoiceNumber = data.invoiceNumber?.trim();

      // If an invoice number is provided, check for uniqueness
      if (invoiceNumber) {
        const invoicesRef = collection(db, 'users', user.uid, 'invoices');
        const q = query(invoicesRef, where("invoiceNumber", "==", invoiceNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Duplicate Invoice Number',
                description: `Invoice number "${invoiceNumber}" already exists. Please use a unique number.`,
            });
            return;
        }
      }

      // Coerce items and totals to ensure correct types and prevent undefined values
      const items = (data.items || []).map(it => {
        const price = Number(it.price || 0);
        const quantity = Number(it.quantity || 0);
        return {
          name: it.name || '',
          specification: it.specification || '',
          price,
          quantity,
          lineTotal: price * quantity,
        };
      });
      
      const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);

      const discountValue = Number(data.discount || 0);
      const discountAmount = data.discountType === 'percentage'
        ? subtotal * (discountValue / 100)
        : discountValue;
    
      const total = subtotal - discountAmount;

      // Build a clean payload, ensuring no undefined values are sent to Firestore
      const payload = stripUndefined({
        createdAt: serverTimestamp(),
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: toTimestamp(data.invoiceDate) || serverTimestamp(),
        dueDate: toTimestamp(data.dueDate),
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        items,
        subtotal,
        discount: discountValue,
        discountType: data.discountType || 'percentage',
        total,
        status: data.status || 'draft',
      });

      const docRef = await addDoc(collection(db, 'users', user.uid, 'invoices'), payload);

      toast({ title: 'Success', description: 'Invoice created successfully.' });
      router.push(`/invoices/${docRef.id}`);
    } catch (error: any) {
      console.error('Firestore write failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error Creating Invoice',
        description: `Code: ${error.code || 'N/A'}. ${error.message || 'An unknown error occurred.'}`,
      });
    }
  };

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
           <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Link>
            </Button>
          </div>
          <InvoiceForm
            onSubmit={handleCreateInvoice}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
