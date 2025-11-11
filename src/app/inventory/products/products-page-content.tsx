
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
  ShieldAlert,
  MessageCircle,
  Boxes,
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
import { type InventoryItem, type Column } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import CustomizeColumnsDialog from '@/components/inventory/products/customize-columns-dialog';


const initialColumns: Column[] = [
    { id: 'productStatus', label: 'Product Status' },
    { id: 'image', label: 'Image' },
    { id: 'sku', label: 'Product ID' },
    { id: 'name', label: 'Description' },
    { id: 'category', label: 'Category' },
    { id: 'manufacturer', label: 'Manufacturer' },
    { id: 'stdBuyPrice', label: 'Std buy price' },
    { id: 'price', label: 'Item price' },
    { id: 'sublocation', label: 'Sublocations (configurable)' },
];


export default function ProductsPageContent() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);


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

  const renderCell = (item: InventoryItem, columnId: string) => {
    switch (columnId) {
      case 'productStatus':
        return (
           <Badge variant={item.productStatus === 'Active' ? 'default' : 'secondary'} className={item.productStatus === 'Active' ? 'bg-green-100 text-green-800' : ''}>
              {item.productStatus || 'Active'}
          </Badge>
        );
      case 'image':
        return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
      case 'sku':
        return <span className="font-medium text-primary">{item.sku || item.id}</span>;
      case 'stdBuyPrice':
      case 'price':
        return <div className="text-right">{formatCurrency(item[columnId as keyof InventoryItem] as number)}</div>;
      default:
        return item[columnId as keyof InventoryItem] as string | number | null || 'N/A';
    }
  };


  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Products</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Products:</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-3xl font-bold p-0">
                  Default
                  <ChevronDown className="w-6 h-6 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Default</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/inventory/products/new">Create product</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/inventory/product-groups/new">Add Product to group</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant='outline'>Import</Button></DropdownMenuTrigger>
              <DropdownMenuContent><DropdownMenuItem>Import CSV</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant='outline'>Export</Button></DropdownMenuTrigger>
              <DropdownMenuContent><DropdownMenuItem>Export CSV</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions <ChevronDown className="w-4 h-4 ml-2"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize columns</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="products" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className='relative w-48'>
                <Input placeholder="Search..." />
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Select defaultValue="active">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Status: Active</SelectItem>
                <SelectItem value="inactive">Status: Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-48">
              <Input placeholder="Category" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative w-48">
              <Input placeholder="Supplier" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
             <div className="relative w-48">
              <Input placeholder="Manufacturer" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button variant="outline"><Filter className='mr-2 h-4 w-4' /> More filters</Button>
             <Button variant="ghost" size="icon">
                <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
            <ShieldAlert className='w-4 h-4 text-orange-500' />
            <span>Filtered: You do not have authorization to view this summary.</span>
            <span className='pl-4'>Selected: You do not have authorization to view this summary.</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 p-2 text-center"><Checkbox/></TableHead>
                    {columns.map(col => (
                      <TableHead key={col.id} className={`p-2 text-left ${col.id === 'stdBuyPrice' || col.id === 'price' ? 'text-right' : ''}`}>
                         {col.id === 'sku' ? (
                          <div className="flex items-center gap-1">
                            <ArrowUpDown className="w-3 h-3" /> {col.label}
                          </div>
                        ) : col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={columns.length + 1}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => router.push(`/inventory/products/${item.sku || item.id}`)}>
                        <TableCell className="p-2 text-center"><Checkbox /></TableCell>
                        {columns.map(col => (
                          <TableCell key={col.id} className="p-2">
                            {renderCell(item, col.id)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

         <div className="fixed bottom-8 right-8">
              <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                  <MessageCircle className="w-8 h-8" />
              </Button>
          </div>
          <CustomizeColumnsDialog
            isOpen={isCustomizeOpen}
            setIsOpen={setIsCustomizeOpen}
            columns={columns}
            setColumns={setColumns}
          />
      </div>
    </AuthGuard>
  );
}

    