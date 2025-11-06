
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  FileText,
  ChevronDown,
  Printer,
  Download,
  Mail,
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type ChartOfAccount } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';


const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);


export default function TaxSummaryPageContent() {
    const [taxAccounts, setTaxAccounts] = useState<ChartOfAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading || !user) return;
        const db = getFirestoreDb();
        if (!db) return;

        setLoading(true);
        const coaCollectionRef = collection(db, 'users', user.uid, 'chart_of_accounts');
        // A real query would be more specific, e.g. where('subType', '==', 'SalesTax')
        const q = query(coaCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChartOfAccount))
                .filter(acc => acc.name.toLowerCase().includes('tax'));
            setTaxAccounts(accountsData);
            setLoading(false);
        }, (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: coaCollectionRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            if (serverError.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tax accounts.' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);
    
    // This is a simplified summary. A real one would differentiate between collected and payable.
    const totalTaxBalance = taxAccounts.reduce((sum, item) => sum + (item.balance || 0), 0);

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
            <span>Tax Summary</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tax Summary</h1>
                <p className="text-muted-foreground">For period: This Fiscal Year</p>
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
                    <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">Customize</Button>
          </div>
        </div>

        <Card className="mb-6">
            <CardContent className="p-4 flex gap-4 items-end">
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Date range</label>
                    <Select defaultValue="this-fiscal-year">
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-fiscal-year">This Fiscal Year</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <TableHead>Jurisdiction / Account</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead className="text-right">Tax Collected</TableHead>
                    <TableHead className="text-right">Tax Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                    <TableRow><TableCell colSpan={4} className="h-24"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ) : taxAccounts.length > 0 ? (
                    taxAccounts.map((account) => (
                        <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell>--</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(0)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(account.balance || 0)}</TableCell>
                        </TableRow>
                    ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No tax accounts found or configured.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(0)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalTaxBalance)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
