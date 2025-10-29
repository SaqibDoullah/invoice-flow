
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Home, 
    ChevronRight, 
    RefreshCw, 
    ChevronDown, 
    Search, 
    Filter,
    ArrowUpDown,
    ShieldAlert,
    MessageCircle,
    ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { collection, query, onSnapshot } from 'firebase/firestore';

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
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type InventoryItem, type Supplier } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReorderPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [quantityFilter, setQuantityFilter] = useState('gt-zero');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);

        const inventoryUnsub = onSnapshot(collection(db, 'users', user.uid, 'inventory'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            setInventoryItems(items);
            if (loading) setLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch inventory data." });
            setLoading(false);
        });

        const suppliersUnsub = onSnapshot(collection(db, 'users', user.uid, 'suppliers'), (snapshot) => {
            const supplierList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
            setSuppliers(supplierList);
        }, (error) => {
            console.error("Error fetching suppliers:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch supplier data." });
        });

        return () => {
            inventoryUnsub();
            suppliersUnsub();
        };
    }, [user, authLoading, toast]);
    
    const uniqueCategories = useMemo(() => {
        const categories = new Set(inventoryItems.map(item => item.category).filter(Boolean));
        return Array.from(categories);
    }, [inventoryItems]);

    const filteredItems = useMemo(() => {
        return inventoryItems.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm ? 
                (item.name.toLowerCase().includes(searchTermLower) || item.sku?.toLowerCase().includes(searchTermLower))
                : true;
            
            const matchesSupplier = supplierFilter !== 'all' ? item.supplierId === supplierFilter : true;
            
            const matchesCategory = categoryFilter !== 'all' ? item.category === categoryFilter : true;
            
            // Placeholder logic for quantity filter - will be enhanced when reorder logic is implemented
            const matchesQuantity = quantityFilter === 'gt-zero' ? true : true;
            
            // Placeholder for location filter
            const matchesLocation = locationFilter !== 'all' ? true : true;

            return matchesSearch && matchesSupplier && matchesCategory && matchesQuantity && matchesLocation;
        });
    }, [inventoryItems, searchTerm, locationFilter, supplierFilter, quantityFilter, categoryFilter]);

    const isLoading = loading || authLoading;

    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                     <Link href="/purchases" className="flex items-center gap-1 hover:text-foreground">
                        Purchases
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Reorder</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                            <RefreshCw className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Reorder:</h1>
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
                        <Button>Create purchase</Button>
                        <Button variant="outline">Reset quantity</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Export <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Action 1</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mb-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                         <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                <SelectItem value="drop-ship">Location: Drop Ship</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                            <SelectTrigger>
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground"/>
                                    <span>{supplierFilter === 'all' ? 'All suppliers' : suppliers.find(s=>s.id === supplierFilter)?.name}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All suppliers</SelectItem>
                                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gt-zero">Recommended quantity: Quantity to order > 0</SelectItem>
                                <SelectItem value="all">All quantities</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                             <SelectTrigger>
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground"/>
                                    <span>{categoryFilter === 'all' ? 'All categories' : categoryFilter}</span>
                                </div>
                            </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More: 1</Button>
                            <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
                
                 <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md mb-4 space-y-1">
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Filtered: You do not have authorization to view this summary.</span></div>
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Selected: You do not have authorization to view this summary.</span></div>
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Suppliers: You do not have authorization to view this summary.</span></div>
                </div>


                <Card>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-16 text-center"><ImageIcon className="w-4 h-4 mx-auto"/></TableHead>
                                        <TableHead>Product ID Description</TableHead>
                                        <TableHead>Supplier 1 Supplier 1 Price</TableHead>
                                        <TableHead>Supplier 2 Supplier 2 price</TableHead>
                                        <TableHead>Sales velocity</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>On order On hand Reservations Available</TableHead>
                                        <TableHead>Stockout Reorder point ↓ Reorder variance Reorder point max</TableHead>
                                        <TableHead>Recommended quantity</TableHead>
                                        <TableHead>Quantity to order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={10} className="h-48 text-center"><Skeleton className="w-full h-full" /></TableCell></TableRow>
                                    ) : filteredItems.length > 0 ? (
                                        filteredItems.map(item => {
                                            const supplier = suppliers.find(s => s.id === item.supplierId);
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell><ImageIcon className="w-4 h-4 mx-auto text-muted-foreground"/></TableCell>
                                                    <TableCell>
                                                        <p className="font-bold text-primary">{item.sku || item.id}</p>
                                                        <p className="text-xs text-muted-foreground">{item.name}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p>{supplier?.name || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price || 0)}</p>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>0.00</TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>
                                                        <p>{item.quantityOnOrder || 0} / {item.quantity || 0} / {item.quantityReserved || 0} / {item.quantityAvailable || 0}</p>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>0</TableCell>
                                                    <TableCell><Input className="w-24 text-right" defaultValue="0" /></TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="h-24 text-center text-red-600">
                                                There are no products that have a reorder quantity specified and match the selected filters
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
            </main>
        </AuthGuard>
    );
}

