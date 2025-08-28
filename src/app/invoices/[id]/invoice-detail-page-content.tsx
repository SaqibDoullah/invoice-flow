
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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

export default function InvoiceDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    if (!componentRef.current) return;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not open print window. Please disable your pop-up blocker.',
      });
      return;
    }
    const printContent = componentRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            @media print {
              @page { size: auto;  margin: 0mm; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

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
    } finally {
        setIsDeleteDialogOpen(false);
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
              <InvoicePDF invoice={invoice} ref={componentRef} />
            </div>
            <div className="md:col-span-1 mt-6 md:mt-0">
               <InvoiceActions
                invoice={invoice}
                onStatusChange={handleStatusChange}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onGenerateReminder={() => setIsReminderDialogOpen(true)}
                onPrint={handlePrint}
               />
            </div>
          </div>
        </div>
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
    </AuthGuard>
  );
}
