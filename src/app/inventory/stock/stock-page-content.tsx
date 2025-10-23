
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { Home, ChevronRight, ChevronDown, Filter, Search, Plus, Upload, Download, RefreshCw, ArrowDownUp } from 'lucide-react';

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
import { type InventoryItem } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StockPageContent() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
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
    const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
    const q = query(itemCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventoryItems(items);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching inventory items:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch inventory items.'});
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

 const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
            <span>Stock</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Stock:</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    Main view <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Main view</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
               <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline">Export</Button></DropdownMenuTrigger>
                    <DropdownMenuContent><DropdownMenuItem>CSV</DropdownMenuItem></DropdownMenuContent>
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
          
          <Tabs defaultValue="stock">
            <TabsList>
                <TabsTrigger value="stock">Stock</TabsTrigger>
                <TabsTrigger value="products" disabled>Products</TabsTrigger>
                <TabsTrigger value="product-lookups" disabled>Product lookups</TabsTrigger>
                <TabsTrigger value="reordering-summary" disabled>Reordering summary</TabsTrigger>
                <TabsTrigger value="stock-history" disabled>Stock history</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6 mb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input placeholder="Search..." className="pl-8" />
                </div>
                <Input placeholder="Location" />
                <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input placeholder="Category" />
                </div>
                 <div className="relative">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input placeholder="Manufacturer" />
                </div>
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All quantities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All quantities</SelectItem>
                    </SelectContent>
                </Select>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">More: 1</Button>
                    </DropdownMenuTrigger>
                 </DropdownMenu>
                 <Button variant="ghost" size="icon"><ArrowDownUp className="w-4 h-4" /></Button>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                <span>Filtered: You do not have authorization to view this summary.</span>
             </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading || authLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table className="whitespace-nowrap">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="p-0 w-8"></TableHead>
                        <TableHead className="p-0 w-8"></TableHead>
                        <TableHead colSpan={2} className="p-2 border-l">Product</TableHead>
                        <TableHead className="p-2 border-l text-center">Physical</TableHead>
                        <TableHead className="p-2 border-l text-center">Including</TableHead>
                        <TableHead colSpan={2} className="p-2 border-l text-center">Including orders</TableHead>
                        <TableHead className="p-2 border-l text-center">Velocity</TableHead>
                        <TableHead colSpan={2} className="p-2 border-l text-center">Valuation</TableHead>
                        <TableHead colSpan={3} className="p-2 border-l text-center">Case stock</TableHead>
                        <TableHead className="p-2 border-l">Sublocation(s)</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead><Plus className="w-4 h-4" /></TableHead>
                      <TableHead>Img</TableHead>
                      <TableHead>Product ID (SKU)</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity on hand</TableHead>
                      <TableHead className="text-right">Quantity reserved</TableHead>
                      <TableHead className="text-right">Quantity on order</TableHead>
                      <TableHead className="text-right">Quantity available</TableHead>
                      <TableHead className="text-right">Sales velocity</TableHead>
                      <TableHead className="text-right">Average cost</TableHead>
                      <TableHead className="text-right">Total value</TableHead>
                      <TableHead className="text-right">Cases on hand</TableHead>
                      <TableHead className="text-right">Cases on order</TableHead>
                      <TableHead className="text-right">Cases available</TableHead>
                      <TableHead>Sublocation(s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.length > 0 ? (
                      inventoryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell><Button variant="ghost" size="icon" className="w-6 h-6"><Plus className="w-4 h-4" /></Button></TableCell>
                          <TableCell></TableCell>
                          <TableCell className="font-medium">{item.sku || 'N/A'}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.quantityReserved || 0}</TableCell>
                          <TableCell className="text-right">{item.quantityOnOrder || 0}</TableCell>
                          <TableCell className="text-right">{item.quantityAvailable || item.quantity}</TableCell>
                          <TableCell className="text-right">{item.salesVelocity || '0.00'}</TableCell>
                          <TableCell className="text-right">{item.averageCost ? formatCurrency(item.averageCost) : 'N/A'}</TableCell>
                          <TableCell className="text-right">{formatCurrency((item.averageCost || 0) * item.quantity)}</TableCell>
                          <TableCell className="text-right">{item.casesOnHand || 0}</TableCell>
                          <TableCell className="text-right">{item.casesOnOrder || 0}</TableCell>
                          <TableCell className="text-right">{item.casesAvailable || 0}</TableCell>
                          <TableCell>{item.sublocation || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={15} className="h-24 text-center">
                          No inventory items found.
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
      </div>
    </AuthGuard>
  );
}
