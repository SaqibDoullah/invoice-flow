
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { Home, ChevronRight, ChevronDown, Filter, MoreVertical, RefreshCw, CreditCard, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type InvoicePayment } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import CreateInvoicePaymentDialog from '@/components/invoice-payments/create-invoice-payment-dialog';

export default function InvoicePaymentsPageContent() {
  const [invoicePayments, setInvoicePayments] = useState<InvoicePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);
    const paymentsCollectionRef = collection(db, 'users', user.uid, 'invoicePayments');
    const q = query(paymentsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoicePayment));
        setInvoicePayments(payments);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching invoice payments:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch invoice payments.'});
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <AuthGuard>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Invoice payments</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                 <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <CreditCard className="w-6 h-6 text-green-500" />
                </div>
              <h1 className="text-3xl font-bold tracking-tight">Invoice payments:</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    Default <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Default</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create invoice payment from invoice
              </Button>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Export <ChevronDown className="w-4 h-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem>Export CSV</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Action 1</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search..." className="max-w-xs" />
            <Input type="date" placeholder="All dates" className="w-auto"/>
            <Input placeholder="Customer" />
            <Input placeholder="Method" />
            <Input placeholder="Status" />
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
            <Button variant="ghost"><ArrowUpDown className="h-4 w-4" /></Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading || authLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Record created</TableHead>
                      <TableHead>Record last updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicePayments.length > 0 ? (
                      invoicePayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payment.status}</Badge>
                          </TableCell>
                          <TableCell>{format(payment.date, 'M/d/yyyy')}</TableCell>
                          <TableCell className="font-medium text-blue-600">{payment.paymentId}</TableCell>
                          <TableCell>{payment.customer}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{format(payment.recordCreated, "MMM d yyyy h:mm:ss a")}</TableCell>
                          <TableCell>{format(payment.recordLastUpdated, "MMM d yyyy h:mm:ss a")}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No invoice payments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <CreateInvoicePaymentDialog 
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
        />
      </div>
    </AuthGuard>
  );
}
