
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Quote } from '@/types';
import { useToast } from '@/hooks/use-toast';
import QuotePDF from '@/components/quotes/quote-pdf';
import QuoteActions from '@/components/quotes/quote-actions';
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

export default function QuoteDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (authLoading || !user || typeof id !== 'string' || !db) {
        if (!authLoading) setLoading(false);
        return;
    };
    
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'quotes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuote({ id: docSnap.id, ...docSnap.data() } as Quote);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Quote not found or you do not have permission to view it.' });
          router.push('/quotes');
        }
      } catch (error: any) {
        console.error('Firestore read failed:', { code: error?.code, message: error?.message });
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch quote data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id, router, toast, user, authLoading]);

  const handleStatusChange = async (status: Quote['status']) => {
    const db = getFirestoreDb();
    if (!quote || !user || !db) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'quotes', quote.id);
      await updateDoc(docRef, { status });
      setQuote(prev => prev ? { ...prev, status } : null);
      toast({ title: 'Success', description: `Quote status updated to ${status}.` });
    } catch (error: any) {
      console.error('Error updating status:', { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    const db = getFirestoreDb();
    if (!quote || !user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quotes', quote.id));
      toast({ title: 'Success', description: 'Quote deleted successfully.' });
      router.push('/quotes');
    } catch (error: any) {
      console.error('Error deleting quote:', { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete quote.' });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };
  
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section id="quote-print" className="bg-card rounded-xl shadow overflow-hidden max-w-full">
             <div className="mx-auto w-full max-w-[1100px]">
                <QuotePDF quote={quote} />
            </div>
          </section>

          <aside className="print:hidden">
              <div className="sticky top-6 space-y-3">
                   <QuoteActions
                    quote={quote}
                    onStatusChange={handleStatusChange}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                   />
              </div>
          </aside>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this quote and all of its data.
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
    </AuthGuard>
  );
}
