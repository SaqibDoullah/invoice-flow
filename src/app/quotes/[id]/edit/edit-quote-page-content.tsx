
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import QuoteForm from '@/components/quotes/quote-form';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type QuoteUpdateInput, type Quote } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

export default function EditQuotePageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id?: string };
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
    if (authLoading) return;
    if (!user || typeof id !== 'string' || !db) {
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'users', user.uid, 'quotes', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast({ variant: 'destructive', title: 'Error', description: 'Quote not found.' });
          router.push('/quotes');
          return;
        }
        setQuote({ id: snap.id, ...snap.data() } as Quote);
      } catch (err: any) {
        console.error('Firestore read failed:', { code: err?.code, message: err?.message });
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch quote data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id, router, toast, user, authLoading]);

  const handleUpdateQuote = async (data: QuoteUpdateInput) => {
    const db = getFirestoreDb();
    if (!db || !user || typeof id !== 'string') return;

    try {
      const ref = doc(db, 'users', user.uid, 'quotes', id);

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

      const dataToUpdate: Record<string, any> = {
        ...stripUndefined(data),
        quoteDate: Timestamp.fromDate(data.quoteDate),
        expiryDate: Timestamp.fromDate(data.expiryDate),
        items,
        subtotal,
        discount: discountValue,
        total,
      };

      delete dataToUpdate.ownerId;
      delete dataToUpdate.createdAt;

      await updateDoc(ref, dataToUpdate);

      toast({ title: 'Success', description: 'Quote updated successfully.' });
      router.push(`/quotes/${id}`);
    } catch (err: any) {
      console.error('Error updating quote:', { code: err?.code, message: err?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update quote.' });
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

  if (!quote) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
          <p>The quote you are looking for does not exist or has been deleted.</p>
          <Button asChild className="mt-4">
            <Link href="/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Quotes
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href={`/quotes/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quote
            </Link>
          </Button>
        </div>
        <QuoteForm mode="edit" initialData={quote} onSubmit={handleUpdateQuote} />
      </div>
    </AuthGuard>
  );
}
