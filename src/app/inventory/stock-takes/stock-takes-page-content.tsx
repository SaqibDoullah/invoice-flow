
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Home, ChevronRight, ClipboardList, ChevronDown, Search, ArrowUpDown, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';

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
import { type StockTake } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isValid(d) ? d : null;
};

export default function StockTakesPageContent() {
  const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
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
    const stockTakesCollectionRef = collection(db, 'users', user.uid, 'stockTakes');
    const q = query(stockTakesCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockTake));
        setStockTakes(data);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: stockTakesCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch stock takes.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);
  
  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Stock takes</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <ClipboardList className="w-6 h-6 text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Stock takes:</h1>
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
            <Button asChild>
                <Link href="/inventory/stock-takes/new">Create stock take</Link>
            </Button>
            <Button variant="outline">Import stock take</Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative"><Input placeholder="Search..." /><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
            <Input placeholder="Status" />
            <Select defaultValue="all-dates">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all-dates">All dates</SelectItem></SelectContent>
            </Select>
            <Input placeholder="Sublocation" />
            <div className="relative"><Input placeholder="Product" /><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
          </div>
           <div className="flex justify-between items-center">
                 <div>
                    <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <ShieldAlert className='w-4 h-4 text-orange-500' />
                    <span>Filtered: You do not have authorization to view this summary.</span>
                    <span className='ml-4'>Selected: You do not have authorization to view this summary.</span>
                </div>
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox /></TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock take ID</TableHead>
                    <TableHead><div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3"/> Date</div></TableHead>
                    <TableHead>Sublocation</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Commit timestamp</TableHead>
                    <TableHead>Commit user</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : stockTakes.length > 0 ? (
                    stockTakes.map((st) => (
                      <TableRow key={st.id}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell><Badge variant="secondary">{st.status}</Badge></TableCell>
                        <TableCell className="font-medium text-primary">{st.stockTakeId}</TableCell>
                        <TableCell>{st.date ? format(toDate(st.date)!, 'M/d/yyyy') : ''}</TableCell>
                        <TableCell>{st.sublocation}</TableCell>
                        <TableCell>{st.note}</TableCell>
                        <TableCell>{st.commitTimestamp ? format(toDate(st.commitTimestamp)!, 'MMM d yyyy h:mm:ss a') : ''}</TableCell>
                        <TableCell>{st.commitUser}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No stock takes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
