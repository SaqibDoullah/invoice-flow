
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, addDoc, collection, Timestamp, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, ChevronRight, CreditCard, ChevronDown, Check, Trash2, History, Info, MessageCircle, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type Invoice, type InvoicePayment, invoicePaymentSchema, type InvoicePaymentFormData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CreateInvoicePaymentPageContentProps {
    invoiceId: string;
}

const toDate = (v: any): Date => {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate();
  return new Date();
};


export default function CreateInvoicePaymentPageContent({ invoiceId }: CreateInvoicePaymentPageContentProps) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<InvoicePaymentFormData>({
        // resolver: zodResolver(invoicePaymentSchema), // schema might need adjustment
        defaultValues: {
            date: new Date(),
            customer: '',
            amount: 0,
            method: '',
            transactionId: '',
            status: 'Draft',
        }
    });

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || !invoiceId || !db) return;

        setLoading(true);
        const invoiceRef = doc(db, 'users', user.uid, 'invoices', invoiceId);
        getDoc(invoiceRef).then(docSnap => {
            if (docSnap.exists()) {
                const invoiceData = { id: docSnap.id, ...docSnap.data() } as Invoice;
                setInvoice(invoiceData);
                form.reset({
                    date: new Date(),
                    customer: invoiceData.customerName,
                    amount: invoiceData.total, // Pre-fill with outstanding balance
                    method: '',
                    transactionId: '',
                    status: 'Draft',
                });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Invoice not found.' });
                router.push('/invoice-payments');
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load invoice.' });
        }).finally(() => setLoading(false));

    }, [invoiceId, user, toast, router, form]);

    const onSubmit = async (data: InvoicePaymentFormData) => {
       const db = getFirestoreDb();
       if (!user || !db || !invoice) return;
       
       const paymentRef = collection(db, 'users', user.uid, 'invoicePayments');
       const invoiceRef = doc(db, 'users', user.uid, 'invoices', invoice.id);

       const paymentId = `PAY-${Date.now()}`;
       
       const newPayment = {
           ...data,
           date: Timestamp.fromDate(data.date),
           paymentId,
           recordCreated: serverTimestamp(),
           recordLastUpdated: serverTimestamp(),
           status: 'Posted', // Or based on form
       };

       try {
           await runTransaction(db, async (transaction) => {
               // 1. Create the payment
               transaction.set(doc(paymentRef), newPayment);
               
               // 2. Update the invoice status to 'paid'
               transaction.update(invoiceRef, { status: 'paid' });
           });

           toast({ title: 'Success', description: 'Payment recorded and invoice marked as paid.' });
           router.push('/invoice-payments');
       } catch (error) {
           console.error("Payment transaction failed: ", error);
           toast({ variant: 'destructive', title: 'Error', description: 'Failed to record payment.' });
       }
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    if (loading || authLoading) {
        return (
            <div className="container mx-auto p-8">
                <Skeleton className="h-16 w-1/2 mb-4" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!invoice) return null;
    
    return (
        <AuthGuard>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col bg-muted/40">
                        <main className="flex-1 container mx-auto p-4 md:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                                        <CreditCard className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight">Invoice payments</h1>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold">New Payment...</span>
                                            <span className="text-muted-foreground">&bull;</span>
                                            <span className="text-muted-foreground">{format(new Date(), 'MM/dd/yyyy')}</span>
                                            <span className="text-muted-foreground">|</span>
                                            <Badge variant="secondary">Draft</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit"><Check className="mr-2" /> Save payment</Button>
                                </div>
                            </div>
                            
                            <div className="grid lg:grid-cols-3 gap-8 items-start mt-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardContent className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="date"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Payment date</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" value={format(field.value, 'yyyy-MM-dd')} onChange={e => field.onChange(new Date(e.target.value))} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Customer</label>
                                                <p className="text-sm pt-2">{invoice.customerName}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Amount</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="method"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Method</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="transactionId"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel>Transaction ID</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex-row justify-between items-center">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Linked invoices</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="border rounded-md overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Invoice ID</TableHead>
                                                            <TableHead>Invoice date</TableHead>
                                                            <TableHead>Due date</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Outstanding</TableHead>
                                                            <TableHead>Amount paid</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="font-medium text-primary">{invoice.invoiceNumber}</TableCell>
                                                            <TableCell>{format(toDate(invoice.invoiceDate), 'M/d/yyyy')}</TableCell>
                                                            <TableCell>{format(toDate(invoice.dueDate), 'M/d/yyyy')}</TableCell>
                                                            <TableCell>{formatCurrency(invoice.total)}</TableCell>
                                                            <TableCell>{formatCurrency(invoice.total)}</TableCell>
                                                            <TableCell>
                                                                <Input type="number" defaultValue={invoice.total} className="w-24 text-right"/>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                 <Button variant="link" className="p-0 h-auto" disabled>Link a new invoice to this payment</Button>
                                                <div className="text-right text-sm space-y-1 w-64">
                                                    <div className="flex justify-between"><span>Total selected:</span><span>{formatCurrency(invoice.total)}</span></div>
                                                    <div className="flex justify-between"><span>Total unallocated:</span><span>0.00</span></div>
                                                    <div className="flex justify-between font-bold"><span>Total paid:</span><span>{formatCurrency(invoice.total)}</span></div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </main>
                    </div>
                </form>
            </Form>
        </AuthGuard>
    )
}
