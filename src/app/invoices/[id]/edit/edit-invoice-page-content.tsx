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
import { type InvoiceFormData, type Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

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

export default function EditInvoicePageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
     if (authLoading || !user || typeof id !== 'string' || !db) {
        if (!authLoading) setLoading(false);
        return;
    };
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'invoices', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInvoice({ id: docSnap.id, ...docSnap.data() } as Invoice);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Invoice not found.' });
          router.push('/');
        }
      } catch (error: any) {
        console.error('Firestore read failed:', { code: error?.code, message: error?.message });
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch invoice data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, router, toast, user, authLoading]);

  const handleUpdateInvoice = async (data: Omit<InvoiceFormData, 'createdAt'>) => {
    const db = getFirestoreDb();
    if (typeof id !== 'string' || !user || !db) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'invoices', id);
      
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

      // Build a clean payload, excluding fields that shouldn't be updated
      const { ownerId, ...restOfData } = data;

      const dataToUpdate = stripUndefined({
        ...restOfData,
        invoiceDate: Timestamp.fromDate(data.invoiceDate),
        dueDate: Timestamp.fromDate(data.dueDate),
        items,
        subtotal,
        discount: discountValue,
        total,
      });

      await updateDoc(docRef, dataToUpdate);
      toast({ title: 'Success', description: 'Invoice updated successfully.' });
      router.push(`/invoices/${id}`);
    } catch (error: any) {
      console.error('Error updating invoice:', { code: error?.code, message: error?.message });
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
    )
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
          <InvoiceForm initialData={invoice} onSubmit={handleUpdateInvoice} />
        </div>
      </div>
    </AuthGuard>
  );
}
