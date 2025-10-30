
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Home, ChevronRight, Undo2, ChevronDown, Filter, Search, ArrowUpDown, ShieldAlert } from 'lucide-react';
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
import { type Return } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import CreateReturnFromOrderDialog from '@/components/returns/create-return-from-order-dialog';

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};

export default function ReturnsPageContent() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateFromOrderDialogOpen, setIsCreateFromOrderDialogOpen] = useState(false);

  useEffect(() => {
    // Mock data for initial display
    const mockData: Return[] = [
        { id: '1', status: 'Draft', returnId: 'R-100206-1', customer: 'Unique Wholesale', returnDate: new Date('2025-05-12'), orderId: '100206', shipToName: 'Unique Wholesale' },
        { id: '2', status: 'Draft', returnId: 'R-100009', customer: 'Unique Wholesale', returnDate: new Date('2025-01-28') },
    ];
    setReturns(mockData);
    setLoading(false);
    
    // In a real app, you would fetch from Firestore like this:
    /*
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const returnsCollectionRef = collection(db, 'users', user.uid, 'returns');
    const q = query(returnsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const returnsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Return));
        setReturns(returnsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching returns: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch returns.'});
        setLoading(false);
    });

    return () => unsubscribe();
    */
  }, [user, authLoading, toast]);


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
            <span>Returns</span>
          </div>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <Undo2 className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Returns:</h1>
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
              <Button onClick={() => setIsCreateFromOrderDialogOpen(true)}>Create return from order</Button>
              <Button variant="outline">Create return</Button>
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
                  <DropdownMenuItem>Print details for selected returns</DropdownMenuItem>
                  <DropdownMenuItem>Customize action menu items</DropdownMenuItem>
                  <DropdownMenuItem>Customize columns</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Input placeholder="Search..." />
              <Input placeholder="Status" defaultValue="Draft" />
              <Select defaultValue="all-dates">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-dates">All dates</SelectItem>
                </SelectContent>
              </Select>
               <div className="relative"><Input placeholder="Customer"/><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
               <div className="relative"><Input placeholder="Location"/><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
            </div>
            <div className="flex justify-between items-center">
                 <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <ShieldAlert className='w-4 h-4 text-orange-500' />
                    <span>Filtered: You do not have authorization to view this summary.</span>
                    <span className='ml-4'>Selected: You do not have authorization to view this summary.</span>
                </div>
                 <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
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
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead><div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3"/> Return date</div></TableHead>
                      <TableHead>Shipment receive dates</TableHead>
                      <TableHead>Shipment tracking codes</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Ship to name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returns.length > 0 ? (
                      returns.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.status}</Badge>
                          </TableCell>
                           <TableCell className="font-medium text-blue-600">{item.returnId}</TableCell>
                           <TableCell className="font-medium text-blue-600">{item.customer}</TableCell>
                           <TableCell>{format(toDate(item.returnDate)!, 'M/d/yyyy')}</TableCell>
                           <TableCell>{item.shipmentReceiveDates}</TableCell>
                           <TableCell>{item.shipmentTrackingCodes}</TableCell>
                           <TableCell className="font-medium text-blue-600">{item.orderId}</TableCell>
                           <TableCell>{item.shipToName}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No returns found.
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
        <CreateReturnFromOrderDialog 
            isOpen={isCreateFromOrderDialogOpen}
            setIsOpen={setIsCreateFromOrderDialogOpen}
        />
      </div>
    </AuthGuard>
  );
}
