
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
import { type BankAccount } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const mockTransactions = [
    { id: 't1', date: new Date(), description: 'Stripe Payment', amount: 1250.00, type: 'in' },
    { id: 't2', date: new Date(), description: 'AMAZON WEB SERVICES', amount: -250.55, type: 'out' },
    { id: 't3', date: new Date(), description: 'Mailchimp', amount: -89.00, type: 'out' },
    { id: 't4', date: new Date(), description: 'Office Depot', amount: -121.30, type: 'out' },
    { id: 't5', date: new Date(), description: 'Shopify Payment', amount: 899.99, type: 'in' },
];


export default function BankFeedsPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<string>('');

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
            if (accountsData.length > 0 && !selectedAccount) {
                setSelectedAccount(accountsData[0].id);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bank accounts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch bank accounts.'});
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast, selectedAccount]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
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
                        {loading ? <Skeleton className="h-10 w-full" /> : (
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} - {acc.institution}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="text-center pt-5">
                        <p className="font-bold text-lg">{mockTransactions.length}</p>
                        <p className="text-sm text-muted-foreground">Transactions to review</p>
                    </div>
                    <div className="text-center pt-5">
                        <p className="font-bold text-lg">{formatCurrency(bankAccounts.find(a => a.id === selectedAccount)?.currentBalance || 0)}</p>
                        <p className="text-sm text-muted-foreground">Bank Balance</p>
                    </div>
                     <div className="text-center pt-5">
                        <p className="font-bold text-lg">{formatCurrency(12345.67)}</p>
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
                            {mockTransactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>{format(t.date, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell className="text-right font-mono text-red-600">{t.type === 'out' ? formatCurrency(Math.abs(t.amount)) : '-'}</TableCell>
                                    <TableCell className="text-right font-mono text-green-600">{t.type === 'in' ? formatCurrency(t.amount) : '-'}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </AuthGuard>
    )
}
