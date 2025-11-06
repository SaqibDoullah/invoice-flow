
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Banknote, HelpCircle, Check, Loader2, Search } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type BankAccount } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const initialTransactions = {
    payments: [
        { id: 'p1', date: new Date(), description: 'Office Supplies', amount: 150.75, cleared: false },
        { id: 'p2', date: new Date(), description: 'Software Subscription', amount: 49.99, cleared: false },
    ],
    deposits: [
        { id: 'd1', date: new Date(), description: 'Invoice #2024-001', amount: 1200.00, cleared: false },
        { id: 'd2', date: new Date(), description: 'Client Payment', amount: 850.50, cleared: false },
    ]
};

export default function ReconciliationPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState(1); // 1 for setup, 2 for reconciliation
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [statementBalance, setStatementBalance] = useState<string>('');
    const [statementDate, setStatementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const [transactions, setTransactions] = useState(initialTransactions);

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
            setBankAccounts(accountsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bank accounts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch bank accounts.'});
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);

    const handleStartReconciliation = () => {
        if (!selectedAccount || !statementBalance || !statementDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in all fields to start.' });
            return;
        }
        setStep(2);
    };

    const handleTransactionToggle = (type: 'payments' | 'deposits', id: string) => {
        setTransactions(prev => ({
            ...prev,
            [type]: prev[type].map(t => t.id === id ? { ...t, cleared: !t.cleared } : t)
        }));
    };
    
    const clearedPayments = transactions.payments.filter(t => t.cleared).reduce((sum, t) => sum + t.amount, 0);
    const clearedDeposits = transactions.deposits.filter(t => t.cleared).reduce((sum, t) => sum + t.amount, 0);
    
    const beginningBalance = bankAccounts.find(acc => acc.id === selectedAccount)?.currentBalance || 0;
    const clearedBalance = beginningBalance - clearedPayments + clearedDeposits;
    const difference = clearedBalance - parseFloat(statementBalance || '0');

    if (step === 1) {
        return (
            <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground"><Home className="w-4 h-4" /> Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/accounting/banking/accounts" className="hover:text-foreground">Banking</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Reconciliation</span>
                </div>
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Banknote className="w-6 h-6 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Reconcile an account</h1>
                    </div>
                </div>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Begin Reconciliation</CardTitle>
                        <CardDescription>Enter the information from your bank statement to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {loading || authLoading ? <Skeleton className="h-10 w-full"/> : (
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account</label>
                                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                    <SelectTrigger><SelectValue placeholder="Select an account to reconcile" /></SelectTrigger>
                                    <SelectContent>
                                        {bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} - {acc.institution}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Ending balance</label>
                            <Input type="number" placeholder="0.00" value={statementBalance} onChange={e => setStatementBalance(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Ending date</label>
                            <Input type="date" value={statementDate} onChange={e => setStatementDate(e.target.value)} />
                        </div>
                        <Button onClick={handleStartReconciliation} className="w-full">Start reconciling</Button>
                    </CardContent>
                </Card>
            </>
        );
    }
    
    const accountDetails = bankAccounts.find(acc => acc.id === selectedAccount);

    return (
        <>
             <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reconciling {accountDetails?.name}</h1>
                    <p className="text-muted-foreground">Statement ends {format(new Date(statementDate), 'PPP')} | Statement ending balance: {formatCurrency(parseFloat(statementBalance))}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="outline">Save for later</Button>
                    <Button>Finish now</Button>
                </div>
            </div>
            
            <Card className="mb-4">
                <CardContent className="p-4 flex justify-around text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Beginning Balance</p>
                        <p className="font-semibold">{formatCurrency(beginningBalance)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{clearedPayments > 0 ? `(-) ${transactions.payments.filter(t => t.cleared).length}` : '-'} Payments</p>
                        <p className="font-semibold">{formatCurrency(clearedPayments)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">{`(+) ${transactions.deposits.filter(t => t.cleared).length}`} Deposits</p>
                        <p className="font-semibold">{formatCurrency(clearedDeposits)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-4 bg-background">
                <CardContent className="p-4 grid grid-cols-3 text-center">
                     <div>
                        <p className="text-sm text-muted-foreground">Cleared Balance</p>
                        <p className="text-lg font-bold">{formatCurrency(clearedBalance)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Statement Ending Balance</p>
                        <p className="text-lg font-bold">{formatCurrency(parseFloat(statementBalance))}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Difference</p>
                        <p className={`text-lg font-bold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(difference)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Checks and Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {transactions.payments.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell><Checkbox checked={t.cleared} onCheckedChange={() => handleTransactionToggle('payments', t.id)} /></TableCell>
                                        <TableCell>{format(t.date, 'PP')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Deposits and Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {transactions.deposits.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell><Checkbox checked={t.cleared} onCheckedChange={() => handleTransactionToggle('deposits', t.id)} /></TableCell>
                                        <TableCell>{format(t.date, 'PP')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
