'use client';

import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceFormData, invoiceSchema } from '@/types';
import { generateInvoiceNumber } from '@/ai/flows/generate-invoice-number';

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    if (!auth.currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      const newInvoiceRef = doc(collection(db, 'invoices'));
      await setDoc(newInvoiceRef, {
        ...data,
        id: newInvoiceRef.id,
        ownerId: auth.currentUser.uid,
        createdAt: Timestamp.now(),
      });

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
            generateInvoiceNumber={generateInvoiceNumber}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
