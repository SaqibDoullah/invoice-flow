'use client';

import {
  collection,
  query,
  where,
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
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import { db, auth } from '@/lib/firebase';
import { type Invoice } from '@/types';
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
import StatusBadge from './status-badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';

interface InvoiceListProps {
  searchTerm: string;
  statusFilter: string;
}

const PAGE_SIZE = 20;

export default function InvoiceList({ searchTerm, statusFilter }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async (loadMore = false) => {
    if (!auth.currentUser) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);

    try {
      let q = query(
        collection(db, 'invoices'),
        where('ownerId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newInvoices = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));

      setInvoices(prev => loadMore ? [...prev, ...newInvoices] : newInvoices);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(newInvoices.length === PAGE_SIZE);
    } catch (error) {
       if ((error as any).code !== 'unavailable') {
          console.error("Error fetching invoices:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch invoices. You may need to create a composite index in Firestore. See the browser console for a link to create it.",
          });
       }
    } finally {
      setIsLoading(false);
    }
  }, [lastDoc, toast]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setInvoices([]);
            setLastDoc(null);
            fetchInvoices(false);
        } else {
            setInvoices([]);
            setHasMore(false);
            setIsLoading(false);
        }
    });

    return () => unsubscribe();
  }, [fetchInvoices]);


  const handleDelete = async (invoiceId: string) => {
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      toast({
        title: "Success",
        description: "Invoice deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting invoice: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice.",
      });
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.invoiceNumber.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  if (isLoading) {
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
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{invoice.createdAt?.toDate ? format(invoice.createdAt.toDate(), 'PP') : '-'}</TableCell>
                  <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                             <Link href={`/invoices/${invoice.id}`} className="cursor-pointer">
                               <Eye className="mr-2 h-4 w-4" /> View
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${invoice.id}/edit`} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this invoice.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(invoice.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hasMore && filteredInvoices.length > 0 && (
        <div className="text-center mt-6">
          <Button onClick={() => fetchInvoices(true)} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
}
