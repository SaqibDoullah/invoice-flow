
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import {
  Home,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Plus,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type InventoryItem } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function StockPageContent() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
    const q = query(itemCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsList = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as InventoryItem)
        );
        setInventoryItems(itemsList);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: itemCollectionRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
          toast({
            variant: 'destructive',
            title: 'Error Fetching Inventory',
            description: `Code: ${serverError.code}. ${serverError.message}`,
          });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, toast]);

    const formatCurrency = (amount: number | undefined) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
    
    const formatNumber = (num: number | undefined) => (num || 0).toFixed(2);


  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
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
                <Button variant="ghost" className="text-3xl font-bold p-0">
                  Main view
                  <ChevronDown className="w-6 h-6 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Main view</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Action 1</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="stock" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input placeholder="Search..." className="max-w-xs" />
            <div className="relative w-48">
              <Input placeholder="Category" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative w-48">
              <Input placeholder="Manufacturer" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quantities</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">More: 1</Button>
             <Button variant="ghost" size="icon">
                <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtered: You do not have authorization to view this summary.</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 p-2"></TableHead>
                    <TableHead className="w-10 p-2 text-center">Img</TableHead>
                    <TableHead className="p-2 text-left">
                      <div className="flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3" /> Product ID (SKU)
                      </div>
                    </TableHead>
                    <TableHead className="p-2 text-right border-l">Quantity on hand</TableHead>
                    <TableHead className="p-2 text-right">Quantity reserved</TableHead>
                    <TableHead className="p-2 text-right">Quantity on order</TableHead>
                    <TableHead className="p-2 text-right">Quantity available</TableHead>
                    <TableHead className="p-2 text-right border-l">Sales velocity</TableHead>
                    <TableHead className="p-2 text-right border-l">Average cost</TableHead>
                    <TableHead className="p-2 text-right">Total value</TableHead>
                    <TableHead className="p-2 text-right border-l">Cases on hand</TableHead>
                    <TableHead className="p-2 text-right">Cases on order</TableHead>
                    <TableHead className="p-2 text-right">Cases available</TableHead>
                    <TableHead className="p-2 text-left border-l">Sublocation(s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={15}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2 text-center">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="p-2 text-center">
                           <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="p-2 text-left">
                            <p className="font-medium text-primary">{item.sku || item.id}</p>
                            <p className="text-xs text-muted-foreground">{item.name}</p>
                        </TableCell>
                        <TableCell className="p-2 text-right border-l">{item.quantity || 0}</TableCell>
                        <TableCell className="p-2 text-right">{item.quantityReserved || 0}</TableCell>
                        <TableCell className="p-2 text-right">{item.quantityOnOrder || 0}</TableCell>
                        <TableCell className="p-2 text-right">{item.quantityAvailable || 0}</TableCell>
                        <TableCell className="p-2 text-right border-l">{formatNumber(item.salesVelocity)}</TableCell>
                        <TableCell className="p-2 text-right border-l">{formatCurrency(item.averageCost)}</TableCell>
                        <TableCell className="p-2 text-right">{formatCurrency((item.averageCost || 0) * (item.quantity || 0))}</TableCell>
                        <TableCell className="p-2 text-right border-l">{item.casesOnHand || 0}</TableCell>
                        <TableCell className="p-2 text-right">{item.casesOnOrder || 0}</TableCell>
                        <TableCell className="p-2 text-right">{item.casesAvailable || 0}</TableCell>
                        <TableCell className="p-2 text-left border-l">{item.sublocation || ''}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
