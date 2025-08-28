'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import InvoicePDF from '@/components/invoices/invoice-pdf';
import InvoiceActions from '@/components/invoices/invoice-actions';
import { useAuth } from '@/context/auth-context';

export default function InvoiceDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
          toast({ variant: 'destructive', title: 'Error', description: 'Invoice not found or you do not have permission to view it.' });
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

  const handleStatusChange = async (status: Invoice['status']) => {
    const db = getFirestoreDb();
    if (!invoice || !user || !db) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'invoices', invoice.id);
      await updateDoc(docRef, { status });
      setInvoice(prev => prev ? { ...prev, status } : null);
      toast({ title: 'Success', description: `Invoice status updated to ${status}.` });
    } catch (error: any) {
      console.error('Error updating status:', { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    const db = getFirestoreDb();
    if (!invoice || !user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'invoices', invoice.id));
      toast({ title: 'Success', description: 'Invoice deleted successfully.' });
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting invoice:', { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete invoice.' });
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
      <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <div className="flex-1 container mx-auto p-4 md:p-8">
           <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Link>
            </Button>
          </div>

          <div className="md:grid md:grid-cols-4 md:gap-8">
            <div className="md:col-span-3">
              <div ref={componentRef} className="bg-background p-8 rounded-lg shadow-sm">
                <InvoicePDF invoice={invoice} />
              </div>
            </div>
            <div className="md:col-span-1 mt-6 md:mt-0">
               <InvoiceActions
                invoice={invoice}
                onPrint={handlePrint}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
               />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}