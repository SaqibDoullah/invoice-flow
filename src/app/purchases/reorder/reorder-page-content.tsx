
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
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { subDays } from 'date-fns';

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
import { type InventoryItem, type Supplier, type SalesOrder, type LineItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReorderPageContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [quantityFilter, setQuantityFilter] = useState('gt-zero');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [quantitiesToOrder, setQuantitiesToOrder] = useState<Record<string, number>>({});

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        let inventoryLoaded = false;
        let suppliersLoaded = false;
        let salesLoaded = false;

        const checkAllLoaded = () => {
            if (inventoryLoaded && suppliersLoaded && salesLoaded) {
                setLoading(false);
            }
        }

        const inventoryUnsub = onSnapshot(collection(db, 'users', user.uid, 'inventory'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            setInventoryItems(items);
            inventoryLoaded = true;
            checkAllLoaded();
        }, (error) => {
            console.error("Error fetching inventory:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch inventory data." });
            setLoading(false);
        });

        const suppliersUnsub = onSnapshot(collection(db, 'users', user.uid, 'suppliers'), (snapshot) => {
            const supplierList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
            setSuppliers(supplierList);
            suppliersLoaded = true;
            checkAllLoaded();
        }, (error) => {
            console.error("Error fetching suppliers:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch supplier data." });
        });

        const thirtyDaysAgo = subDays(new Date(), 30);
        const salesQuery = query(collection(db, 'users', user.uid, 'sales'), where('orderDate', '>=', thirtyDaysAgo));
        const salesUnsub = onSnapshot(salesQuery, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
            setSales(salesData);
            salesLoaded = true;
            checkAllLoaded();
        }, (error) => {
            console.error("Error fetching sales data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch recent sales data." });
        });

        return () => {
            inventoryUnsub();
            suppliersUnsub();
            salesUnsub();
        };
    }, [user, authLoading, toast]);
    
    const uniqueCategories = useMemo(() => {
        return Array.from(
          new Set(
            inventoryItems
              .map((item) => item.category)
              .filter((c): c is string => typeof c === 'string' && c.length > 0)
          )
        );
      }, [inventoryItems]);

    const salesVelocityMap = useMemo(() => {
        const velocityMap: Record<string, number> = {};
        inventoryItems.forEach(item => {
            const sku = item.sku || item.id;
            const totalSold = sales.reduce((acc, order) => {
                return acc + (order.items || []).reduce((itemAcc: number, lineItem: LineItem) => {
                    if (lineItem.specification === sku) {
                        return itemAcc + lineItem.quantity;
                    }
                    return itemAcc;
                }, 0);
            }, 0);
            velocityMap[sku] = totalSold / 30; // Units per day
        });
        return velocityMap;
    }, [sales, inventoryItems]);

    const filteredItems = useMemo(() => {
        return inventoryItems.map(item => {
            const reorderPoint = item.stdReorderPoint || 0;
            const available = item.quantityAvailable || 0;
            const reorderVariance = available - reorderPoint;
            const recommendedQty = reorderVariance < 0 ? Math.abs(reorderVariance) : 0;
            return { ...item, reorderVariance, recommendedQty };
        }).filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm ? 
                (item.name.toLowerCase().includes(searchTermLower) || item.sku?.toLowerCase().includes(searchTermLower))
                : true;
            
            const matchesSupplier = supplierFilter !== 'all' ? item.supplierId === supplierFilter : true;
            
            const matchesCategory = categoryFilter !== 'all' ? item.category === categoryFilter : true;
            
            const matchesQuantity = quantityFilter === 'gt-zero' ? item.recommendedQty > 0 : true;
            
            const matchesLocation = locationFilter !== 'all' ? true : true; // Placeholder

            return matchesSearch && matchesSupplier && matchesCategory && matchesQuantity && matchesLocation;
        });
    }, [inventoryItems, searchTerm, locationFilter, supplierFilter, quantityFilter, categoryFilter]);

    const handleQuantityChange = (itemId: string, quantity: string) => {
        setQuantitiesToOrder(prev => ({
            ...prev,
            [itemId]: Number(quantity) || 0
        }));
    };

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
                                <Button variant="outline">Export <ChevronDown className="ml-2 h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
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
                                <SelectItem value="gt-zero">Recommended quantity: Quantity to order {'>'} 0</SelectItem>
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
                                {uniqueCategories.filter((c): c is string => c !== undefined).map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
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
                                    <TableRow className="bg-muted/50 text-xs whitespace-nowrap">
                                        <TableHead className="w-16 p-2 text-center">Image</TableHead>
                                        <TableHead className="p-2">Product ID Description</TableHead>
                                        <TableHead className="p-2">Supplier 1 Price</TableHead>
                                        <TableHead className="p-2">Supplier 2 Price</TableHead>
                                        <TableHead className="p-2">Sales velocity</TableHead>
                                        <TableHead className="p-2">Sales</TableHead>
                                        <TableHead className="p-2">On order / On hand / Reservations / Available</TableHead>
                                        <TableHead className="p-2">Stockout / Reorder point / Reorder variance / Reorder point max</TableHead>
                                        <TableHead className="p-2">Recommended quantity</TableHead>
                                        <TableHead className="p-2">Quantity to order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={10} className="h-48 text-center"><Skeleton className="w-full h-full" /></TableCell></TableRow>
                                    ) : filteredItems.length > 0 ? (
                                        filteredItems.map(item => {
                                            const supplier = suppliers.find(s => s.id === item.supplierId);
                                            const sku = item.sku || item.id;
                                            const velocity = salesVelocityMap[sku] || 0;
                                            return (
                                                <TableRow key={item.id} className="text-sm">
                                                    <TableCell><ImageIcon className="w-4 h-4 mx-auto text-muted-foreground"/></TableCell>
                                                    <TableCell>
                                                        <p className="font-bold text-primary">{sku}</p>
                                                        <p className="text-xs text-muted-foreground">{item.name}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p>{supplier?.name || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price || 0)}</p>
                                                    </TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>{velocity.toFixed(2)}</TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>
                                                        <p>{item.quantityOnOrder || 0} / {item.quantity || 0} / {item.quantityReserved || 0} / {item.quantityAvailable || 0}</p>
                                                    </TableCell>
                                                     <TableCell>
                                                        <p>
                                                            - / {item.stdReorderPoint || 0} / <span className={item.reorderVariance < 0 ? 'text-red-500' : ''}>{item.reorderVariance}</span> / {item.stdReorderPointMax || 0}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>{item.recommendedQty}</TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number"
                                                            className="w-24 text-right" 
                                                            value={quantitiesToOrder[item.id] || ''}
                                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        />
                                                    </TableCell>
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
