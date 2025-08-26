'use client';

import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      const newInvoiceRef = doc(collection(db, 'invoices'));
      
      const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}`;

      const invoiceData = {
        ...data,
        id: newInvoiceRef.id,
        invoiceNumber,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        invoiceDate: Timestamp.fromDate(data.invoiceDate),
        dueDate: Timestamp.fromDate(data.dueDate),
      };
      
      await setDoc(newInvoiceRef, invoiceData);

      toast({ title: 'Success', description: 'Invoice created successfully.' });
      router.push(`/invoices/${newInvoiceRef.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create invoice.' });
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
