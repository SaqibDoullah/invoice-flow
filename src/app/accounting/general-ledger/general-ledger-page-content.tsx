'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  BookCopy,
  ChevronDown,
  Printer,
  Download,
  Mail,
  Search,
  Filter,
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type JournalLine } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { format } from 'date-fns';

export default function GeneralLedgerPageContent() {
  const [ledgerLines, setLedgerLines] = useState<JournalLine[]>([]);
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
    const linesCollectionRef = collection(db, 'users', user.uid, 'journal_lines');
    const q = query(linesCollectionRef, orderBy('journalId')); // A real implementation would order by date from the joined journal

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const linesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalLine));
        setLedgerLines(linesData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: linesCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch general ledger data.' });
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
    
    const exportToCSV = () => {
        const headers = ['Date', 'Transaction Type', 'No.', 'Contact', 'Memo/Description', 'Account', 'Debit', 'Credit', 'Balance'];
        const csvRows = [headers.join(',')];

        for (const entry of ledgerLines) {
            const row = [
                '', // Date
                '', // Type
                entry.journalId.substring(0, 7),
                entry.contactId || '',
                '', // Memo
                entry.accountId,
                entry.debit,
                entry.credit,
                '', // Balance
            ].join(',');
            csvRows.push(row);
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'general-ledger.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


  return (
    <AuthGuard>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/accounting" className="hover:text-foreground">
                Accounting
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>General Ledger</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <BookCopy className="w-6 h-6 text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Export As <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">Customize</Button>
          </div>
        </div>

        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <Select defaultValue="this-fiscal-year">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-fiscal-year">Date Range: This Fiscal Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="accrual">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="accrual">Accounting Basis: Accrual</SelectItem>
                        </SelectContent>
                    </Select>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-10"/>
                    </div>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" />More Filters</Button>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>No.</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Memo/Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                     <TableRow><TableCell colSpan={9} className="h-24"><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                  ) : ledgerLines.length > 0 ? (
                    ledgerLines.map((entry, index) => (
                        <TableRow key={entry.id}>
                        <TableCell>{/* Date would be from parent journal */}</TableCell>
                        <TableCell>{/* Type would be from parent journal */}</TableCell>
                        <TableCell className="text-primary hover:underline cursor-pointer">{entry.journalId.substring(0, 7)}</TableCell>
                        <TableCell className="text-primary hover:underline cursor-pointer">{entry.contactId}</TableCell>
                        <TableCell>{/* Memo would be from parent journal */}</TableCell>
                        <TableCell>{entry.accountId}</TableCell>
                        <TableCell className="text-right font-mono">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-right font-mono">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-right font-mono">{/* Balance needs calculation */}</TableCell>
                        </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No general ledger entries found.
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
