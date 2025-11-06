'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Home, ChevronRight, FileText, ChevronDown, Search, ArrowUpDown, ShieldAlert, Filter } from 'lucide-react';
import { format, isValid } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type CreditNote } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isValid(d) ? d : null;
};

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const creditNotesCollectionRef = collection(db, 'users', user.uid, 'creditNotes');
    const q = query(creditNotesCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditNote));
        setCreditNotes(data);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: creditNotesCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch credit notes.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/accounting" className="hover:text-foreground">Accounting</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Credit Notes</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
              <FileText className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>Create credit note</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Export <ChevronDown className="w-4 h-4 ml-2" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input placeholder="Search by ID or customer..." />
            <Input placeholder="Status" />
            <Input type="date" placeholder="Date" />
            <div className="relative">
                <Input placeholder="Customer" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>More filters</Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <ShieldAlert className='w-4 h-4 text-orange-500' />
                <span>Filtered: You do not have authorization to view this summary.</span>
            </div>
            <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox /></TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Credit Note ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : creditNotes.length > 0 ? (
                    creditNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <Badge variant={note.status === 'Open' ? 'default' : 'secondary'} className={note.status === 'Open' ? 'bg-green-100 text-green-800' : ''}>
                            {note.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(toDate(note.date)!, 'MM/dd/yyyy')}</TableCell>
                        <TableCell className="font-medium text-primary">{note.creditNoteId}</TableCell>
                        <TableCell className="text-primary">{note.customerName}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(note.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No credit notes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}