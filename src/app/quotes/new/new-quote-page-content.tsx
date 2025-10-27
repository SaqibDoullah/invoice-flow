
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDoc, collection, serverTimestamp, Timestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import QuoteForm from '@/components/quotes/quote-form';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type QuoteCreateInput, type Quote } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

function toTimestamp(v: unknown): Timestamp | null {
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (v instanceof Timestamp) return v;
  if (typeof v === 'string' && v) {
    const date = new Date(v);
    if (!isNaN(date.getTime())) return Timestamp.fromDate(date);
  }
  return null;
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  }
  return newObj;
}

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [initialData, setInitialData] = useState<Partial<QuoteCreateInput> | null>(null);

  const duplicateId = searchParams.get('duplicateId');

  useEffect(() => {
    const db = getFirestoreDb();
    if (authLoading || !user || !db) {
      return;
    }

    const fetchInitialData = async () => {
      if (duplicateId) {
        try {
          const docRef = doc(db, 'users', user.uid, 'quotes', duplicateId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const quoteData = docSnap.data() as Quote;
            setInitialData({
              ...quoteData,
              quoteNumber: '', 
              quoteDate: new Date(),
              expiryDate: addDays(new Date(), 30),
              status: 'draft',
            });
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Quote to duplicate not found.' });
            setInitialData({}); 
          }
        } catch (error) {
          console.error("Error fetching quote to duplicate:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load quote data to duplicate.' });
          setInitialData({});
        }
      } else {
        let companyDetails = {};
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
          console.error("Failed to fetch user settings for new quote", error);
        }
        
        setInitialData({
          ...companyDetails,
          quoteDate: new Date(),
          expiryDate: addDays(new Date(), 30),
          status: 'draft',
          items: [{ name: '', specification: '', price: 0, quantity: 1, lineTotal: 0 }],
          discount: 0,
          discountType: 'percentage',
        });
      }
    };
    
    fetchInitialData();

  }, [duplicateId, user, authLoading, toast]);


  const handleCreateQuote = async (data: QuoteCreateInput) => {
    const db = getFirestoreDb();
    if (!user || !db) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      const quoteNumber = data.quoteNumber?.trim();

      if (quoteNumber) {
        const quotesRef = collection(db, 'users', user.uid, 'quotes');
        const q = query(quotesRef, where("quoteNumber", "==", quoteNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Duplicate Quote Number',
                description: `Quote number "${quoteNumber}" already exists. Please use a unique number.`,
            });
            return;
        }
      }

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

      const payload = stripUndefined({
        ...data,
        createdAt: serverTimestamp(),
        quoteNumber: quoteNumber || `QOT-${Date.now()}`,
        quoteDate: toTimestamp(data.quoteDate) || serverTimestamp(),
        expiryDate: toTimestamp(data.expiryDate),
        items,
        subtotal,
        discount: discountValue,
        total,
      });

      const docRef = await addDoc(collection(db, 'users', user.uid, 'quotes'), payload);

      toast({ title: 'Success', description: 'Quote created successfully.' });
      router.push(`/quotes/${docRef.id}`);
    } catch (error: any) {
      console.error('Firestore write failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error Creating Quote',
        description: `Code: ${error.code || 'N/A'}. ${error.message || 'An unknown error occurred.'}`,
      });
    }
  };

  if (authLoading || !initialData) {
     return (
      <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href="/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
            </Link>
        </Button>
        </div>
        <QuoteForm
        mode="create"
        initialData={initialData}
        onSubmit={handleCreateQuote}
        />
    </div>
  );
}

export default function NewQuotePageContent() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
        <NewQuoteContent />
      </Suspense>
    </AuthGuard>
  );
}
