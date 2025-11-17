
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import InvoicePDF from '@/components/invoices/invoice-pdf';
import InvoiceActions from '@/components/invoices/invoice-actions';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import GenerateReminderDialog from '@/components/invoices/generate-reminder-dialog';
import SendInvoiceDialog from '@/components/invoices/send-invoice-dialog';

function InvoiceDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const ownerId = searchParams.get('ownerId');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isSendInvoiceDialogOpen, setIsSendInvoiceDialogOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (authLoading || typeof id !== 'string' || !db) {
        if (!authLoading) setLoading(false);
        return;
    };
    
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        let docRef;

        if (ownerId) {
          docRef = doc(db, 'users', ownerId, 'invoices', id);
        } else if (user) {
          // Fallback for direct navigation or old links
          docRef = doc(db, 'users', user.uid, 'invoices', id);
        } else {
            setLoading(false);
            return;
        }
        
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedOwnerId = docSnap.ref.parent.parent?.id || 'unknown';
          setInvoice({ id: docSnap.id, ownerId: fetchedOwnerId, ...docSnap.data() } as Invoice);
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
  }, [id, ownerId, user, router, toast, authLoading]);

  const handleStatusChange = async (status: Invoice['status']) => {
    const db = getFirestoreDb();
    if (!invoice || !invoice.ownerId || !db) return;
    try {
      const docRef = doc(db, 'users', invoice.ownerId, 'invoices', invoice.id);
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
    if (!invoice || !invoice.ownerId || !db) return;
    try {
      await deleteDoc(doc(db, 'users', invoice.ownerId, 'invoices', invoice.id));
      toast({ title: 'Success', description: 'Invoice deleted successfully.' });
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting invoice:', { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete invoice.' });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };
  
  const handleEmailSent = () => {
      if (invoice?.status === 'draft') {
          handleStatusChange('sent');
      }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section id="invoice-print" className="bg-card rounded-xl shadow overflow-hidden max-w-full">
             <div className="mx-auto w-full max-w-[1100px]">
                <InvoicePDF invoice={invoice} />
            </div>
          </section>

          <aside className="print:hidden">
              <div className="sticky top-6 space-y-3">
                   <InvoiceActions
                    invoice={invoice}
                    onStatusChange={handleStatusChange}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                    onGenerateReminder={() => setIsReminderDialogOpen(true)}
                    onSendInvoice={() => setIsSendInvoiceDialogOpen(true)}
                   />
              </div>
          </aside>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this invoice and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerateReminderDialog
        isOpen={isReminderDialogOpen}
        setIsOpen={setIsReminderDialogOpen}
        invoice={invoice}
      />

      <SendInvoiceDialog
        isOpen={isSendInvoiceDialogOpen}
        setIsOpen={setIsSendInvoiceDialogOpen}
        invoice={invoice}
        onEmailSent={handleEmailSent}
      />
    </>
  );
}


export default function InvoiceDetailPageContent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
      <InvoiceDetailContent />
    </Suspense>
  )
}
