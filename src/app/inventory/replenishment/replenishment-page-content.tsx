
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, RefreshCw, ChevronDown, Filter, ArrowUpDown, ShieldAlert, MessageCircle, ImageIcon } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import CustomizeColumnsDialog from '@/components/purchases/reorder-legacy-customize-columns-dialog';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { collection, onSnapshot } from 'firebase/firestore';
import { type Location } from '@/types';


type Column = {
  id: string;
  label: string;
};

const initialColumns: Column[] = [
    { id: 'image', label: 'Image' },
    { id: 'product', label: 'Product ID Description' },
    { id: 'originSalesVelocity', label: 'Sales velocity' },
    { id: 'originSales', label: 'Sales' },
    { id: 'originStock', label: 'On order On hand Reservations Available' },
    { id: 'originStockout', label: 'Stockout' },
    { id: 'destSalesVelocity', label: 'Sales velocity' },
    { id: 'destSales', label: 'Sales' },
    { id: 'destStock', label: 'On order On hand Reservations Available' },
    { id: 'destReplenishment', label: 'Stockout Replenishment point Replenishment variance Replenishment point max' },
    { id: 'recommendedQty', label: 'Recommended quantity' },
    { id: 'transferQty', label: 'Transfer quantity' },
];


export default function ReplenishmentPageContent() {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [originLocation, setOriginLocation] = useState<string | undefined>();
    const [destinationLocation, setDestinationLocation] = useState<string | undefined>();

    useEffect(() => {
        if (authLoading || !user) return;
        const db = getFirestoreDb();
        if (!db) return;

        const unsub = onSnapshot(collection(db, 'users', user.uid, 'locations'), (snapshot) => {
            const fetchedLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
            setLocations(fetchedLocations);
            if (fetchedLocations.length > 0) {
                setOriginLocation(fetchedLocations[0].id);
            }
             if (fetchedLocations.length > 1) {
                setDestinationLocation(fetchedLocations[1].id);
            }
        });

        return () => unsub();
    }, [user, authLoading]);

    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                            <RefreshCw className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link href="/" className="hover:text-foreground">Home</Link>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Replenishment:
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="text-2xl font-bold p-1">
                                            Main view <ChevronDown className="w-5 h-5 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Main view</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button>Create transfer order</Button>
                        <Button variant="outline">Reset quantity</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline">Export <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize columns</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="text-xs text-muted-foreground">Search</label>
                            <Input placeholder="" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Origin</label>
                            <Select value={originLocation} onValueChange={setOriginLocation}>
                                <SelectTrigger><SelectValue placeholder="Select Origin" /></SelectTrigger>
                                <SelectContent>
                                    {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Origin quantity</label>
                            <Select defaultValue="remaining"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="remaining">Remaining after reservations...</SelectItem></SelectContent></Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Destination</label>
                             <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                                <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                                <SelectContent>
                                    {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Destination recommended quantity</label>
                            <Select defaultValue="gt-zero"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="gt-zero">Transfer quantity > 0</SelectItem></SelectContent></Select>
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More: 1</Button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <ShieldAlert className='w-4 h-4 text-orange-500' />
                            <span>Filtered: You do not have authorization to view this summary.</span>
                            <span className="ml-4">Selected: You do not have authorization to view this summary.</span>
                        </div>
                        <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
                    </div>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                    <Table className="whitespace-nowrap">
                        <TableHeader>
                            <TableRow className="bg-muted/50 text-xs">
                                <TableHead rowSpan={2} className="p-2 border-r"><Checkbox className="mr-2"/>Image</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r">Product ID Description</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r">Sales velocity</TableHead>
                                <TableHead colSpan={4} className="p-2 text-center border-b border-r">Origin</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r">Stockout</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r">Sales velocity</TableHead>
                                <TableHead colSpan={4} className="p-2 text-center border-b border-r">Destination</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r w-40">Stockout Replenishment point Replenishment variance Replenishment point max</TableHead>
                                <TableHead rowSpan={2} className="p-2 border-r">Recommended quantity</TableHead>
                                <TableHead rowSpan={2} className="p-2">Transfer quantity</TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/50 text-xs">
                                <TableHead className="p-2 border-r">Sales</TableHead>
                                <TableHead className="p-2 border-r w-24">On order On hand Reservations Available</TableHead>
                                <TableHead className="p-2 border-r">Stockout</TableHead>
                                <TableHead className="p-2 border-r">Sales</TableHead>
                                <TableHead className="p-2 border-r">Sales</TableHead>
                                <TableHead className="p-2 border-r w-24">On order On hand Reservations Available</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={15} className="p-4 h-24 text-left text-red-600">
                                    No results found
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
