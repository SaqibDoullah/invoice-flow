
'use client';

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';

import { getFirestoreDb } from '@/lib/firebase-client';
import { type Quote } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/quotes/status-badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

interface QuoteListProps {
  searchTerm: string;
  statusFilter: string;
}

const PAGE_SIZE = 20;

export default function QuoteList({ searchTerm, statusFilter }: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const fetchQuotes = useCallback(async (loadMore = false) => {
    const db = getFirestoreDb();
    if (!user || !db) {
        setDataLoading(false);
        return;
    };
    setDataLoading(true);

    try {
      let q = query(
        collection(db, 'users', user.uid, 'quotes'),
        orderBy('quoteDate', 'desc'),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newQuotes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));

      setQuotes(prev => loadMore ? [...prev, ...newQuotes] : newQuotes);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(newQuotes.length === PAGE_SIZE);
    } catch (error: any) {
       console.error("Firestore read failed:", error.message, error);
       if (error.code !== 'unavailable' && error.code !== 'permission-denied') {
          toast({
            variant: "destructive",
            title: "Error Fetching Quotes",
            description: "Could not fetch quotes. Please check your connection and security rules.",
          });
       }
    } finally {
      setDataLoading(false);
    }
  }, [lastDoc, toast, user]);
  
  useEffect(() => {
    if (!authLoading && user) {
      fetchQuotes(false);
    } else if (!authLoading && !user) {
        setQuotes([]);
        setHasMore(false);
        setDataLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);


  const handleDelete = async () => {
    if (!selectedQuoteId) return;
    const db = getFirestoreDb();
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quotes', selectedQuoteId));
      setQuotes(prev => prev.filter(inv => inv.id !== selectedQuoteId));
      toast({
        title: "Success",
        description: "Quote deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting quote: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quote.",
      });
    } finally {
        setDialogOpen(false);
        setSelectedQuoteId(null);
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        quote.customerName.toLowerCase().includes(searchLower) ||
        quote.quoteNumber.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  if (authLoading || (dataLoading && quotes.length === 0)) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map(quote => {
                const ts = quote.quoteDate;
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>{ts?.toDate ? format(ts.toDate(), 'PP') : '-'}</TableCell>
                    <TableCell><StatusBadge status={quote.status} /></TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.total)}
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/quotes/${quote.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/quotes/${quote.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                               <Link href={`/quotes/new?duplicateId=${quote.id}`} className="cursor-pointer">
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onSelect={() => {
                                    setSelectedQuoteId(quote.id);
                                    setDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No quotes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this quote.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      {hasMore && filteredQuotes.length > 0 && (
        <div className="text-center mt-6">
          <Button onClick={() => fetchQuotes(true)} disabled={dataLoading}>
            {dataLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
}
