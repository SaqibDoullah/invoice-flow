
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, onSnapshot, doc, getDoc, runTransaction, Timestamp, where, getDocs, limit } from 'firebase/firestore';
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
    MessageSquareQuote,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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
import { type Customer, type InventoryItem, type LineItem, type SalesOrder, type Supplier } from '@/types';
import AddCustomerDialog from '@/components/customers/add-customer-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

interface SalesOrderPageContentProps {
    orderId: string;
}

const toDate = (v: any): Date => {
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate();
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export default function SalesOrderPageContent({ orderId }: SalesOrderPageContentProps) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    
    // State for Products View filters
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [manufacturerFilter, setManufacturerFilter] = useState('all');
    const [quantityFilter, setQuantityFilter] = useState('all');
    const [actionsDisabled, setActionsDisabled] = useState(true);

    const [salesOrder, setSalesOrder] = useState<SalesOrder>({
        id: orderId,
        orderId: orderId,
        orderDate: new Date(),
        customerId: null,
        customer: null,
        source: '',
        origin: 'Tawakkal Warehouse',
        estimatedShipDate: null,
        customerPO: '',
        fulfillment: '',
        terms: '',
        requestedShipping: '',
        priceLevel: 'Item/case price',
        batchId: '',
        billToAddress: '--',
        shipToAddress: '--',
        shipToName: '',
        employeeName: '',
        productType: '',
        salesPerson: '',
        businessType: '',
        items: [],
        subtotal: 0,
        discount: 0,
        discountType: 'percentage',
        total: 0,
        status: 'Draft',
        fulfillmentStatus: 'Not packed or shipped',
        shipments: '',
        shipmentsStatusSummary: '',
        invoicesStatusSummary: '',
        carrier: '',
        trackingNumber: '',
        shipmentDate: null,
        deliveryDate: null,
        publicNotes: '',
        internalNotes: '',
    });
    
    useEffect(() => {
        setActionsDisabled(salesOrder.items.length === 0);
    }, [salesOrder.items]);

    // Fetch dependent data (customers, inventory)
    useEffect(() => {
        const db = getFirestoreDb();
        if (authLoading || !user || !db) return;

        const unsubCustomers = onSnapshot(query(collection(db, 'users', user.uid, 'customers')), (snapshot) => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
        }, (error) => console.error("Error fetching customers:", error));

        const unsubInventory = onSnapshot(query(collection(db, 'users', user.uid, 'inventory')), (snapshot) => {
            setInventoryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
        }, (error) => console.error("Error fetching inventory:", error));
        
        const unsubSuppliers = onSnapshot(query(collection(db, 'users', user.uid, 'suppliers')), (snapshot) => {
            setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
        }, (error) => console.error("Error fetching suppliers:", error));

        return () => {
            unsubCustomers();
            unsubInventory();
            unsubSuppliers();
        };
    }, [user, authLoading]);

    // Fetch existing sales order or set up a new one
    useEffect(() => {
        const db = getFirestoreDb();
        if (authLoading || !user || !db) return;

        setPageLoading(true);
        const docRef = doc(db, 'users', user.uid, 'sales', orderId);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Omit<SalesOrder, 'id'>;
                setSalesOrder(prev => ({
                    ...prev,
                    ...data,
                    id: docSnap.id,
                    orderDate: toDate(data.orderDate),
                    estimatedShipDate: data.estimatedShipDate ? toDate(data.estimatedShipDate) : null,
                    shipmentDate: data.shipmentDate ? toDate(data.shipmentDate) : null,
                    deliveryDate: data.deliveryDate ? toDate(data.deliveryDate) : null,
                }));
            }
            setPageLoading(false);
        }, (error) => {
            console.error("Error fetching sales order:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load sales order data.' });
            setPageLoading(false);
        });
        
        return () => unsubscribe();
    }, [orderId, user, authLoading, toast]);
    
    const filteredInventoryItems = useMemo(() => {
        return inventoryItems.filter(item => {
            const searchTermLower = productSearchTerm.toLowerCase();
            const matchesSearch = productSearchTerm ? 
                (item.sku?.toLowerCase().includes(searchTermLower) || item.name.toLowerCase().includes(searchTermLower))
                : true;
            
            const matchesSupplier = supplierFilter !== 'all' ? item.supplierId === supplierFilter : true;
            const matchesCategory = categoryFilter !== 'all' ? item.category === categoryFilter : true;
            const matchesManufacturer = manufacturerFilter !== 'all' ? item.manufacturer === manufacturerFilter : true;
            
            const matchesQuantity = quantityFilter === 'gt_zero' ? (item.quantityAvailable || 0) > 0 : true;

            const matchesLocation = locationFilter !== 'all' ? true : true; // Placeholder

            return matchesSearch && matchesSupplier && matchesCategory && matchesManufacturer && matchesQuantity && matchesLocation;
        });
    }, [inventoryItems, productSearchTerm, supplierFilter, locationFilter, categoryFilter, manufacturerFilter, quantityFilter]);


    // Recalculate totals whenever items or discount change
    useEffect(() => {
        const subtotal = salesOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const discountAmount = salesOrder.discountType === 'percentage'
            ? subtotal * (salesOrder.discount / 100)
            : salesOrder.discount;
        const total = subtotal - discountAmount;
        
        setSalesOrder(prev => ({ ...prev, subtotal, total }));
    }, [salesOrder.items, salesOrder.discount, salesOrder.discountType]);

    const handleInputChange = (field: keyof SalesOrder, value: any) => {
        setSalesOrder(prev => ({ ...prev, [field]: value }));
    };
    
    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setSalesOrder(prev => ({
                ...prev,
                customerId: customerId,
                customer: customer,
                shipToName: customer.name,
                billToAddress: customer.address || '--',
                shipToAddress: customer.address || '--',
            }));
        }
    };
    
    const handleAddItem = () => {
        const newItem: LineItem = { name: '', specification: '', price: 0, quantity: 1, lineTotal: 0, shippedQuantity: 0 };
        setSalesOrder(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...salesOrder.items];
        const itemToUpdate = { ...newItems[index] };
        
        if (field === 'price' || field === 'quantity' || field === 'shippedQuantity') {
            (itemToUpdate as any)[field] = parseFloat(value) || 0;
        } else {
            (itemToUpdate as any)[field] = value;
        }
        
        itemToUpdate.lineTotal = itemToUpdate.price * itemToUpdate.quantity;
        newItems[index] = itemToUpdate;
        setSalesOrder(prev => ({ ...prev, items: newItems }));
    };
    
    const handleAddProductFromInventory = (product: InventoryItem, quantity: number) => {
        if (quantity <= 0) return;

        const newItem: LineItem = {
            name: product.name,
            specification: product.sku || product.id,
            price: product.price || 0,
            quantity: quantity,
            lineTotal: (product.price || 0) * quantity,
            shippedQuantity: 0,
        };
        
        const existingItemIndex = salesOrder.items.findIndex(item => item.specification === newItem.specification);

        if (existingItemIndex > -1) {
             const newItems = [...salesOrder.items];
             newItems[existingItemIndex].quantity += quantity;
             newItems[existingItemIndex].lineTotal = newItems[existingItemIndex].price * newItems[existingItemIndex].quantity;
             setSalesOrder(prev => ({ ...prev, items: newItems }));
        } else {
            setSalesOrder(prev => ({ ...prev, items: [...prev.items, newItem] }));
        }
    };

    const handleRemoveItem = (index: number) => {
        setSalesOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSaveAddress = () => setIsEditingAddress(false);

    const handleStatusChange = (newStatus: SalesOrder['status']) => {
        setSalesOrder(prev => ({ ...prev, status: newStatus }));
    };

    const handleSaveChanges = async () => {
        const db = getFirestoreDb();
        if (!user || !db) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        setIsSaving(true);
        
        const salesOrderRef = doc(db, 'users', user.uid, 'sales', orderId);

        try {
            await runTransaction(db, async (transaction) => {
                const salesOrderSnap = await transaction.get(salesOrderRef);
                const previousItems: LineItem[] = salesOrderSnap.exists() ? salesOrderSnap.data().items : [];

                // Update inventory based on newly shipped items
                for (const currentItem of salesOrder.items) {
                    if (!currentItem.specification) continue;

                    const prevItem = previousItems.find(pi => pi.specification === currentItem.specification);
                    const previouslyShipped = prevItem?.shippedQuantity || 0;
                    const newlyShipped = (currentItem.shippedQuantity || 0) - previouslyShipped;

                    if (newlyShipped > 0) {
                        const inventoryCollectionRef = collection(db, 'users', user.uid, 'inventory');
                        const q = query(inventoryCollectionRef, where('sku', '==', currentItem.specification), limit(1));
                        const inventorySnaps = await getDocs(q);
                        
                        if (!inventorySnaps.empty) {
                            const inventoryDoc = inventorySnaps.docs[0];
                            const inventoryItemRef = inventoryDoc.ref;
                            const currentInventoryData = inventoryDoc.data() as InventoryItem;

                            const newQuantity = (currentInventoryData.quantity || 0) - newlyShipped;
                            const newQuantityAvailable = (currentInventoryData.quantityAvailable || 0) - newlyShipped;

                            transaction.update(inventoryItemRef, { 
                                quantity: newQuantity,
                                quantityAvailable: newQuantityAvailable
                            });
                        }
                    }
                }
                
                // Save the sales order itself
                const dataToSave = {
                    ...salesOrder,
                    orderDate: Timestamp.fromDate(toDate(salesOrder.orderDate)),
                    estimatedShipDate: salesOrder.estimatedShipDate ? Timestamp.fromDate(toDate(salesOrder.estimatedShipDate)) : null,
                    shipmentDate: salesOrder.shipmentDate ? Timestamp.fromDate(toDate(salesOrder.shipmentDate)) : null,
                    deliveryDate: salesOrder.deliveryDate ? Timestamp.fromDate(toDate(salesOrder.deliveryDate)) : null,
                };
                delete (dataToSave as any).id;
                delete (dataToSave as any).customer;

                transaction.set(salesOrderRef, dataToSave, { merge: true });
            });

            toast({ title: 'Success', description: 'Sales order and inventory updated successfully.' });
        } catch (serverError: any) {
            console.error("Transaction failed: ", serverError);
            const permissionError = new FirestorePermissionError({
                path: salesOrderRef.path,
                operation: 'write',
                requestResourceData: salesOrder,
            });
            errorEmitter.emit('permission-error', permissionError);

            if (serverError?.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: `Failed to save sales order. ${serverError.message}` });
            }
        } finally {
            setIsSaving(false);
        }
    };


    const handleDuplicate = () => {
        const orderData = JSON.stringify({ ...salesOrder, orderId: '', status: 'Draft' });
        localStorage.setItem('duplicateOrderData', orderData);
        router.push('/sales/new');
    };

    const showComingSoon = () => {
        toast({
            title: 'Coming Soon',
            description: 'This feature is not yet implemented.',
        });
    };

    const selectedCustomerName = salesOrder.customer?.name || customers.find(c => c.id === salesOrder.customerId)?.name || 'Unspecified';
    const uniqueCategories = useMemo(() => {
      return Array.from(
        new Set(
          inventoryItems
            .map((item) => item.category)
            .filter((c): c is string => typeof c === 'string' && c.length > 0)
        )
      );
    }, [inventoryItems]);
    const uniqueManufacturers = useMemo(() => {
        return Array.from(
          new Set(
            inventoryItems
              .map((item) => item.manufacturer)
              .filter((m): m is string => typeof m === 'string' && m.length > 0)
          )
        );
    }, [inventoryItems]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    if (pageLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
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
                                    <span className="text-muted-foreground">{format(toDate(salesOrder.orderDate), 'MM/dd/yyyy')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save changes
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={showComingSoon}>Import sales order items</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={handleDuplicate}>Duplicate order</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon} disabled>Duplicate order with selection</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon} disabled>Create purchase order for drop ship</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon} disabled>Create purchase order for drop ship with selection</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={showComingSoon} disabled>Customize this screen</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span className="text-sm text-muted-foreground">All changes saved</span>
                        </div>
                    </div>

                    <Tabs defaultValue="sale" className="w-full">
                        <TabsList>
                            <TabsTrigger value="quote" asChild>
                                <Link href="/quotes" >Quote</Link>
                            </TabsTrigger>
                            <TabsTrigger value="sale">Sale</TabsTrigger>
                            <TabsTrigger value="products">Products view</TabsTrigger>
                            <TabsTrigger value="shipments">Shipments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="sale" className="mt-4">
                                <div className="grid lg:grid-cols-3 gap-8 items-start">
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Information</CardTitle></CardHeader>
                                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <LabelWithTooltip label="Customer" tooltip="The customer for this sale." />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
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
                                                                                onSelect={() => handleCustomerSelect(customer.id)}
                                                                            >
                                                                                <Check
                                                                                    className={cn("mr-2 h-4 w-4", salesOrder.customerId === customer.id ? "opacity-100" : "opacity-0")}
                                                                                />
                                                                                {customer.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                                <div className="p-1 border-t">
                                                                    <CommandItem onSelect={() => setIsAddCustomerOpen(true)}>
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Create new customer
                                                                    </CommandItem>
                                                                </div>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Source</label><Input value={salesOrder.source} onChange={(e) => handleInputChange('source', e.target.value)} /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Order date</label><Input type="date" value={format(toDate(salesOrder.orderDate), 'yyyy-MM-dd')} onChange={(e) => handleInputChange('orderDate', new Date(e.target.value))} /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Origin</label><Input value={salesOrder.origin} onChange={(e) => handleInputChange('origin', e.target.value)} /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Estimated ship date</label><Input type="date" value={salesOrder.estimatedShipDate ? format(toDate(salesOrder.estimatedShipDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleInputChange('estimatedShipDate', new Date(e.target.value))} /></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Customer PO</label><Input value={salesOrder.customerPO} onChange={(e) => handleInputChange('customerPO', e.target.value)} /></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Fulfillment</label><Input value={salesOrder.fulfillment} onChange={(e) => handleInputChange('fulfillment', e.target.value)} /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Terms</label><Input value={salesOrder.terms} onChange={(e) => handleInputChange('terms', e.target.value)} /></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Requested shipping</label><Input value={salesOrder.requestedShipping} onChange={(e) => handleInputChange('requestedShipping', e.target.value)} /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1 relative"><label className="text-sm font-medium">Price level</label><Input value={salesOrder.priceLevel} onChange={(e) => handleInputChange('priceLevel', e.target.value)} /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label className="text-sm font-medium">Batch ID</label><Input value={salesOrder.batchId} onChange={(e) => handleInputChange('batchId', e.target.value)} /></div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Address Information</CardTitle></CardHeader>
                                            <CardContent>
                                                {isEditingAddress ? (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div><label className="text-sm font-semibold">Bill to</label><Input value={salesOrder.billToAddress} onChange={(e) => handleInputChange('billToAddress', e.target.value)} /></div>
                                                        <div><label className="text-sm font-semibold">Ship to</label><Input value={salesOrder.shipToAddress} onChange={(e) => handleInputChange('shipToAddress', e.target.value)} /></div>
                                                        <div><p className="text-sm font-semibold">Ship from</p><p>Heartland</p></div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div><p className="font-semibold">Bill to</p><p>{salesOrder.billToAddress}</p></div>
                                                        <div><p className="font-semibold">Ship to</p><p>{salesOrder.shipToAddress}</p></div>
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
                                                <div className="space-y-1"><label>Employee Name</label><Input value={salesOrder.employeeName} onChange={(e) => handleInputChange('employeeName', e.target.value)} /></div>
                                                <div className="space-y-1"><label>Product Type</label><Input value={salesOrder.productType} onChange={(e) => handleInputChange('productType', e.target.value)} /></div>
                                                <div className="space-y-1 relative"><label>Sales Person</label><Input value={salesOrder.salesPerson} onChange={(e) => handleInputChange('salesPerson', e.target.value)} /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/></div>
                                                <div className="space-y-1"><label>Business Type</label><Input value={salesOrder.businessType} onChange={(e) => handleInputChange('businessType', e.target.value)} /></div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between mb-4">
                                                    <Button variant="outline" size="sm"><Trash2 className="mr-2"/> Delete items</Button>
                                                    <p className="text-sm text-muted-foreground">Summary: TOTAL {salesOrder.items.reduce((sum, item) => sum + item.quantity, 0)} units</p>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm whitespace-nowrap">
                                                        <thead>
                                                            <tr className="border-b text-muted-foreground">
                                                                <th className="p-2 font-normal text-left">Warning</th>
                                                                <th className="p-2 font-normal text-left">Item note</th>
                                                                <th className="p-2 font-normal text-left">Product</th>
                                                                <th className="p-2 font-normal text-right">Quantity</th>
                                                                <th className="p-2 font-normal text-right">Qty shipped</th>
                                                                <th className="p-2 font-normal text-right">Qty not shipped</th>
                                                                <th className="p-2 font-normal text-right">List Price</th>
                                                                <th className="p-2 font-normal text-right">Discount</th>
                                                                <th className="p-2 font-normal text-right">Last purchase price</th>
                                                                <th className="p-2 font-normal text-right">Price</th>
                                                                <th className="p-2 font-normal text-right">Subtotal</th>
                                                                <th className="p-2 font-normal text-right">Income after adjustments</th>
                                                                <th className="p-2 w-10"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {salesOrder.items.map((item, index) => (
                                                                <tr key={index} className="border-b">
                                                                    <td className="p-1"></td>
                                                                    <td className="p-1"><Input className="min-w-[100px]" /></td>
                                                                    <td className="p-1">
                                                                        <Select value={item.name} onValueChange={(value) => {
                                                                            const product = inventoryItems.find(p => p.name === value);
                                                                            if (product) {
                                                                                handleItemChange(index, 'name', product.name);
                                                                                handleItemChange(index, 'specification', product.sku || product.id);
                                                                                handleItemChange(index, 'price', product.price || 0);
                                                                            }
                                                                        }}>
                                                                            <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {inventoryItems.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </td>
                                                                    <td className="p-1"><Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="min-w-[70px] text-right" /></td>
                                                                    <td className="p-1 text-right">{item.shippedQuantity || 0}</td>
                                                                    <td className="p-1 text-right">{item.quantity - (item.shippedQuantity || 0)}</td>
                                                                    <td className="p-1 text-right">{formatCurrency(item.price)}</td>
                                                                    <td className="p-1"></td>
                                                                    <td className="p-1"></td>
                                                                    <td className="p-1"><Input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="min-w-[100px] text-right" /></td>
                                                                    <td className="p-1 text-right">{formatCurrency(item.lineTotal)}</td>
                                                                    <td className="p-1"></td>
                                                                    <td className="p-1">
                                                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                 <Button variant="link" className="p-0 h-auto text-primary mt-4" onClick={handleAddItem}><Plus className="mr-2"/>Add new item</Button>
                                                <div className="flex justify-between items-start mt-4">
                                                    <Button variant="link" className="p-0 h-auto text-primary">Show income after adjustments details</Button>
                                                    <div className="w-full max-w-xs space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Subtotal:</span>
                                                            <span>{formatCurrency(salesOrder.subtotal)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>Discount:</span>
                                                            <div className="flex w-32">
                                                                <Input type="number" value={salesOrder.discount} onChange={e => handleInputChange('discount', parseFloat(e.target.value) || 0)} className="h-8 text-right"/>
                                                                <Select value={salesOrder.discountType} onValueChange={(value: 'percentage' | 'fixed') => handleInputChange('discountType', value)}>
                                                                    <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="percentage">%</SelectItem>
                                                                        <SelectItem value="fixed">$</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                         <div className="flex justify-between font-bold">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(salesOrder.total)}</span>
                                                        </div>
                                                        <Button variant="link" className="p-0 h-auto text-primary float-right">Add new discount/fee/tax</Button>
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
                                                <p><span className="font-semibold">Status:</span> <Badge variant={salesOrder.status === 'Draft' ? 'secondary' : 'default'} className={salesOrder.status === 'Committed' ? 'bg-green-100 text-green-800' : ''}>{salesOrder.status}</Badge></p>
                                                <p><span className="font-semibold">Shipment status:</span> {salesOrder.fulfillmentStatus}</p>
                                                <p><span className="font-semibold">Invoice status:</span> {salesOrder.invoicesStatusSummary}</p>
                                                <p><span className="font-semibold">Due date:</span> {format(toDate(salesOrder.orderDate), 'MM/dd/yyyy')}</p>
                                                <p><span className="font-semibold">Synced from:</span> --</p>
                                                <p><span className="font-semibold">Last synced from:</span> --</p>
                                                <p><span className="font-semibold">Synced to:</span> --</p>
                                                <p><span className="font-semibold">Last synced to:</span> --</p>
                                            </CardContent>
                                             <CardContent className="p-4 border-t">
                                                {actionsDisabled && (
                                                    <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 p-3 rounded-md text-sm mb-4">
                                                        <p className="font-semibold">No items or adjustments in sale</p>
                                                        <p>Please add items or adjustments to the sale in order to enable actions.</p>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Button variant="outline" className="w-full" onClick={() => handleStatusChange('Committed')} disabled={actionsDisabled}>Change status to committed</Button>
                                                    <Button variant="outline" className="w-full" onClick={() => handleStatusChange('Completed')} disabled={actionsDisabled}>Change status to completed</Button>
                                                    <Button variant="link" className="w-full text-destructive" onClick={() => handleStatusChange('Canceled')}>Cancel sale</Button>
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
                                        <p className="text-sm text-muted-foreground font-semibold">Summary: TOTAL: {filteredInventoryItems.length} units</p>
                                     </div>
                                     <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative">
                                            <Input placeholder="Search..." className="pl-8" value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)}/>
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                        </div>
                                        <span className="text-sm font-semibold">Filters:</span>
                                        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                                            <SelectTrigger className="w-40"><SelectValue placeholder="All suppliers" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All suppliers</SelectItem>
                                                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                                            <SelectTrigger className="w-40"><SelectValue placeholder="All locations" /></SelectTrigger>
                                            <SelectContent><SelectItem value="all">All locations</SelectItem></SelectContent>
                                        </Select>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All categories" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All categories</SelectItem>
                                                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All manufacturers" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All manufacturers</SelectItem>
                                                 {uniqueManufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                         <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All quantities" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All quantities</SelectItem>
                                                <SelectItem value="gt_zero">QoH total &gt; 0</SelectItem>
                                            </SelectContent>
                                        </Select>
                                     </div>
                                    <div className="border rounded-md overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="p-2 font-medium text-left flex items-center gap-1"><ArrowDown className="w-4 h-4"/> Product ID</TableHead>
                                                    <TableHead className="p-2 font-medium text-left">Description</TableHead>
                                                    <TableHead className="p-2 font-medium text-left">Std packing</TableHead>
                                                    <TableHead colSpan={4} className="p-2 font-medium text-center border-l">Open Stock</TableHead>
                                                    <TableHead colSpan={3} className="p-2 font-medium text-center border-l">Case Stock</TableHead>
                                                    <TableHead className="p-2 font-medium text-left border-l">Sublocation(s)</TableHead>
                                                </TableRow>
                                                <TableRow className="border-b bg-muted/50">
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">On Order</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 border-l"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredInventoryItems.length > 0 ? (
                                                    filteredInventoryItems.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="p-2 text-primary">{product.sku || product.id}</TableCell>
                                                        <TableCell className="p-2">{product.name}</TableCell>
                                                        <TableCell className="p-2">{product.stdPacking || ''}</TableCell>
                                                        <TableCell className="p-2 text-right border-l">{product.quantity}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.quantityAvailable}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.quantityOnOrder}</TableCell>
                                                        <TableCell className="p-1 text-right w-24">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 text-right"
                                                                onBlur={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (val > 0) handleAddProductFromInventory(product, val);
                                                                    e.target.value = '';
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseInt(e.currentTarget.value);
                                                                        if (val > 0) handleAddProductFromInventory(product, val);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2 text-right border-l">{product.casesOnHand}</TableCell>
                                                        <TableCell className="p-2 text-right">{product.casesAvailable}</TableCell>
                                                        <TableCell className="p-1 text-right w-24"><Input type="number" className="h-8 text-right"/></TableCell>
                                                        <TableCell className="p-2 border-l">{product.sublocation}</TableCell>
                                                    </TableRow>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No items match your filters.</td></tr>
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
                                        {salesOrder.items.length === 0 && (
                                            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
                                                <p>Shipment can not be packed or shipped since it is empty.</p>
                                                <p>Manually enter quantities for the shipment in the table below.</p>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground">Created: {format(new Date(), 'PPp')} by {user?.displayName || 'You'}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4">
                                            <div className="space-y-1"><label className="text-xs">Carrier</label><Select value={salesOrder.carrier} onValueChange={(value) => handleInputChange('carrier', value)}><SelectTrigger><SelectValue placeholder="-- Unspecified --"/></SelectTrigger></Select></div>
                                            <div className="space-y-1"><label className="text-xs">Tracking number</label><Input value={salesOrder.trackingNumber} onChange={(e) => handleInputChange('trackingNumber', e.target.value)}/></div>
                                            <div className="space-y-1"><label className="text-xs">Estimated ship date</label><Input type="date" value={salesOrder.shipmentDate ? format(toDate(salesOrder.shipmentDate), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('shipmentDate', new Date(e.target.value))} /></div>
                                            <div className="space-y-1"><label className="text-xs">Estimated delivery date</label><Input type="date" value={salesOrder.deliveryDate ? format(toDate(salesOrder.deliveryDate), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('deliveryDate', new Date(e.target.value))} /></div>
                                            <div className="space-y-1"><label className="text-xs">Shipment origin</label><Select><SelectTrigger><SelectValue placeholder="Default to order origin (Tawakkal Wa..."/></SelectTrigger></Select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1"><label className="text-xs">Public notes</label><Textarea value={salesOrder.publicNotes} onChange={e => handleInputChange('publicNotes', e.target.value)} /></div>
                                            <div className="space-y-1"><label className="text-xs">Internal notes</label><Textarea value={salesOrder.internalNotes} onChange={e => handleInputChange('internalNotes', e.target.value)} /></div>
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
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="p-2 font-medium text-left flex items-center gap-1"><Checkbox className="mr-2" /> <ArrowDown className="w-4 h-4"/> Product ID</TableHead>
                                                    <TableHead className="p-2 font-medium text-left">Description</TableHead>
                                                    <TableHead colSpan={4} className="p-2 font-medium text-center border-l">Open Stock</TableHead>
                                                    <TableHead colSpan={4} className="p-2 font-medium text-center border-l">Case Stock</TableHead>
                                                    <TableHead className="p-2 font-medium text-left border-l">Packing</TableHead>
                                                    <TableHead className="p-2 font-medium text-left border-l">Sublocation</TableHead>
                                                    <TableHead className="p-2 font-medium text-left border-l">Lot ID</TableHead>
                                                </TableRow>
                                                <TableRow className="border-b bg-muted/50">
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2"></TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Shpmnt</TableHead>
                                                    <TableHead className="p-2 font-medium text-right border-l">QoH</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Avail</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Order</TableHead>
                                                    <TableHead className="p-2 font-medium text-right">Shpmnt</TableHead>
                                                    <TableHead className="p-2 border-l"></TableHead>
                                                    <TableHead className="p-2 border-l"></TableHead>
                                                    <TableHead className="p-2 border-l"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                 {salesOrder.items.length > 0 ? (
                                                     salesOrder.items.map((item, index) => {
                                                         const inventoryItem = inventoryItems.find(p => p.sku === item.specification || p.id === item.specification);
                                                         return (
                                                            <TableRow key={index}>
                                                                <TableCell className="p-2 text-primary font-medium flex items-center gap-1"><Checkbox/> {item.specification}</TableCell>
                                                                <TableCell className="p-2">{item.name}</TableCell>
                                                                <TableCell className="p-2 text-right border-l">{inventoryItem?.quantity || 0}</TableCell>
                                                                <TableCell className="p-2 text-right">{inventoryItem?.quantityAvailable || 0}</TableCell>
                                                                <TableCell className="p-2 text-right">{item.quantity}</TableCell>
                                                                <TableCell className="p-1 w-24">
                                                                    <Input 
                                                                        type="number" 
                                                                        value={item.shippedQuantity || ''}
                                                                        onChange={(e) => handleItemChange(index, 'shippedQuantity', e.target.value)}
                                                                        className="h-8 text-right"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="p-2 text-right border-l">{inventoryItem?.casesOnHand || 0}</TableCell>
                                                                <TableCell className="p-2 text-right">{inventoryItem?.casesAvailable || 0}</TableCell>
                                                                <TableCell className="p-2 text-right">_</TableCell>
                                                                <TableCell className="p-1 w-24"><Input type="number" className="h-8 text-right"/></TableCell>
                                                                <TableCell className="p-2 border-l"></TableCell>
                                                                <TableCell className="p-2 border-l">{inventoryItem?.sublocation || ''}</TableCell>
                                                                <TableCell className="p-2 border-l"></TableCell>
                                                            </TableRow>
                                                         )
                                                     })
                                                 ) : (
                                                    <tr>
                                                        <td colSpan={13} className="p-8 text-center text-muted-foreground">No items in this order to ship.</td>
                                                    </tr>
                                                 )}
                                            </TableBody>
                                        </Table>
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
