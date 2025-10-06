'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceUpdateInput, type Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

// remove undefined props
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

export default function EditInvoicePageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id?: string };
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
    if (authLoading) return; // wait for auth
    if (!user || typeof id !== 'string' || !db) {
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'users', user.uid, 'invoices', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast({ variant: 'destructive', title: 'Error', description: 'Invoice not found.' });
          router.push('/');
          return;
        }
        setInvoice({ id: snap.id, ...snap.data() } as Invoice);
      } catch (err: any) {
        console.error('Firestore read failed:', { code: err?.code, message: err?.message });
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch invoice data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, router, toast, user, authLoading]);

  const handleUpdateInvoice = async (data: InvoiceUpdateInput) => {
    const db = getFirestoreDb();
    if (!db || !user || typeof id !== 'string') return;

    try {
      const ref = doc(db, 'users', user.uid, 'invoices', id);

      // Normalize items + recalc totals
      const items = (data.items ?? []).map((it) => {
        const price = Number(it.price ?? 0);
        const quantity = Number(it.quantity ?? 0);
        return {
          name: it.name ?? '',
          specification: it.specification ?? '',
          price,
          quantity,
          lineTotal: price * quantity,
        };
      });

      const subtotal = items.reduce((s, it) => s + (Number(it.lineTotal) || 0), 0);
      const discountValue = Number(data.discount ?? 0);
      const discountAmount =
        data.discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
      const total = Math.max(0, subtotal - discountAmount);

      // Build update payload (ownerId is NOT part of InvoiceUpdateInput and isn’t taken from the form)
      const dataToUpdate: Record<string, any> = {
        ...stripUndefined(data),
        invoiceDate: Timestamp.fromDate(data.invoiceDate),
        dueDate: Timestamp.fromDate(data.dueDate),
        items,
        subtotal,
        discount: discountValue,
        total,
        // optionally add updatedAt if you track it server-side too
        // updatedAt: Timestamp.now(),
      };

      // Ensure forbidden fields are not accidentally included
      delete dataToUpdate.ownerId;   // never editable via form
      delete dataToUpdate.createdAt; // not part of updates

      await updateDoc(ref, dataToUpdate);

      toast({ title: 'Success', description: 'Invoice updated successfully.' });
      router.push(`/invoices/${id}`);
    } catch (err: any) {
      console.error('Error updating invoice:', { code: err?.code, message: err?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update invoice.' });
    }
  };

  if (loading || authLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AuthGuard>
    );
  }

  if (!invoice) {
    return (
      <AuthGuard>
        <Header />
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <p>The invoice you are looking for does not exist or has been deleted.</p>
          <Button asChild className="mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Invoices
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href={`/invoices/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoice
              </Link>
            </Button>
          </div>
          <InvoiceForm mode="edit" initialData={invoice} onSubmit={handleUpdateInvoice} />
        </div>
      </div>
    </AuthGuard>
  );
}
