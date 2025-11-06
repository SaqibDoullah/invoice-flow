
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  Landmark,
  Plus,
  Settings,
  MoreVertical
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type BankAccount } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function BankAccountsPageContent() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
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
    const accountsCollectionRef = collection(db, 'users', user.uid, 'bank_accounts');
    const q = query(accountsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankAccount));
        setAccounts(accountsData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: accountsCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch bank accounts.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  return (
    <AuthGuard>
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
          <span>Bank Accounts</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Landmark className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
            <Button variant="outline">
               Connect Bank
            </Button>
             <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading || authLoading ? (
                [...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-8 w-32 mb-2" />
                           <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))
            ) : accounts.length > 0 ? (
                accounts.map(account => (
                    <Card key={account.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">{account.institution}</CardTitle>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(account.currentBalance, account.currency)}</div>
                            <p className="text-xs text-muted-foreground">{account.name} ({account.accountNumberMask})</p>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="md:col-span-2 lg:col-span-3">
                    <Card className="text-center py-12">
                        <CardHeader>
                            <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                                <Landmark className="w-8 h-8 text-muted-foreground"/>
                            </div>
                            <CardTitle>No Bank Accounts</CardTitle>
                            <CardDescription>Add a bank account to get started.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    </AuthGuard>
  );
}
