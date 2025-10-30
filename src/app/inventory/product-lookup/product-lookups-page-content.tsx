
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  MessageCircle,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

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
import { type ProductLookup } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import CustomizeColumnsDialog from '@/components/inventory/product-lookup/customize-columns-dialog';

type Column = {
  id: keyof ProductLookup | 'id';
  label: string;
};

const initialColumns: Column[] = [
    { id: 'productLookup', label: 'Product lookup' },
    { id: 'notes', label: 'Notes' },
    { id: 'productId', label: 'Product ID' },
    { id: 'description', label: 'Description' },
    { id: 'status', label: 'Status' },
    { id: 'packing', label: 'Packing' },
    { id: 'lotId', label: 'Lot ID' },
    { id: 'stores', label: 'Stores' },
];


export default function ProductLookupsPageContent() {
  const [lookups, setLookups] = useState<ProductLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);
    const lookupCollectionRef = collection(db, 'users', user.uid, 'productLookups');

    const conditions = [];
    if (statusFilter !== 'all') {
        conditions.push(where('status', '==', statusFilter));
    }
    const q = query(lookupCollectionRef, ...conditions);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        let lookupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductLookup));
        
        if (searchTerm) {
            lookupsData = lookupsData.filter(l => 
                l.productLookup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setLookups(lookupsData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: lookupCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({
                variant: 'destructive',
                title: 'Error Fetching Lookups',
                description: 'Could not fetch product lookups.'
            });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast, searchTerm, statusFilter]);

  const renderCell = (lookup: ProductLookup, columnId: keyof ProductLookup | 'id') => {
      if (columnId === 'id') return null;
      const value = lookup[columnId as keyof ProductLookup];

      switch(columnId) {
          case 'productLookup':
              return <span className="font-medium text-primary">{lookup.productLookup}</span>;
          case 'productId':
              return <span className="text-primary">{lookup.productId}</span>;
          case 'status':
              return (
                <Badge variant="outline" className="border-none">
                    {lookup.status} <ChevronDown className="w-3 h-3 ml-1" />
                </Badge>
              );
          default:
              return value as string | null;
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
          <span>Product lookups</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Product lookups</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/inventory/product-lookup/new">Create product lookup</Link>
            </Button>
            <Button variant='outline'>Import product lookups</Button>
            <Button variant='outline'>Export product lookups</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize this screen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-muted-foreground">All changes saved</span>
          </div>
        </div>

        <Tabs defaultValue="product-lookup" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 flex flex-wrap items-center gap-4">
            <div className='relative w-48'>
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm">Filters:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-lookups">
              <SelectTrigger className="w-auto">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all-lookups">All lookups</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="regular-lookups">
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="regular-lookups">Regular lookups</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-stores">
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stores">All stores</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {columns.map(col => (
                        <TableHead key={col.id} className="p-2 text-left">{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                     ))
                  ) : lookups.length > 0 ? (
                    lookups.map((lookup) => (
                      <TableRow key={lookup.id}>
                        {columns.map(col => (
                            <TableCell key={col.id} className="p-2">
                                {renderCell(lookup, col.id)}
                            </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No product lookups found.
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
