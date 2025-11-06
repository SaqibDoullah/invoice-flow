
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
import { format } from 'date-fns';
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

const ReportSection = ({ title, items, isLoading }: { title: string; items: ChartOfAccount[]; isLoading: boolean; }) => {
    const total = items.reduce((sum, item) => sum + (item.balance || 0), 0);
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="space-y-1 pl-4">
                {isLoading ? <Skeleton className="h-8 w-full" /> : items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.balance || 0)}</span>
                    </div>
                ))}
                <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                    <span>Total {title}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};


export default function ProfitAndLossPageContent() {
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading || !user) return;
        const db = getFirestoreDb();
        if (!db) return;

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
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch account data.' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);

    const incomeAccounts = accounts.filter(a => a.type === 'Income');
    // Assuming COGS is a subtype of Expense for now. A real implementation would need a more robust way to identify these.
    const cogsAccounts = accounts.filter(a => a.type === 'Expense' && a.subType === 'CostOfGoodsSold');
    const expenseAccounts = accounts.filter(a => a.type === 'Expense' && a.subType !== 'CostOfGoodsSold');
    
    const totalIncome = incomeAccounts.reduce((sum, item) => sum + (item.balance || 0), 0);
    const totalCogs = cogsAccounts.reduce((sum, item) => sum + (item.balance || 0), 0);
    const grossProfit = totalIncome - totalCogs;
    const totalExpenses = expenseAccounts.reduce((sum, item) => sum + (item.balance || 0), 0);
    const netIncome = grossProfit - totalExpenses;

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
             <Link href="/reports" className="hover:text-foreground">
                Reports
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Profit &amp; Loss</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profit &amp; Loss</h1>
                <p className="text-muted-foreground">For the period: This Fiscal Year</p>
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
                     <Select defaultValue="accrual">
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="accrual">Accrual</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
             <div className="space-y-4">
                <ReportSection title="Income" items={incomeAccounts} isLoading={loading || authLoading} />
                <ReportSection title="Cost of Goods Sold" items={cogsAccounts} isLoading={loading || authLoading} />
                
                 <div className="flex justify-between font-bold text-lg border-t border-b py-2 my-2">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(grossProfit)}</span>
                </div>

                <ReportSection title="Expenses" items={expenseAccounts} isLoading={loading || authLoading} />

                <div className="flex justify-between font-bold text-xl border-t-2 border-primary pt-4 mt-4 text-primary">
                    <span>Net Income</span>
                    <span>{formatCurrency(netIncome)}</span>
                </div>
             </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
