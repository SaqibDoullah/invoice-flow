
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, BookUser, Search, Plus, Upload, Download, Settings, Printer, Mail, ArrowUpDown } from 'lucide-react';
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
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type ChartOfAccount } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function ChartOfAccountsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
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
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch chart of accounts.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.code && account.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/accounting" className="hover:text-foreground">
            Accounting
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Chart of Accounts</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
              <BookUser className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Account
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 w-10 p-0">
                        <Settings className="h-5 w-5" />
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
                        Email to a friend
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                    placeholder="Search accounts..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><div className="flex items-center gap-1"><ArrowUpDown className="w-4 h-4"/>Account Code</div></TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                    [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id} className={account.isSystem ? 'bg-muted/50' : ''}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>
                          <p>{account.name}</p>
                          {account.isSystem && <p className="text-xs text-muted-foreground">System Account</p>}
                        </TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(account.balance || 0)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No accounts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-right text-sm text-muted-foreground">
            {filteredAccounts.length} of {accounts.length} accounts showing.
        </div>
      </div>
    </AuthGuard>
  );
}
