
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
import { type InventoryItem, type Supplier } from '@/types';
import { doc, getDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

export default function ProductDetailPageContent({ productId }: ProductDetailPageContentProps) {
    const [product, setProduct] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    
    // In a real app, you would fetch this data or calculate it
    const createdBy = "Saqib";
    const lastUpdatedBy = "Saqib";

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if(!authLoading) setLoading(false);
            return;
        }

        // For a real implementation, you would fetch a single document.
        // Since we don't have an edit/creation flow yet that writes to the DB,
        // we'll listen to the whole collection and find our product.
        const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
        const q = query(itemCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            // Find the item with a matching SKU or ID
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
                                <div>
                                     <Button variant="link" className="p-0 h-auto">Add image</Button>
                                </div>
                            </form>
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
