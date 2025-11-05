
'use client';

import { useState, useEffect } from 'react';
import {
  BookCopy,
  ChevronDown,
  Search,
  Filter,
  ArrowUpDown,
  ShieldAlert
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type Journal } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { format } from 'date-fns';

export default function JournalEntriesPageContent() {
  const [journals, setJournals] = useState<Journal[]>([]);
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
    const journalsCollectionRef = collection(db, 'users', user.uid, 'journals');
    const q = query(journalsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const journalsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(),
            } as Journal;
        });
        setJournals(journalsData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: journalsCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch journal entries.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  return (
    <AuthGuard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <BookCopy className="w-6 h-6 text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>Create Journal Entry</Button>
            <Button variant="outline">Import</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Input placeholder="Search..." />
            <Select>
                <SelectTrigger><SelectValue placeholder="Status: Draft, Posted" /></SelectTrigger>
            </Select>
            <Select>
                <SelectTrigger><SelectValue placeholder="Date: All dates" /></SelectTrigger>
            </Select>
             <Select>
                <SelectTrigger><SelectValue placeholder="Source: All sources" /></SelectTrigger>
            </Select>
            <div className="relative"><Input placeholder="Account"/><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
            <div className="relative"><Input placeholder="Contact"/><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
          </div>
          <div className="flex justify-between items-center">
            <div>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
            </div>
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
                    <TableHead>Journal ID</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                    [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full"/></TableCell></TableRow>)
                  ) : journals.length > 0 ? (
                    journals.map((entry) => (
                        <TableRow key={entry.id}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                            <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'} className={entry.status === 'posted' ? 'bg-green-100 text-green-800' : ''}>
                            {entry.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{format(entry.date, 'yyyy-MM-dd')}</TableCell>
                        <TableCell className="font-medium text-primary">{entry.id.substring(0, 7)}</TableCell>
                        <TableCell className="text-primary">{entry.referenceId}</TableCell>
                        <TableCell>{entry.memo}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(0)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(0)}</TableCell>
                        </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            No journal entries found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
