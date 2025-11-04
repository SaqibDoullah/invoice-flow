
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Home, ChevronRight, Boxes, MessageCircle, Info } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { type InventoryItem, type Supplier, type Location } from '@/types';
import { doc, getDoc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductDetailPageContentProps {
    productId: string;
}

const salesHistoryData = [
  { date: 'Sep 23', sales: 0 }, { date: 'Sep 24', sales: 0 },
  { date: 'Sep 25', sales: 0 }, { date: 'Sep 26', sales: 0 },
  { date: 'Sep 27', sales: 0 }, { date: 'Sep 28', sales: 0 },
  { date: 'Sep 29', sales: 0 }, { date: 'Sep 30', sales: 0 },
  { date: 'Oct 01', sales: 0 }, { date: 'Oct 02', sales: 0 },
  { date: 'Oct 03', sales: 0 }, { date: 'Oct 04', sales: 0 },
  { date: 'Oct 05', sales: 0 }, { date: 'Oct 06', sales: 0 },
  { date: 'Oct 07', sales: 0 }, { date: 'Oct 08', sales: 0 },
  { date: 'Oct 09', sales: 0 }, { date: 'Oct 10', sales: 0 },
  { date: 'Oct 11', sales: 0 }, { date: 'Oct 12', sales: 0 },
  { date: 'Oct 13', sales: 0 }, { date: 'Oct 14', sales: 0 },
  { date: 'Oct 15', sales: 0 }, { date: 'Oct 16', sales: 0 },
  { date: 'Oct 17', sales: 0 }, { date: 'Oct 18', sales: 0 },
  { date: 'Oct 19', sales: 0 }, { date: 'Oct 20', sales: 0 },
  { date: 'Oct 21', sales: 0 }, { date: 'Oct 22', sales: 0 },
];

const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
};

const productLookupsData = [
    { lookup: 'sample', status: 'Active', packing: '', lotId: '', notes: 'Finale short code' },
    { lookup: '200001105562', status: 'Active', packing: '', lotId: '', notes: '' },
];


export default function ProductDetailPageContent({ productId }: ProductDetailPageContentProps) {
    const [product, setProduct] = useState<InventoryItem | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    
    const createdBy = "Saqib";
    const lastUpdatedBy = "Saqib";

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if(!authLoading) setLoading(false);
            return;
        }

        const fetchSuppliers = async () => {
             const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
             const supplierSnapshot = await getDocs(supplierCollectionRef);
             const supplierList = supplierSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
             setSuppliers(supplierList);
        }

        const fetchLocations = async () => {
            const locationsCollectionRef = collection(db, 'users', user.uid, 'locations');
            const locationsSnapshot = await getDocs(locationsCollectionRef);
            const locationsList = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
            setLocations(locationsList);
        }
        
        fetchSuppliers();
        fetchLocations();

        const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
        const q = query(itemCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            const foundProduct = items.find(item => item.sku === productId || item.id === productId);
            setProduct(foundProduct || { id: productId, name: 'New Product' });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching product:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, productId]);

    if (loading || authLoading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>
    }

    return (
        <AuthGuard>
            <div className="flex flex-col bg-muted/40">
                <main className="flex-1 container mx-auto p-4 md:p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                                <Boxes className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Products</p>
                                <h1 className="text-2xl font-bold tracking-tight">{product?.sku || productId}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline">Actions</Button>
                            <p className="text-sm text-muted-foreground">All changes saved</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Status:</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                            <p>Created: 3 minutes ago by {createdBy}</p>
                            <p>Last updated: 3 minutes ago by {lastUpdatedBy}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-sm">
                        <div>
                            <p className="font-semibold text-muted-foreground">Stock valuation:</p>
                            <p className="text-blue-600 dark:text-blue-400">Stock valuation requires non-zero stock items.</p>
                        </div>
                         <div>
                            <p className="font-semibold text-muted-foreground">Stock on hand</p>
                            <p>No items on hand</p>
                        </div>
                         <div>
                            <p className="font-semibold text-muted-foreground">Stock on order (from committed purchases)</p>
                            <p>No items on order</p>
                        </div>
                         <div>
                            <p className="font-semibold text-muted-foreground">Stock reservations (from committed sales)</p>
                            <p>No items reserved</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-1 space-y-4 text-sm">
                             <h3 className="font-semibold text-muted-foreground">Product reports</h3>
                             <ul className="space-y-2">
                                <li><Link href="#" className="text-primary hover:underline">Stock on hand, on order, or back ordered</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Purchase history</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Sale history</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Product lookups for this product</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Print labels for items</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Print QR codes labels</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Stock history to PDF</Link></li>
                                <li><Link href="#" className="text-primary hover:underline">Stock history to Excel</Link></li>
                             </ul>
                        </div>
                        <div className="lg:col-span-3 space-y-8">
                             <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Sales history</CardTitle>
                                    <div className="flex items-center gap-4">
                                         <div className="w-48">
                                             <Select defaultValue="last-30">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="last-30">Last 30 days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-32">
                                             <Select defaultValue="day">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="day">Day</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Total: 0.00 units</p>
                                            <p className="text-sm text-muted-foreground">Average: 0.00 units/day</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                     <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                                        <BarChart data={salesHistoryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} accessibilityLayer>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                                            <YAxis domain={[0, 2]} ticks={[0,1,2]} tick={{fontSize: 12}}/>
                                            <ChartTooltip
                                                content={<ChartTooltipContent indicator="line" />}
                                            />
                                            <Bar dataKey="sales" fill="var(--color-sales)" radius={2} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <form className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label htmlFor="productId">Product ID:</label>
                                        <Input id="productId" defaultValue={product?.sku || productId} />
                                    </div>
                                     <div className="space-y-1">
                                        <label htmlFor="description">Description:</label>
                                        <Input id="description" defaultValue={product?.name} />
                                    </div>
                                     <div className="space-y-1">
                                        <label htmlFor="category">Category:</label>
                                        <Select>
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="-- Unspecified --" />
                                            </SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value="none">-- Unspecified --</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="notes">Notes:</label>
                                    <Textarea id="notes" rows={4} />
                                </div>
                                 <div className="grid md:grid-cols-3 gap-6">
                                     <div className="space-y-1">
                                        <label htmlFor="stdPacking">Std packing:</label>
                                        <Input id="stdPacking" />
                                    </div>
                                     <div className="space-y-1">
                                        <label htmlFor="stdBinId">Std bin ID:</label>
                                        <Input id="stdBinId" />
                                    </div>
                                     <div className="space-y-1">
                                        <label htmlFor="unitOfMeasure">Unit of measure:</label>
                                        <Select>
                                            <SelectTrigger id="unitOfMeasure">
                                                <SelectValue placeholder="-- Unspecified --" />
                                            </SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value="none">-- Unspecified --</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                     <Button variant="link" className="p-0 h-auto">Add image</Button>
                                </div>
                            </form>
                            
                             <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Purchasing</CardTitle>
                                    <Link href="#" className="text-sm text-primary hover:underline">help</Link>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <label htmlFor="stdBuyPrice">Std buy price:</label>
                                            <Input id="stdBuyPrice" />
                                        </div>
                                         <div className="space-y-1">
                                            <label htmlFor="stdAccountingCost">Std accounting cost:</label>
                                            <Input id="stdAccountingCost" />
                                        </div>
                                         <div className="space-y-1">
                                            <label htmlFor="lastPurchasePrice">Last purchase price:</label>
                                            <Input id="lastPurchasePrice" readOnly value="-" className="bg-muted"/>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="lastPurchaseDate">Last purchase date:</label>
                                            <Input id="lastPurchaseDate" readOnly value="-" className="bg-muted"/>
                                        </div>
                                    </div>
                                    {[1, 2, 3].map((num) => (
                                        <div key={num} className="space-y-2 border-t pt-4">
                                             <p className="text-sm font-semibold">Supplier {num}</p>
                                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                                 <div className="lg:col-span-1 space-y-1">
                                                    <label>Supplier {num}:</label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="-- Unspecified --" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                             <SelectItem value="none">-- Unspecified --</SelectItem>
                                                             {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label>Supplier {num} price:</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label>Supplier {num} product ID:</label>
                                                    <Input />
                                                </div>
                                                 <div className="space-y-1">
                                                    <label>Supplier {num} qty avail:</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label>Supplier {num} lead days:</label>
                                                    <Input placeholder="Default for supp"/>
                                                </div>
                                                <div className="space-y-1">
                                                    <label>Supplier {num} comments:</label>
                                                    <Input />
                                                </div>
                                             </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Reordering</CardTitle>
                                    <Link href="#" className="text-sm text-primary hover:underline">help</Link>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm">Reorder calculation method:</label>
                                        <Select>
                                            <SelectTrigger className="w-64">
                                                <SelectValue placeholder="Default from settings" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Default from settings</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-x-4 gap-y-2 items-center text-sm">
                                        <div></div>
                                        <div className="font-semibold">Std reorder point:</div>
                                        <div className="font-semibold">Std reorder point max:</div>
                                        <div className="font-semibold">Std reorder in qty of:</div>
                                        
                                        {locations.map(loc => (
                                            <React.Fragment key={loc.id}>
                                                <div className="font-semibold">{loc.name}:</div>
                                                <Input /> <Input /> <Input />
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Selling</CardTitle></CardHeader>
                                <CardContent className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1"><label>Item price:</label><Input /></div>
                                    <div className="space-y-1"><label>Case price:</label><Input /></div>
                                    <div className="space-y-1"><label>Std lead days:</label><Input /></div>
                                    <div className="space-y-1"><label>Amazon ASIN:</label><Input /></div>
                                    <div className="space-y-1"><label>UPC:</label><Input /></div>
                                    <div className="space-y-1"><label>EAN:</label><Input /></div>
                                    <div className="space-y-1"><label>Code 128:</label><Input /></div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Valuation</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="space-y-1"><label>Average cost:</label><Input readOnly value="-" className="bg-muted"/></div>
                                        <p className="text-sm text-primary">To begin tracking average cost add a <Link href="/purchases/new" className="underline">purchase order</Link>.</p>
                                    </div>
                                    <div className="grid grid-cols-2 text-sm">
                                        <div className="font-semibold">Stock quantities:</div>
                                        <div className="grid grid-cols-5 gap-4">
                                            <div className="space-y-1"><label>Units in stock:</label><Input readOnly value="0" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Units in transit:</label><Input readOnly value="0" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Units packed:</label><Input readOnly value="0" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Units WIP:</label><Input readOnly value="0" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Units total:</label><Input readOnly value="0" className="bg-muted"/></div>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-2 text-sm mt-4">
                                        <div className="font-semibold">Stock valuation:</div>
                                        <div className="grid grid-cols-5 gap-4">
                                            <div className="space-y-1"><label>Value in stock:</label><Input readOnly value="-" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Value in transit:</label><Input readOnly value="-" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Value packed:</label><Input readOnly value="-" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Value WIP:</label><Input readOnly value="-" className="bg-muted"/></div>
                                            <div className="space-y-1"><label>Value total:</label><Input readOnly value="-" className="bg-muted"/></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Manufacturer</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label>Manufacturer:</label><Input /></div>
                                    <div className="space-y-1"><label>Mfg product ID:</label><Input /></div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label>Weight per unit:</label><Input /></div>
                                    <div className="space-y-1">
                                        <label>Weight unit:</label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Pound" /></SelectTrigger>
                                            <SelectContent><SelectItem value="pound">Pound</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Product lookups</CardTitle>
                                    <Link href="#" className="text-sm text-primary hover:underline">Create Lookup</Link>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product lookup</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Packing</TableHead>
                                                <TableHead>Lot ID</TableHead>
                                                <TableHead>Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productLookupsData.map((lookup, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-primary font-medium">{lookup.lookup}</TableCell>
                                                    <TableCell>{lookup.status}</TableCell>
                                                    <TableCell>{lookup.packing}</TableCell>
                                                    <TableCell>{lookup.lotId}</TableCell>
                                                    <TableCell>{lookup.notes}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <p className="text-sm text-muted-foreground mt-2">Showing first {productLookupsData.length} of {productLookupsData.length} rows</p>
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                    <div className="fixed bottom-8 right-8">
                        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                            <MessageCircle className="w-8 h-8" />
                        </Button>
                     </div>
                </main>
            </div>
        </AuthGuard>
    )
}
