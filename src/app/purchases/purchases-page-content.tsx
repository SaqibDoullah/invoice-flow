
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Plus, Upload, Download, Settings2, Home, ChevronRight, Filter, Search, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
import { type PurchaseOrder } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function PurchasesPageContent() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
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
    // NOTE: This is a placeholder. In a real app, you would create a 'purchases' collection.
    // For now, we simulate an empty list.
    const poCollectionRef = collection(db, 'users', user.uid, 'purchaseOrders');
    const q = query(poCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const pos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
        setPurchaseOrders(pos);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching purchase orders: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch purchase orders.'});
        setLoading(false);
    });

    return () => unsubscribe();

  }, [user, authLoading, toast]);


  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

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
                <span>Purchases</span>
            </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Purchases:</h1>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">Default <ChevronDown className="w-4 h-4 ml-2" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Default</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/purchases/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create purchase order
                    </Link>
                </Button>
                 <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import purchase orders</Button>
                 <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Actions <ChevronDown className="w-4 h-4 ml-2" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Action 1</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>
          </div>
          
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <Input placeholder="Search..." className="max-w-xs" />
                <Select>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Status: Committed, Draft" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="committed">Committed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>All dates</span>
                        </div>
                    </SelectTrigger>
                 </Select>
                 <Input placeholder="Supplier" className="w-[200px]"/>
                 <Input placeholder="Product" className="w-[200px]"/>
                 <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
                 <Button variant="ghost"><RefreshCw className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                <span>Filtered: You do not have authorization to view this summary.</span>
                <span>Selected: You do not have authorization to view this summary.</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading || authLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Estimated receive date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.length > 0 ? (
                      purchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                            <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <Badge variant={po.status === 'committed' ? 'default' : 'secondary'} className={po.status === 'committed' ? 'bg-green-100 text-green-800' : ''}>
                                {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(po.orderDate, 'MM/dd/yyyy')}</TableCell>
                          <TableCell className="font-medium">{po.orderId}</TableCell>
                          <TableCell className="text-blue-600 font-semibold">{po.supplierName}</TableCell>
                          <TableCell>{po.destination}</TableCell>
                          <TableCell>{po.shipments}</TableCell>
                          <TableCell>{po.estimatedReceiveDate ? format(po.estimatedReceiveDate, 'MM/dd/yyyy') : 'N/A'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No purchase orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
