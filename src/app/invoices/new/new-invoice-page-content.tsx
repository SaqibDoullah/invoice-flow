
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDoc, collection, serverTimestamp, Timestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceForm from '@/components/invoices/invoice-form';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type InvoiceFormData, type Invoice } from '@/types';
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

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [initialData, setInitialData] = useState<Partial<InvoiceFormData> | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  const duplicateId = searchParams.get('duplicateId');

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || !db || authLoading) {
      if (!duplicateId) {
        // This is a new invoice, not a duplicate.
        // Set default values on the client to avoid hydration issues.
        const fetchUserSettings = async () => {
           let companyDetails = {};
            if (user && db) {
              const userDocRef = doc(db, 'users', user.uid);
              try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                  const userData = docSnap.data();
                  companyDetails = {
                    companyName: userData.companyName,
                    companyAddress: userData.companyAddress,
                    companyCity: userData.companyCity,
                  };
                }
              } catch (error) {
                console.error("Failed to fetch user settings for new invoice", error);
              }
            }

            setInitialData({
              ...companyDetails,
              invoiceDate: new Date(),
              dueDate: addDays(new Date(), 30),
              status: 'draft',
              items: [{ name: '', specification: '', price: 0, quantity: 1, lineTotal: 0 }],
              discount: 0,
              discountType: 'percentage',
            });
        }
        fetchUserSettings();
      }
       if(!authLoading) setLoadingInitialData(false);
      return;
    }

    const fetchInvoiceToDuplicate = async () => {
      if (!duplicateId) return;
      setLoadingInitialData(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'invoices', duplicateId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const invoiceData = docSnap.data() as Invoice;
          // Reset fields for duplication
          setInitialData({
            ...invoiceData,
            invoiceNumber: '', // Clear invoice number for duplication
            invoiceDate: new Date(),
            dueDate: addDays(new Date(), 30),
            status: 'draft',
          });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Invoice to duplicate not found.' });
        }
      } catch (error) {
        console.error("Error fetching invoice to duplicate:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load invoice data to duplicate.' });
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchInvoiceToDuplicate();
    
  }, [duplicateId, user, authLoading, toast]);


  const handleCreateInvoice = async (data: Omit<InvoiceFormData, 'createdAt' | 'ownerId'>) => {
    const db = getFirestoreDb();
    if (!user || !db) {
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
        ...data,
        createdAt: serverTimestamp(),
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: toTimestamp(data.invoiceDate) || serverTimestamp(),
        dueDate: toTimestamp(data.dueDate),
        items,
        subtotal,
        discount: discountValue,
        total,
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

  if (authLoading || loadingInitialData || !initialData) {
     return (
      <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex flex-col min-h-screen">
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
          <InvoiceForm
            initialData={initialData as Invoice}
            onSubmit={handleCreateInvoice}
          />
        </div>
      </div>
  );
}

export default function NewInvoicePageContent() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
        <NewInvoiceContent />
      </Suspense>
    </AuthGuard>
  );
}
