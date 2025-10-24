
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Home, ChevronRight, Receipt, ChevronDown, Filter, ShieldAlert, ArrowDown } from 'lucide-react';
import Link from 'next/link';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type Bill } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import CreateBillFromOrderDialog from '@/components/bills/create-bill-from-order-dialog';

export default function BillsPageContent() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateFromOrderDialogOpen, setIsCreateFromOrderDialogOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    // NOTE: This is a placeholder. In a real app, you would create a 'bills' collection.
    const billsCollectionRef = collection(db, 'users', user.uid, 'bills');
    const q = query(billsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const billsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill));
        setBills(billsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching bills: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch bills.'});
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
            <span>Bills</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                  <Receipt className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Bills:</h1>
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
              <Button onClick={() => setIsCreateFromOrderDialogOpen(true)}>
                Create bill from order
              </Button>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Export <ChevronDown className="w-4 h-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem>Export CSV</DropdownMenuItem>
                      <DropdownMenuItem>Export PDF</DropdownMenuItem>
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

          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Input placeholder="Search..." className="lg:col-span-1" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Payments status: Unpaid, Partially paid, Overpaid, Exceptions, N/A" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partially-paid">Partially paid</SelectItem>
                  <SelectItem value="overpaid">Overpaid</SelectItem>
                </SelectContent>
              </Select>
               <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Bill date: All dates" />
                </SelectTrigger>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Due date: All dates" />
                </SelectTrigger>
              </Select>
              <Input placeholder="Supplier" />
            </div>
             <div className="flex justify-between items-center">
                <div>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> More filters
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                    <span>Filtered: You do not have authorization to view this summary.</span>
                    <span>Selected: You do not have authorization to view this summary.</span>
                </div>
             </div>
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
                      <TableHead className="w-[50px]">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bill date</TableHead>
                      <TableHead><div className="flex items-center gap-1"><ArrowDown className="w-4 h-4"/> Bill due date</div></TableHead>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Reference number</TableHead>
                      <TableHead className="text-right">Total billed</TableHead>
                      <TableHead className="text-right">Total paid</TableHead>
                      <TableHead className="text-right">Outstanding balance</TableHead>
                      <TableHead>Payments status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.length > 0 ? (
                      bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{bill.status}</Badge>
                          </TableCell>
                          <TableCell>{format(bill.billDate, 'MM/dd/yyyy')}</TableCell>
                          <TableCell>{format(bill.billDueDate, 'MM/dd/yyyy')}</TableCell>
                          <TableCell className="font-medium text-blue-600">{bill.billId}</TableCell>
                          <TableCell>{bill.supplier}</TableCell>
                          <TableCell>{bill.referenceNumber}</TableCell>
                          <TableCell className="text-right">{formatCurrency(bill.totalBilled)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(bill.totalPaid)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(bill.outstandingBalance)}</TableCell>
                          <TableCell>
                            <Badge variant={bill.paymentStatus === 'Unpaid' ? 'destructive' : 'default'} className={bill.paymentStatus === 'Unpaid' ? 'bg-orange-100 text-orange-800' : ''}>
                                {bill.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="h-24 text-center">
                          No bills found.
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
        <CreateBillFromOrderDialog
            isOpen={isCreateFromOrderDialogOpen}
            setIsOpen={setIsCreateFromOrderDialogOpen}
        />
      </div>
    </AuthGuard>
  );
}
