
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Landmark, BadgeHelp, Check, Plus } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { format } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type BankAccount, type BankTransaction, type ChartOfAccount } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};


export default function BankFeedsPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<string>('');

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        let accountsLoaded = false;
        let coaLoaded = false;

        const checkAllLoaded = () => {
            if(accountsLoaded && coaLoaded) {
                // Determine loading state based on transaction fetching
            }
        }

        const accountsCollectionRef = collection(db, 'users', user.uid, 'bank_accounts');
        const qAccounts = query(accountsCollectionRef);
        const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
            const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankAccount));
            setBankAccounts(accountsData);
            if (accountsData.length > 0 && !selectedAccount) {
                setSelectedAccount(accountsData[0].id);
            }
            if(accountsData.length === 0) setLoading(false);
            accountsLoaded = true;
            checkAllLoaded();
        }, (error) => {
            console.error("Error fetching bank accounts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch bank accounts.'});
            setLoading(false);
        });

        const coaCollectionRef = collection(db, 'users', user.uid, 'chart_of_accounts');
        const qCoa = query(coaCollectionRef);
        const unsubCoa = onSnapshot(qCoa, (snapshot) => {
            const coaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChartOfAccount));
            setChartOfAccounts(coaData);
            coaLoaded = true;
            checkAllLoaded();
        }, (error) => {
            console.error("Error fetching chart of accounts:", error);
            if (error.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch chart of accounts.' });
            }
            setLoading(false);
        });

        return () => {
            unsubAccounts();
            unsubCoa();
        }
    }, [user, authLoading, toast, selectedAccount]);
    
    useEffect(() => {
        if (!selectedAccount || !user) return;
        const db = getFirestoreDb();
        if (!db) return;

        setLoading(true);
        const transactionsRef = collection(db, 'users', user.uid, 'bank_accounts', selectedAccount, 'transactions');
        const qTransactions = query(transactionsRef);

        const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
            const transData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankTransaction));
            setTransactions(transData);
            setLoading(false);
        }, (error) => {
             console.error("Error fetching transactions:", error);
            if (error.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch transactions.'});
            }
            setLoading(false);
        });

        return () => unsubTransactions();

    }, [selectedAccount, user, toast]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const transactionsToReview = transactions.filter(t => t.status === 'unmatched');
    
    const selectedBankAccount = bankAccounts.find(a => a.id === selectedAccount);
    const coreOpsAccount = chartOfAccounts.find(acc => acc.name === selectedBankAccount?.name);
    const coreOpsBalance = coreOpsAccount?.balance || 0;

    return (
        <AuthGuard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground"><Home className="w-4 h-4" /> Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/accounting/banking/accounts" className="hover:text-foreground">Banking</Link>
                <ChevronRight className="w-4 h-4" />
                <span>Bank Feeds</span>
            </div>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Landmark className="w-6 h-6 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Bank Feeds</h1>
                </div>
                <Button>Update Feed</Button>
            </div>
            
            <Card className="mb-6">
                <CardContent className="p-4 flex items-center gap-4">
                     <div className="flex-1">
                        <label className="text-sm font-medium">Account</label>
                        {loading && bankAccounts.length === 0 ? <Skeleton className="h-10 w-full" /> : (
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} - {acc.institution}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="text-center pt-5">
                        <p className="font-bold text-lg">{transactionsToReview.length}</p>
                        <p className="text-sm text-muted-foreground">Transactions to review</p>
                    </div>
                    <div className="text-center pt-5">
                        <p className="font-bold text-lg">{formatCurrency(selectedBankAccount?.currentBalance || 0)}</p>
                        <p className="text-sm text-muted-foreground">Bank Balance</p>
                    </div>
                     <div className="text-center pt-5">
                        <p className="font-bold text-lg">{formatCurrency(coreOpsBalance)}</p>
                        <p className="text-sm text-muted-foreground">Balance in CoreOps</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>For Review</CardTitle>
                    <CardDescription>Categorize these imported transactions to put them on your books.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Money Out</TableHead>
                                <TableHead className="text-right">Money In</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-24"><Skeleton className="w-full h-8" /></TableCell></TableRow>
                            ) : transactionsToReview.length > 0 ? (
                                transactionsToReview.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(toDate(t.date)!, 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">{t.type === 'debit' ? formatCurrency(Math.abs(t.amount)) : '-'}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{t.type === 'credit' ? formatCurrency(t.amount) : '-'}</TableCell>
                                        <TableCell>
                                            <Select>
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Choose category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="office-expense">Office Expense</SelectItem>
                                                    <SelectItem value="sales">Sales</SelectItem>
                                                    <SelectItem value="utilities">Utilities</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" /> Add
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No transactions to review.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </AuthGuard>
    )
}
