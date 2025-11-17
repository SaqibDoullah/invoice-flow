
'use client';

import {
  collectionGroup,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';

import { getFirestoreDb } from '@/lib/firebase-client';
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
import StatusBadge from '@/components/invoices/status-badge';
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

interface InvoiceListProps {
  searchTerm: string;
  statusFilter: string;
}

const PAGE_SIZE = 20;

export default function InvoiceList({ searchTerm, statusFilter }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceOwnerId, setSelectedInvoiceOwnerId] = useState<string | null>(null);


  const fetchInvoices = useCallback(async (loadMore = false) => {
    const db = getFirestoreDb();
    if (!db) {
        setDataLoading(false);
        return;
    };
    setDataLoading(true);

    try {
      let q = query(
        collectionGroup(db, 'invoices'),
        orderBy('invoiceDate', 'desc'),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newInvoices = querySnapshot.docs.map(doc => {
            const parentPath = doc.ref.parent.parent?.path;
            const ownerId = parentPath ? parentPath.split('/')[1] : 'unknown';
            return { id: doc.id, ownerId, ...doc.data() } as Invoice
        });

        setInvoices(prev => loadMore ? [...prev, ...newInvoices] : newInvoices);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(newInvoices.length === PAGE_SIZE);
        setDataLoading(false);
      }, (error) => {
        console.error("Firestore read failed:", error.message, error);
        if (error.code === 'failed-precondition') {
             toast({
              variant: "destructive",
              title: "Firestore Index Required",
              description: "Please create a composite index for the 'invoices' collection group on 'invoiceDate' descending.",
              duration: 10000,
            });
        } else if (error.code !== 'unavailable') {
            toast({
              variant: "destructive",
              title: "Error Fetching Invoices",
              description: "Could not fetch invoices. Please check your connection and security rules.",
            });
        }
        setDataLoading(false);
      });
      return unsubscribe;

    } catch (error: any) {
       console.error("Firestore query setup failed:", error.message, error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to set up invoice listener.",
       });
       setDataLoading(false);
    }
  }, [lastDoc, toast]);
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (!authLoading) {
      fetchInvoices(false).then(unsub => {
        if(unsub) unsubscribe = unsub;
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);


  const handleDelete = async () => {
    if (!selectedInvoiceId || !selectedInvoiceOwnerId) return;
    const db = getFirestoreDb();
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'users', selectedInvoiceOwnerId, 'invoices', selectedInvoiceId));
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
    } finally {
        setDialogOpen(false);
        setSelectedInvoiceId(null);
        setSelectedInvoiceOwnerId(null);
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

  if (authLoading || (dataLoading && invoices.length === 0)) {
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
              filteredInvoices.map(invoice => {
                const ts = invoice.invoiceDate;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{ts?.toDate ? format(ts.toDate(), 'PP') : '-'}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)}
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
                              <Link href={`/invoices/${invoice.id}?ownerId=${invoice.ownerId}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/invoices/${invoice.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                               <Link href={`/invoices/new?duplicateId=${invoice.id}`} className="cursor-pointer">
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onSelect={() => {
                                    setSelectedInvoiceId(invoice.id);
                                    setSelectedInvoiceOwnerId(invoice.ownerId || null);
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
                  No invoices found.
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
                    This action cannot be undone. This will permanently delete this invoice.
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
        
      {hasMore && filteredInvoices.length > 0 && (
        <div className="text-center mt-6">
          <Button onClick={() => fetchInvoices(true)} disabled={dataLoading}>
            {dataLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
}
