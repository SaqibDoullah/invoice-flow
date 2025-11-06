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
} from 'lucide-react';
import { format } from 'date-fns';
import { collection, onSnapshot, query } from 'firebase/firestore';

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
  TableFooter,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type ChartOfAccount } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';


export default function TrialBalancePageContent() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
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
    const coaCollectionRef = collection(db, 'users', user.uid, 'chart_of_accounts');
    const q = query(coaCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChartOfAccount));
        setAccounts(accountsData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: coaCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch accounts for trial balance.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const totalDebits = accounts.reduce((acc, curr) => acc + (curr.type === 'Asset' || curr.type === 'Expense' ? (curr.balance || 0) : 0), 0);
  const totalCredits = accounts.reduce((acc, curr) => acc + (curr.type === 'Liability' || curr.type === 'Equity' || curr.type === 'Income' ? (curr.balance || 0) : 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
    
   const exportToCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Debit', 'Credit'];
    const csvRows = [headers.join(',')];

    for (const account of accounts) {
        const isDebit = account.type === 'Asset' || account.type === 'Expense';
        const balance = account.balance || 0;
        const debit = isDebit ? balance : 0;
        const credit = !isDebit ? balance : 0;
        const row = [account.code, `"${account.name}"`, debit, credit].join(',');
        csvRows.push(row);
    }
    
    csvRows.push(['', 'Total', totalDebits, totalCredits].join(','));

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `trial-balance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
            <span>Trial Balance</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <BookCopy className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
                <p className="text-muted-foreground">As of {format(new Date(), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Export <ChevronDown className="w-4 h-4 ml-2" />
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
            <CardContent className="p-4 flex gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-sm font-medium">As of date</label>
                    <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-48"/>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Accounting basis</label>
                     <p className="font-medium pt-2">Accrual</p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Account Code</TableHead>
                    <TableHead className="w-2/4">Account Name</TableHead>
                    <TableHead className="text-right w-1/4">Debit</TableHead>
                    <TableHead className="text-right w-1/4">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                      <TableRow><TableCell colSpan={4} className="h-24"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ) : accounts.length > 0 ? (
                    accounts.map((account) => {
                      const isDebit = account.type === 'Asset' || account.type === 'Expense';
                      const balance = account.balance || 0;
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono">{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono">{isDebit ? formatCurrency(balance) : '-'}</TableCell>
                          <TableCell className="text-right font-mono">{!isDebit ? formatCurrency(balance) : '-'}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No accounts found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalDebits)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalCredits)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
