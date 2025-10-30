
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, RefreshCw, ChevronDown, MessageCircle, ArrowDown } from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CustomizeColumnsDialog from '@/components/purchases/reorder-legacy-customize-columns-dialog';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { collection, onSnapshot } from 'firebase/firestore';
import { type Supplier, type InventoryItem } from '@/types';

type Column = {
  id: string;
  label: string;
};

const initialColumns: Column[] = [
    { id: 'productId', label: 'Product ID' },
    { id: 'description', label: 'Description' },
    { id: 'altSuppliers', label: 'Alternate suppliers' },
    { id: 'locAvailable', label: 'Location available' },
    { id: 'reorderPoint', label: 'Reorder point' },
    { id: 'reorderVariance', label: 'Reorder variance' },
    { id: 'reorderPointMax', label: 'Reorder point max' },
    { id: 'reorderPointMaxCalc', label: 'Reorder point max calc' },
    { id: 'reorderInQtyOf', label: 'Reorder in qty of' },
    { id: 'qtyToOrder', label: 'Quantity to order' },
];


export default function ReorderLegacyPageContent() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || !db || authLoading) {
      if (!authLoading) setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubSuppliers = onSnapshot(collection(db, 'users', user.uid, 'suppliers'), (snapshot) => {
        setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
        setLoading(false);
    });

    const unsubInventory = onSnapshot(collection(db, 'users', user.uid, 'inventory'), (snapshot) => {
        setInventoryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
    });

    return () => {
        unsubSuppliers();
        unsubInventory();
    }
  }, [user, authLoading]);

  return (
    <AuthGuard>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Reorder</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize this screen</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <div className="p-2 rounded-full bg-muted">
                <RefreshCw className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Reorder</h1>
        </div>

        <p className="text-muted-foreground mb-6">Select location and supplier to preview the list of items to reorder. The list of items can be edited once a purchase order has been created with the create purchase order button.</p>

        <div className="grid md:grid-cols-3 gap-6 items-start mb-6">
            <Card className="md:col-span-1">
                <CardContent className="p-4">
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-sm text-muted-foreground mb-2">Reorder based on quantity on hand and reorder points for this location:</p>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Location options would go here */}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardContent className="p-4">
                    <h3 className="font-semibold">Supplier</h3>
                    <p className="text-sm text-muted-foreground mb-2">Specify suppliers on the product's detail screen to reorder by supplier.</p>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                             {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            <div className="md:col-span-1 flex items-center justify-center">
                 <Button disabled>No purchase orders to create</Button>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Search:" className="max-w-xs" />
            <span className="text-sm font-medium">Filters:</span>
            <Select defaultValue="all-categories">
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-categories">All categories</SelectItem>
                </SelectContent>
            </Select>
             <Select defaultValue="all-manufacturers">
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-manufacturers">All manufacturers</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="border rounded-md overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {columns.map((col) => (
                          <TableHead key={col.id}>
                            {col.id === 'productId' ? (
                               <div className="flex items-center gap-1">
                                <ArrowDown className="w-3 h-3"/> {col.label}
                               </div>
                            ) : col.label}
                          </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={columns.length}>
                            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                                <p className="font-bold">No products match</p>
                                <p>There are no products that have a reorder quantity specified and match the selected filters.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

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
      </main>
    </AuthGuard>
  );
}
