'use client';

import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper to safely convert values to Firestore Timestamps
function toTimestamp(v: unknown): Timestamp | null {
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (typeof v === 'string' && v) return Timestamp.fromDate(new Date(v));
  return null;
}

// Helper to remove any `undefined` properties from an object
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
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

      const discountAmount = data.discountType === 'percentage'
        ? subtotal * ((Number(data.discount) || 0) / 100)
        : Number(data.discount) || 0;
    
      const total = subtotal - discountAmount;

      const invoiceNumber = data.invoiceNumber?.trim() || `INV-${Date.now()}`;

      // Build a clean payload, ensuring no undefined values are sent to Firestore
      const payload = stripUndefined({
        // Ownership & metadata
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        invoiceNumber,

        // Dates (allow nulls, but not undefined)
        invoiceDate: toTimestamp((data as any).invoiceDate) || serverTimestamp(),
        dueDate: toTimestamp((data as any).dueDate),

        // Customer info
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',

        // Items & totals
        items,
        subtotal,
        discount: Number(data.discount || 0),
        discountType: data.discountType || 'percentage',
        total,

        // Status
        status: (data.status as any) || 'draft',
      });

      const docRef = await addDoc(collection(db, 'invoices'), payload);

      toast({ title: 'Success', description: 'Invoice created successfully.' });
      router.push(`/invoices/${docRef.id}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create invoice.',
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
