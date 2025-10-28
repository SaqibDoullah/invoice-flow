
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { 
    DollarSign,
    Home, 
    ChevronRight, 
    Printer, 
    ChevronDown, 
    Check, 
    Info,
    Search,
    Trash2,
    Plus,
    MessageCircle,
    Receipt,
    Users,
    History,
    ArrowDown,
    X,
    ChevronsUpDown,
    ShoppingCart,
    MessageSquareQuote
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Customer, type InventoryItem } from '@/types';
import AddCustomerDialog from '@/components/customers/add-customer-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SalesOrderPageContentProps {
    orderId: string;
}

type OrderStatus = 'Draft' | 'Committed' | 'Completed' | 'Canceled';

export default function SalesOrderPageContent({ orderId }: SalesOrderPageContentProps) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [billToAddress, setBillToAddress] = useState('--');
    const [shipToAddress, setShipToAddress] = useState('--');
    const [status, setStatus] = useState<OrderStatus>('Draft');
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    useEffect(() => {
        const db = getFirestoreDb();
        if (authLoading || !user || !db) {
            if (!authLoading) {
                setInventoryLoading(false);
            }
            return;
        }

        const customersRef = collection(db, 'users', user.uid, 'customers');
        const qCustomers = query(customersRef);
        const unsubscribeCustomers = onSnapshot(qCustomers, (snapshot) => {
            const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
            setCustomers(customersData);
        }, (error) => {
            console.error("Error fetching customers:", error);
        });

        setInventoryLoading(true);
        const inventoryRef = collection(db, 'users', user.uid, 'inventory');
        const qInventory = query(inventoryRef);
        const unsubscribeInventory = onSnapshot(qInventory, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
            setInventoryItems(itemsData);
            setInventoryLoading(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setInventoryLoading(false);
        });


        return () => {
            unsubscribeCustomers();
            unsubscribeInventory();
        };
    }, [user, authLoading]);

    const selectedCustomerName = customers.find(c => c.id === selectedCustomerId)?.name || 'Unspecified';

    const handleSaveAddress = () => {
        setIsEditingAddress(false);
    };

    const handleStatusChange = (newStatus: OrderStatus) => {
        setStatus(newStatus);
    }

    return (
        <AuthGuard>
            <div className="flex flex-col bg-muted/40">
                <main className="flex-1 container mx-auto p-4 md:p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                             <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Sales</p>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <span>{orderId}</span>
                                    <span className="text-muted-foreground">&bull;</span>
                                    <span className="text-muted-foreground">10/27/2025</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Import sales order items</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Duplicate order</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate order with selection</DropdownMenuItem>
                                    <DropdownMenuItem>Create purchase order for drop ship</DropdownMenuItem>
                                    <DropdownMenuItem>Create purchase order for drop ship with selection</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Customize this screen</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span className="text-sm text-muted-foreground">All changes saved</span>
                        </div>
                    </div>

                    <Tabs defaultValue="sale" className="w-full">
                        <div className="border-b">
                            <TabsList className="bg-transparent p-0 -mb-px">
                                <TabsTrigger value="quote" asChild>
                                  <Link href="/quotes" className='data-[state=active]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none'>Quote</Link>
                                </TabsTrigger>
                                <TabsTrigger value="sale" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Sale</TabsTrigger>
                                <TabsTrigger value="products" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Products view</TabsTrigger>
                                <TabsTrigger value="shipments" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Shipments</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="quote">
                            <p className="p-4">Quote content goes here.</p>
                        </TabsContent>
                        <TabsContent value="sale" className="mt-4">
                                <div className="grid lg:grid-cols-3 gap-8 items-start">
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Information</CardTitle></CardHeader>
                                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <LabelWithTooltip label="Customer" tooltip="The customer for this sale." />
                                                    <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={isCustomerPopoverOpen}
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                <span className="truncate">{selectedCustomerName}</span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[300px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search customer..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No customer found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {customers.map((customer) => (
                                                                            <CommandItem
                                                                                key={customer.id}
                                                                                value={customer.name}
                                                                                onSelect={() => {
                                                                                    setSelectedCustomerId(customer.id);
                                                                                    setIsCustomerPopoverOpen(false);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {customer.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                                <div className="p-1 border-t">
                                                                    <CommandItem onSelect={() => {
                                                                        setIsCustomerPopoverOpen(false);
                                                                        setIsAddCustomerOpen(true);
                                                                    }}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Create new customer
                                                                    </CommandItem>
                                                                </div>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Source</label><Input /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Order date</label><Input type="date" defaultValue="2025-10-27" /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Origin</label><Input defaultValue="Tawakkal Warehouse" /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Estimated ship date</label><Input type="date" /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Customer PO</label><Input /></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Fulfillment</label><Input /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Terms</label><Input /></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Requested shipping</label><Input /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Price level</label><Input defaultValue="Item/case price"/><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Batch ID</label><Input /></div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Address Information</CardTitle></CardHeader>
                                            <CardContent>
                                                {isEditingAddress ? (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div><label className="text-sm font-semibold">Bill to</label><Input value={billToAddress} onChange={(e) => setBillToAddress(e.target.value)} /></div>
                                                        <div><label className="text-sm font-semibold">Ship to</label><Input value={shipToAddress} onChange={(e) => setShipToAddress(e.target.value)} /></div>
                                                        <div><label className="text-sm font-semibold">Ship from</label><p className="text-sm pt-2">Heartland</p></div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div><p className="font-semibold">Bill to</p><p>{billToAddress}</p></div>
                                                        <div><p className="font-semibold">Ship to</p><p>{shipToAddress}</p></div>
                                                        <div><p className="font-semibold">Ship from</p><p>Heartland</p></div>
                                                    </div>
                                                )}
                                                {isEditingAddress ? (
                                                    <div className='flex gap-2'>
                                                        <Button variant="link" className="p-0 h-auto mt-2" onClick={handleSaveAddress}>Save</Button>
                                                        <Button variant="link" className="p-0 h-auto mt-2 text-muted-foreground" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setIsEditingAddress(true)}>Edit bill to, ship to, or ship from address</Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Custom Fields</CardTitle></CardHeader>
                                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-1"><label>Employee Name</label><Input/></div>
                                                <div className="space-y-1"><label>Product Type</label><Input/></div>
                                                <div className="space-y-1 relative"><label>Sales Person</label><Input/><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label>Business Type</label><Input/></div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between mb-4">
                                                    <Button variant="outline" size="sm"><Trash2 className="mr-2"/> Delete items</Button>
                                                    <p className="text-sm text-muted-foreground">Summary: TOTAL 0 units</p>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm whitespace-nowrap">
                                                        <thead>
                                                            <tr className="border-b text-muted-foreground">
                                                                <th className="p-2 font-normal text-left">Warning</th>
                                                                <th className="p-2 font-normal text-left">Item note</th>
                                                                <th className="p-2 font-normal text-left">Product</th>
                                                                <th className="p-2 font-normal text-right">Quantity</th>
                                                                <th className="p-2 font-normal text-right">Quantity shipped units</th>
                                                                <th className="p-2 font-normal text-right">Quantity not shipped units</th>
                                                                <th className="p-2 font-normal text-right">List Price</th>
                                                                <th className="p-2 font-normal text-right">Discount</th>
                                                                <th className="p-2 font-normal text-right">Last purchase price</th>
                                                                <th className="p-2 font-normal text-right">Price</th>
                                                                <th className="p-2 font-normal text-right">Subtotal</th>
                                                                <th className="p-2 font-normal text-right">Income after adjustments</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr><td colSpan={12} className="p-4 text-center text-muted-foreground">Type on last line to add an item. Additional lines are automatically added.</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="flex justify-between items-start mt-4">
                                                    <Button variant="link" className="p-0 h-auto text-primary">Show income after adjustments details</Button>
                                                    <div className="w-full max-w-xs space-y-1 text-sm text-right">
                                                        <p>Total: $0.00</p>
                                                        <Button variant="link" className="p-0 h-auto text-primary">Add new discount/fee/tax</Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="flex-row items-center gap-2 space-y-0">
                                                <DollarSign className="w-5 h-5 text-muted-foreground"/>
                                                <CardTitle>Sale</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1 text-sm">
                                                <p><span className="font-semibold">Status:</span> <Badge variant={status === 'Draft' ? 'secondary' : 'default'} className={status === 'Committed' ? 'bg-green-100 text-green-800' : ''}>{status}</Badge></p>
                                                <p><span className="font-semibold">Shipment status:</span> Not packed or shipped</p>
                                                <p><span className="font-semibold">Invoice status:</span> No invoice posted</p>
                                                <p><span className="font-semibold">Due date:</span> 10/27/2025</p>
                                                <p><span className="font-semibold">Synced from:</span> --</p>
                                                <p><span className="font-semibold">Last synced from:</span> --</p>
                                                <p><span className="font-semibold">Synced to:</span> --</p>
                                                <p><span className="font-semibold">Last synced to:</span> --</p>
                                            </CardContent>
                                            <CardContent className="p-4 border-t">
                                                <div className="space-y-2">
                                                    {status === 'Draft' && <Button variant="outline" className="w-full" onClick={() => handleStatusChange('Committed')}>Change status to committed</Button>}
                                                    {status === 'Committed' && <Button variant="outline" className="w-full" onClick={() => handleStatusChange('Completed')}>Change status to completed</Button>}
                                                    {(status === 'Draft' || status === 'Committed') && <Button variant="link" className="w-full text-destructive" onClick={() => handleStatusChange('Canceled')}>Cancel sale</Button>}
                                                    {status === 'Completed' && <p className="text-sm text-center text-muted-foreground">This sale is completed.</p>}
                                                    {status === 'Canceled' && <p className="text-sm text-center text-destructive">This sale is canceled.</p>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex-row items-center gap-2 space-y-0">
                                                <ShoppingCart className="w-5 h-5 text-muted-foreground"/>
                                                <CardTitle>Shipments</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <p className="font-semibold text-primary hover:underline cursor-pointer">Sale shipment {orderId}-1</p>
                                                <p className="text-sm text-muted-foreground">Editable</p>
                                                <Button variant="outline" className="w-full">Ship sales order</Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        <TabsContent value="products" className="mt-4">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                     <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground font-semibold">Summary: TOTAL: 0 units</p>
                                     </div>
                                     <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative">
                                            <Input placeholder="Search..." className="pl-8" />
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                        </div>
                                        <span className="text-sm font-semibold">Filters:</span>
                                        <div className="relative">
                                             <Input placeholder="All suppliers" className="w-40" />
                                             <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="relative">
                                             <Input placeholder="All locations" className="w-40" />
                                             <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                        </Select>
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="All manufacturers" />
                                            </SelectTrigger>
                                        </Select>
                                         <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="QoH total > 0" />
                                            </SelectTrigger>
                                        </Select>
                                     </div>
                                    <div className="border rounded-md overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="p-2 font-medium text-left flex items-center gap-1"><ArrowDown className="w-4 h-4"/> Product ID</TableHead>
                                                    <TableHead className="p-2 font-medium text-left">Description</TableHead>
                                                    <TableHead className="p-2 font-medium text-left">Std packing</TableHead>
                                                    <TableHead colSpan={3} className="p-2 font-medium text-center border-l">Open Stock</TableHead>
                                                    <TableHead colSpan={3} className="p-2 font-medium text-center border-l">Case Stock</TableHead>
                                                    <TableHead className="p-2 font-medium text-left border-l">Sublocation(s)</TableHead>
                                                </TableRow>
                                                <TableRow className="border-b bg-muted/50">
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 border-l"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inventoryLoading ? (
                                                     <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                                ) : inventoryItems.length > 0 ? (
                                                    inventoryItems.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="p-2 text-primary">{product.sku || product.id}</TableCell>
                                                        <TableCell className="p-2">{product.name}</TableCell>
                                                        <TableCell className="p-2">{product.stdPacking || ''}</TableCell>
                                                        <TableCell className="p-2 text-right border-l">{product.quantity}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.quantityAvailable}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.quantityOnOrder}</TableCell>
                                                        <TableCell className="p-2 text-right border-l">{product.casesOnHand}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.casesAvailable}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.casesOnOrder}</TableCell>
                                                        <TableCell className="p-2 border-l">{product.sublocation}</TableCell>
                                                    </TableRow>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No items to display.</td></tr>
                                                )}
                                            </TableBody>
                                        </Table>
                                     </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="shipments" className="mt-4">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">Shipment ID: {orderId}-1</h3>
                                            <p className="text-sm text-muted-foreground">Status: Editable</p>
                                        </div>
                                        <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
                                            <p>Shipment can not be packed or shipped since it is empty.</p>
                                            <p>Manually enter quantities for the shipment in the table below.</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">All shipment products and quantities match ordered products and quantities.</p>
                                        <p className="text-sm text-muted-foreground">Created: Oct 27 2025 3:57:49 pm by Saqib</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4">
                                            <div className="space-y-1"><label className="text-xs">Carrier</label><Select><SelectTrigger><SelectValue placeholder="-- Unspecified --"/></SelectTrigger></Select></div>
                                            <div className="space-y-1"><label className="text-xs">Tracking number</label><Input/></div>
                                            <div className="space-y-1"><label className="text-xs">Estimated ship date</label><Input type="date"/></div>
                                            <div className="space-y-1"><label className="text-xs">Estimated delivery date</label><Input type="date"/></div>
                                            <div className="space-y-1"><label className="text-xs">Shipment origin</label><Select><SelectTrigger><SelectValue placeholder="Default to order origin (Tawakkal Wa..."/></SelectTrigger></Select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1"><label className="text-xs">Public notes</label><Textarea/></div>
                                            <div className="space-y-1"><label className="text-xs">Internal notes</label><Textarea/></div>
                                        </div>
                                    </div>
                                     <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative">
                                            <Input placeholder="Search..." className="pl-8" />
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                        </div>
                                        <span className="text-sm font-semibold">Filters:</span>
                                        <div className="relative">
                                             <Input placeholder="All locations" className="w-40" />
                                             <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                        </Select>
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="All manufacturers" />
                                            </SelectTrigger>
                                        </Select>
                                         <Select>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Order or Shipment > 0" />
                                            </SelectTrigger>
                                        </Select>
                                        <Input placeholder="All lot ids" className="w-32" />
                                     </div>
                                      <div className="border rounded-md overflow-x-auto">
                                        <table className="w-full text-sm whitespace-nowrap">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b">
                                                    <th className="p-2 font-medium text-left flex items-center gap-1"><Checkbox className="mr-2" /> <ArrowDown className="w-4 h-4"/> Product ID</th>
                                                    <th className="p-2 font-medium text-left">Description</th>
                                                    <th colSpan={4} className="p-2 font-medium text-center border-l">Open Stock</th>
                                                    <th colSpan={4} className="p-2 font-medium text-center border-l">Case Stock</th>
                                                    <th className="p-2 font-medium text-left border-l">Packing</th>
                                                    <th className="p-2 font-medium text-left border-l">Sublocation</th>
                                                    <th className="p-2 font-medium text-left border-l">Lot ID</th>
                                                </tr>
                                                <tr className="border-b">
                                                    <th className="p-2"></th>
                                                    <th className="p-2"></th>
                                                    <th className="p-2 font-medium text-right border-l">QoH</th>
                                                    <th className="p-2 font-medium text-right">Avail</th>
                                                    <th className="p-2 font-medium text-right">Order</th>
                                                    <th className="p-2 font-medium text-right">Shpmnt</th>
                                                    <th className="p-2 font-medium text-right border-l">QoH</th>
                                                    <th className="p-2 font-medium text-right">Avail</th>
                                                    <th className="p-2 font-medium text-right">Order</th>
                                                    <th className="p-2 font-medium text-right">Shpmnt</th>
                                                    <th className="p-2 border-l"></th>
                                                    <th className="p-2 border-l"></th>
                                                    <th className="p-2 border-l"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                 <tr>
                                                    <td colSpan={13} className="p-8 text-center text-muted-foreground">No items to display.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                     </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
                <AddCustomerDialog
                    isOpen={isAddCustomerOpen}
                    setIsOpen={setIsAddCustomerOpen}
                    onCustomerAdded={() => { /* Real-time listener handles updates */ }}
                />
                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                 </div>
            </div>
        </AuthGuard>
    );
}

const LabelWithTooltip = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center gap-1">
        <label className="text-sm font-medium">{label}</label>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
);

    