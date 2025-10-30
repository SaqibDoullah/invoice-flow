
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Search, MessageCircle, ChevronDown, Truck, Undo2, RefreshCw, Filter, ArrowUpDown, ShieldAlert, Upload, Download, Settings2, Checkbox, ArrowDown } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { format, isValid } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AuthGuard from '@/components/auth/auth-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type StockHistoryEntry } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockShipments = [
    { id: '100845', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/29/2025', shipUser: 'Juan', receiveDate: '10/29/2025', receiveUser: 'Juan' },
    { id: '100844', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/29/2025', shipUser: 'Juan', receiveDate: '10/29/2025', receiveUser: 'Juan' },
    { id: '100843', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/29/2025', shipUser: 'Juan', receiveDate: '10/29/2025', receiveUser: 'Juan' },
    { id: '100842', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/29/2025', shipUser: 'Juan', receiveDate: '10/29/2025', receiveUser: 'Juan' },
    { id: '100841', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: '', shipDate: '10/28/2025', shipUser: 'Juan', receiveDate: '10/28/2025', receiveUser: 'Juan' },
    { id: '100840', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: '', shipDate: '10/28/2025', shipUser: 'Juan', receiveDate: '10/28/2025', receiveUser: 'Juan' },
    { id: '100839', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/24/2025', shipUser: 'Juan', receiveDate: '10/24/2025', receiveUser: 'Juan' },
    { id: '100838', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: '', shipDate: '10/24/2025', shipUser: 'Juan', receiveDate: '10/24/2025', receiveUser: 'Juan' },
    { id: '100837', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/24/2025', shipUser: 'Juan', receiveDate: '10/24/2025', receiveUser: 'Juan' },
    { id: '100836', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/22/2025', shipUser: 'Juan', receiveDate: '10/22/2025', receiveUser: 'Juan' },
    { id: '100835', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/21/2025', shipUser: 'Juan', receiveDate: '10/21/2025', receiveUser: 'Juan' },
    { id: '100834', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/21/2025', shipUser: 'Juan', receiveDate: '10/21/2025', receiveUser: 'Juan' },
    { id: '100833', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/21/2025', shipUser: 'Juan', receiveDate: '10/21/2025', receiveUser: 'Juan' },
    { id: '100832', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/21/2025', shipUser: 'Juan', receiveDate: '10/21/2025', receiveUser: 'Juan' },
    { id: '100831', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: 'Tawakkal Warehouse', destination: 'Tawakkal Warehouse', shipDate: '10/17/2025', shipUser: 'Juan', receiveDate: '10/17/2025', receiveUser: 'Juan' },
    { id: '100830', status: 'Received', orderId: '', carrier: '', trackingCode: '', origin: '', destination: 'Tawakkal Warehouse', shipDate: '10/16/2025', shipUser: 'Juan', receiveDate: '10/16/2025', receiveUser: 'Juan' },
];


export default function TransfersPageContent() {
    const [recentTransfers, setRecentTransfers] = useState<StockHistoryEntry[]>([]);
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
        const historyCollectionRef = collection(db, 'users', user.uid, 'stockHistory');
        // Assuming 'Transfer' is a possible value in the 'transaction' field
        const q = query(historyCollectionRef, where('transaction', '==', 'Transfer'), orderBy('timestamp', 'desc'), limit(5));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHistoryEntry));
            setRecentTransfers(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching recent transfers:", error);
            // Don't show toast if it's just no data
            if(error.code !== 'not-found') {
              toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recent transfers.' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);
    
    const toDate = (v: any): Date | null => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (typeof v.toDate === 'function') return v.toDate();
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };


    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                <Tabs defaultValue="orders">
                    <TabsList>
                        <TabsTrigger value="quick">Quick stock transfers</TabsTrigger>
                        <TabsTrigger value="orders">Transfer orders</TabsTrigger>
                        <TabsTrigger value="shipments">Transfer shipments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quick" className="mt-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Create Quick Stock Transfer</h2>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex gap-8">
                                            <div className="flex flex-col items-center">
                                                {[...Array(6)].map((_, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                            {i + 1}
                                                        </div>
                                                        {i < 5 && <div className="w-px h-16 bg-border" />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex-1 space-y-9">
                                                <div className="space-y-1 pt-1">
                                                    <label className="text-sm font-medium">Select product to transfer</label>
                                                    <div className="relative">
                                                        <Input placeholder="-- Unspecified --" />
                                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select FROM sublocation, lot id or packing to change</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Enter quantity to transfer</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select TO destination sublocation</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Note</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Enter date of transfer</label>
                                                    <Input type="date" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-6">
                                    <Button>Commit quick stock transfer</Button>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                 <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">&nbsp;</h2>
                                <Card>
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle>Recent quick stock transfers</CardTitle>
                                        <div className="p-2 bg-muted rounded-full">
                                            <Undo2 className="w-4 h-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {loading ? (
                                            <div className="space-y-4">
                                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full"/>)}
                                            </div>
                                        ) : recentTransfers.length > 0 ? (
                                            recentTransfers.map(t => (
                                                <div key={t.id} className="text-sm border-b pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-medium text-primary max-w-[80%]">{t.productId} - {t.description}</p>
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0"/>
                                                    </div>
                                                    <p>{format(toDate(t.timestamp)!, 'M/d/yyyy')} &bull; {t.details}</p>
                                                    <p className="text-xs text-muted-foreground">Committed {format(toDate(t.timestamp)!, 'PPp')} by {t.user}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm text-center py-4">No recent quick stock transfers.</p>
                                        )}
                                        <div className="text-center">
                                            <Button variant="link">View full quick stock transfer history</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="orders" className="mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                                    <RefreshCw className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Link href="/" className="hover:text-foreground">Home</Link>
                                    </div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Transfer Orders:
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="text-2xl font-bold p-1">
                                                    Default <ChevronDown className="w-5 h-5 ml-1" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>Default</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild>
                                    <Link href="/inventory/transfers/new">Create transfer order</Link>
                                </Button>
                                <Button variant="outline">Import transfer orders</Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Export <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent><DropdownMenuItem>Export CSV</DropdownMenuItem></DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent><DropdownMenuItem>Action 1</DropdownMenuItem></DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="text-center py-10">
                            <h2 className="text-xl font-semibold">Let's add transfer orders to your account</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Transfer orders can be found here. They are manually created, used to plan transfer shipments between locations.</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader className="items-center">
                                    <Image src="https://picsum.photos/seed/spreadsheet/150/100" alt="Spreadsheet icon" width={150} height={100} className="rounded-md" />
                                </CardHeader>
                                <CardContent className="text-center">
                                    <h3 className="font-semibold mb-2">Import transfer orders from spreadsheet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Finale Inventory has a powerful import from spreadsheet feature that is a fast method to have all your transfer orders imported with all their data.</p>
                                    <Button>Import from spreadsheet</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="items-center">
                                     <Image src="https://picsum.photos/seed/form/150/100" alt="Form icon" width={150} height={100} className="rounded-md"/>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <h3 className="font-semibold mb-2">Add transfer orders manually</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Finally, you have the option to enter transfer orders manually into Finale Inventory. You just need to fill the info about each transfer order in the input form.</p>
                                     <Button asChild>
                                        <Link href="/inventory/transfers/new">Create transfer order manually</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </TabsContent>
                    <TabsContent value="shipments" className="mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                                    <Truck className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Link href="/" className="hover:text-foreground">Home</Link>
                                    </div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Transfer Shipments:
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="text-2xl font-bold p-1">
                                                    Default <ChevronDown className="w-5 h-5 ml-1" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>Default</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button>Create transfer shipment</Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Export <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent><DropdownMenuItem>Export CSV</DropdownMenuItem></DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent><DropdownMenuItem>Action 1</DropdownMenuItem></DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="mb-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <Input placeholder="Search..." />
                                <Input placeholder="Status: Editable, Packed, Received, Shipped, Unpacked" />
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Ship date actual: All dates" /></SelectTrigger>
                                </Select>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Receive date actual: All dates" /></SelectTrigger>
                                </Select>
                                <div className="relative">
                                    <Input placeholder="Product" />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters...</Button>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                    <ShieldAlert className='w-4 h-4 text-orange-500' />
                                    <span>Filtered: You do not have authorization to view this summary.</span>
                                    <span className='ml-4'>Selected: You do not have authorization to view this summary.</span>
                                </div>
                                <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"><Checkbox /></TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead><div className="flex items-center gap-1"><ArrowUp className="w-4 h-4"/> Shipment ID</div></TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Tracking code</TableHead>
                                            <TableHead>Origin</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Ship date</TableHead>
                                            <TableHead>Ship user</TableHead>
                                            <TableHead>Receive date</TableHead>
                                            <TableHead>Receive user</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockShipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell><Checkbox /></TableCell>
                                                <TableCell>{shipment.status}</TableCell>
                                                <TableCell className="text-primary font-medium">{shipment.id}</TableCell>
                                                <TableCell>{shipment.orderId}</TableCell>
                                                <TableCell>{shipment.carrier}</TableCell>
                                                <TableCell>{shipment.trackingCode}</TableCell>
                                                <TableCell>{shipment.origin}</TableCell>
                                                <TableCell>{shipment.destination}</TableCell>
                                                <TableCell>{shipment.shipDate}</TableCell>
                                                <TableCell>{shipment.shipUser}</TableCell>
                                                <TableCell>{shipment.receiveDate}</TableCell>
                                                <TableCell>{shipment.receiveUser}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
                <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </main>
        </AuthGuard>
    );
}

const ArrowUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
)

