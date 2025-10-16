
'use client';

import { useState } from 'react';
import { 
    ShoppingCart, 
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
} from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PurchaseOrderPageContentProps {
    orderId: string;
}

const mockProductsData = [
    { id: '100000-1', description: 'Voopoo Argus P2 Kit-Crystal Pink', packing: '50/1', openStock: { qoh: 12, avail: 12, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: 'D1-03-C' },
    { id: '100000-2', description: 'Voopoo Argus P2 Kit-Emerald Green', packing: '50/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100000-3', description: 'Voopoo Argus P2 Kit-Matte Black', packing: '50/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100000-4', description: 'Voopoo Argus P2 Kit-Neon Blue', packing: '50/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100000-5', description: 'Voopoo Argus P2 Kit-Pearl White', packing: '50/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100000-6', description: 'Voopoo Argus P2 Kit-Ruby Red', packing: '50/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100000-7', description: 'Voopoo Argus P2 Kit-Titanium Gray', packing: '50/1', openStock: { qoh: 10, avail: 10, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: 'D1-03-C' },
    { id: '100000-8', description: 'Voopoo Argus P2 Kit-Voilet Purple', packing: '30/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100001-1', description: 'Yocan Ziva Pro Battery-Display of 10-Black', packing: '34/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '100001-2', description: 'Yocan Ziva Pro Battery-Display of 10-Cyan Blue Gradient', packing: '34/1', openStock: { qoh: 0, avail: 0, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: '' },
    { id: '003924243-1', description: 'SMOK Mag Solo Starter Kit (Single Unit) Color=Matte white', packing: '30/1', openStock: { qoh: 30, avail: 30, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: 'C7-02-C' },
    { id: '003924243-2', description: 'SMOK Mag Solo Starter Kit (Single Unit) Color=Matte black', packing: '30/1', openStock: { qoh: 30, avail: 30, order: 0 }, caseStock: { qoh: 0, avail: 0, order: 0 }, sublocations: 'C5-02-C' },
];

const mockBillItems = [
    { product: '150587110-1: Yocan Black Celestial E-Rig Vaporizer (Single Unit) Color=Black', quantity: 39, unitPrice: 60.50, subtotal: 2359.50 },
    { product: '150587110-2: Yocan Black Celestial E-Rig Vaporizer (Single Unit) Color=Blue', quantity: 57, unitPrice: 60.50, subtotal: 3448.50 },
    { product: '150587110-3: Yocan Black Celestial E-Rig Vaporizer (Single Unit) Color=Red', quantity: 63, unitPrice: 60.50, subtotal: 3811.50 },
    { product: '150587110-4: Yocan Black Celestial E-Rig Vaporizer (Single Unit) Color=Silver', quantity: 80, unitPrice: 60.50, subtotal: 4840.00 },
    { product: '574039610-1: Yocan Black Phaser ACE ePen Vaporizer (Single Unit) Color=Black', quantity: 111, unitPrice: 25.00, subtotal: 2775.00 },
    { product: '768729300-1: Yocan Black Phaser ARC Nectar Collector (Single Unit) Color=Black', quantity: 92, unitPrice: 37.25, subtotal: 3427.00 },
    { product: '768729300-2: Yocan Black Phaser ARC Nectar Collector (Single Unit) Color=Blue', quantity: 90, unitPrice: 37.25, subtotal: 3352.50 },
    { product: '768729300-3: Yocan Black Phaser ARC Nectar Collector (Single Unit) Color=Red', quantity: 93, unitPrice: 37.25, subtotal: 3464.25 },
    { product: '768729300-4: Yocan Black Phaser ARC Nectar Collector (Single Unit) Color=Silver', quantity: 98, unitPrice: 37.25, subtotal: 3650.50 },
    { product: '923739971-1: Yocan Black SMART 350mAh Battery (Single Unit) Color=Black', quantity: 334, unitPrice: 11.00, subtotal: 3674.00 },
    { product: '923739971-2: Yocan Black SMART 350mAh Battery (Single Unit) Color=Blue', quantity: 204, unitPrice: 11.00, subtotal: 2244.00 },
    { product: '923739971-3: Yocan Black SMART 350mAh Battery (Single Unit) Color=Red', quantity: 203, unitPrice: 11.00, subtotal: 2233.00 },
    { product: '923739971-4: Yocan Black SMART 350mAh Battery (Single Unit) Color=Silver', quantity: 204, unitPrice: 11.00, subtotal: 2244.00 },
    { product: '574039610-3: Yocan Black Phaser ACE ePen Vaporizer (Single Unit) Color=Red', quantity: 65, unitPrice: 25.00, subtotal: 1625.00 },
]

export default function PurchaseOrderPageContent({ orderId }: PurchaseOrderPageContentProps) {

    return (
        <AuthGuard>
            <div className="flex flex-col bg-muted/40">
                <main className="flex-1 container mx-auto p-4 md:p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                             <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                                <ShoppingCart className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">{orderId}</span>
                                    <span className="text-muted-foreground">&bull;</span>
                                    <span className="text-muted-foreground">10/16/2025</span>
                                    <span className="text-muted-foreground">|</span>
                                    <Badge variant="secondary">Draft</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Print bill
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Print</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Action 1</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button><Check className="mr-2" /> Save changes</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="purchase" className="w-full">
                        <TabsList>
                            <TabsTrigger value="purchase">Purchase</TabsTrigger>
                            <TabsTrigger value="products">Products view</TabsTrigger>
                            <TabsTrigger value="shipments">Shipments</TabsTrigger>
                            <TabsTrigger value="bill">Bill</TabsTrigger>
                        </TabsList>
                        <TabsContent value="purchase" className="mt-4">
                            <div className="grid lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Information</CardTitle></CardHeader>
                                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <LabelWithTooltip label="Supplier" tooltip="The supplier for this purchase." />
                                                <div className="relative">
                                                     <Input placeholder="- Unspecified -" />
                                                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Order date</label>
                                                <Input type="date" defaultValue="2025-10-16" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Estimated receive date</label>
                                                <Input type="date" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Purchase destination</label>
                                                <Input defaultValue="Tawakkal Warehouse" />
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Terms</label>
                                                <Input />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Fulfillment</label>
                                                 <div className="relative">
                                                     <Input />
                                                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Requested shipping</label>
                                                 <div className="relative">
                                                     <Input />
                                                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Address Information</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div><p className="text-sm font-semibold">Bill to</p><p>Heartland</p></div>
                                                <div><p className="text-sm font-semibold">Ship to</p><p>Heartland</p></div>
                                                <div><p className="text-sm font-semibold">Ship from</p><p>--</p></div>
                                            </div>
                                            <Button variant="link" className="p-0 h-auto mt-2">Edit bill to, ship to, or ship from address</Button>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                                            <Button variant="outline" size="sm" disabled><Trash2 className="mr-2"/> Delete items</Button>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">Summary: TOTAL 0 units</p>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="p-2 w-10"><Checkbox disabled/></th>
                                                        <th className="p-2 text-left">Product</th>
                                                        <th className="p-2 text-right">Quantity</th>
                                                        <th className="p-2 text-right">Received units</th>
                                                        <th className="p-2 text-right">Price</th>
                                                        <th className="p-2 text-right">Subtotal</th>
                                                        <th className="p-2 text-right">Landed cost</th>
                                                        <th className="p-2 text-right">Landed cost per unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">Type on last line to add an item. Additional lines are automatically added.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div className="flex justify-between items-center mt-4">
                                                <Button variant="link" className="p-0 h-auto">Show landed costs details</Button>
                                                <div className="text-right">
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
                                            <ShoppingCart className="w-5 h-5 text-muted-foreground"/>
                                            <CardTitle>Purchase</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <p><span className="font-semibold">Status:</span> Draft</p>
                                            <p><span className="font-semibold">Shipment status:</span> Not received</p>
                                            <p><span className="font-semibold">Bill status:</span> No bill posted</p>
                                            <p><span className="font-semibold">Synced to:</span> --</p>
                                        </CardContent>
                                     </Card>
                                     <div className="p-4 bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-orange-800 dark:text-orange-200">
                                        <p className="font-bold mb-1">No items or adjustments in purchase</p>
                                        <p>Please add items or adjustments to the purchase in order to enable actions.</p>
                                     </div>
                                     <div className="space-y-2">
                                        <Button variant="outline" className="w-full" disabled>Change status to committed</Button>
                                        <Button variant="outline" className="w-full" disabled>Change status to completed</Button>
                                        <Button variant="link" className="w-full text-destructive" disabled>Cancel purchase</Button>
                                     </div>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <ShoppingCart className="w-5 h-5 text-muted-foreground"/>
                                            <CardTitle>Shipments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link href="#" className="text-primary hover:underline">Purchase shipment {orderId}-1</Link>
                                            <p className="text-sm text-muted-foreground">Editable</p>
                                        </CardContent>
                                     </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <Receipt className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>Bills</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-2">No bills</p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between" disabled>Bill purchase order <ChevronDown /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {/* Items would go here */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <Users className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>Supplier credits</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-2">No supplier credits</p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between" disabled>Add new supplier credit <ChevronDown /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {/* Items would go here */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <History className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-100 rounded-full"><Info className="w-3 h-3 text-blue-600"/></div>
                                                    <span>Created</span>
                                                </div>
                                                <span className="text-muted-foreground">seconds ago</span>
                                            </div>
                                            <Button variant="outline" className="w-full mt-4" disabled>View detailed order history</Button>
                                        </CardContent>
                                    </Card>
                                     <div className="fixed bottom-8 right-8">
                                        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                                            <MessageCircle className="w-8 h-8" />
                                        </Button>
                                     </div>
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
                                                <SelectValue placeholder="All quantities" />
                                            </SelectTrigger>
                                        </Select>
                                     </div>
                                    <div className="border rounded-md overflow-x-auto">
                                        <table className="w-full text-sm whitespace-nowrap">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b">
                                                    <th className="p-2 font-medium text-left flex items-center gap-1"><ArrowDown className="w-4 h-4"/> Product ID</th>
                                                    <th className="p-2 font-medium text-left">Description</th>
                                                    <th className="p-2 font-medium text-left">Std packing</th>
                                                    <th colSpan={3} className="p-2 font-medium text-center border-l">Open Stock</th>
                                                    <th colSpan={3} className="p-2 font-medium text-center border-l">Case Stock</th>
                                                    <th className="p-2 font-medium text-left border-l">Sublocation(s)</th>
                                                </tr>
                                                <tr className="border-b">
                                                    <th className="p-2"></th>
                                                    <th className="p-2"></th>
                                                    <th className="p-2"></th>
                                                    <th className="p-2 font-medium text-right border-l">QoH</th>
                                                    <th className="p-2 font-medium text-right">Avail</th>
                                                    <th className="p-2 font-medium text-right">Order</th>
                                                    <th className="p-2 font-medium text-right border-l">QoH</th>
                                                    <th className="p-2 font-medium text-right">Avail</th>
                                                    <th className="p-2 font-medium text-right">Order</th>
                                                    <th className="p-2 border-l"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockProductsData.map((product) => (
                                                    <tr key={product.id} className="border-b last:border-0">
                                                        <td className="p-2">{product.id}</td>
                                                        <td className="p-2">{product.description}</td>
                                                        <td className="p-2">{product.packing}</td>
                                                        <td className="p-2 text-right border-l">{product.openStock.qoh}</td>
                                                        <td className="p-2 text-right">{product.openStock.avail}</td>
                                                        <td className="p-2 text-right">{product.openStock.order}</td>
                                                        <td className="p-2 text-right border-l">{product.caseStock.qoh}</td>
                                                        <td className="p-2 text-right">{product.caseStock.avail}</td>
                                                        <td className="p-2 text-right">{product.caseStock.order}</td>
                                                        <td className="p-2 border-l">{product.sublocations}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                     </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="shipments" className="mt-4">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-semibold text-lg">Shipment #</h3>
                                        <p className="text-sm text-muted-foreground">Status: Canceled</p>
                                        <p className="text-sm text-muted-foreground">Actual receive date: Unspecified</p>
                                    </div>
                                     <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="shipment-search" className="text-sm font-semibold">Search:</label>
                                            <Input id="shipment-search" placeholder="" className="w-40" />
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
                                                    <th className="p-2 font-medium text-left">Std packing</th>
                                                    <th colSpan={4} className="p-2 font-medium text-center border-l">Open Stock</th>
                                                    <th colSpan={4} className="p-2 font-medium text-center border-l">Case Stock</th>
                                                    <th className="p-2 font-medium text-left border-l">Packing</th>
                                                    <th className="p-2 font-medium text-left border-l">Sublocation</th>
                                                    <th className="p-2 font-medium text-left border-l">Lot ID</th>
                                                </tr>
                                                <tr className="border-b">
                                                    <th className="p-2"></th>
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
                                                    <td colSpan={14} className="p-8 text-center text-muted-foreground">No items to display.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                     </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="bill" className="mt-4">
                             <div className="grid lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardContent className="p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Bill date</label>
                                                <Input type="date" defaultValue="2025-10-16" />
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Reference number</label>
                                                <Input/>
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Supplier</label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Default from order (Payless Distributors)" />
                                                    </SelectTrigger>
                                                </Select>
                                            </div>
                                              <div className="space-y-1">
                                                <label className="text-sm font-medium">Pay to address</label>
                                                <p className="text-sm text-muted-foreground pt-2">--</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                         <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Purchase Information</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-4 gap-4 text-sm">
                                            <div><p className="font-semibold">Supplier</p><p className="text-primary mt-1">Payless Distributors</p></div>
                                            <div><p className="font-semibold">Terms</p><p className="text-muted-foreground mt-1">--</p></div>
                                            <div><p className="font-semibold">Requested shipping</p><p className="text-muted-foreground mt-1">--</p></div>
                                            <div><p className="font-semibold">Fulfillment</p><p className="text-muted-foreground mt-1">--</p></div>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">Update items from order</Button>
                                                <Button variant="outline" size="sm" disabled><Trash2 className="mr-2"/> Delete items</Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr className="border-b">
                                                        <th className="p-2 w-10"><Checkbox/></th>
                                                        <th className="p-2 text-left">Product</th>
                                                        <th className="p-2 text-left">Item note</th>
                                                        <th className="p-2 text-left">Packing</th>
                                                        <th className="p-2 text-right">Quantity</th>
                                                        <th className="p-2 text-right">List price</th>
                                                        <th className="p-2 text-right">Unit price</th>
                                                        <th className="p-2 text-right">Subtotal</th>
                                                        <th className="p-2 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mockBillItems.map((item, index) => (
                                                        <tr key={index} className="border-b last:border-b-0">
                                                            <td className="p-2"><Checkbox/></td>
                                                            <td className="p-2">{item.product}</td>
                                                            <td className="p-2"></td>
                                                            <td className="p-2"></td>
                                                            <td className="p-2 text-right">{item.quantity}</td>
                                                            <td className="p-2 text-right"></td>
                                                            <td className="p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                                                            <td className="p-2 text-right">{item.subtotal.toFixed(2)}</td>
                                                            <td className="p-2"><Button variant="ghost" size="icon" className="w-6 h-6"><X className="w-4 h-4"/></Button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan={9} className="p-2 text-left text-muted-foreground">Type on last line to add an item. Additional lines are automatically added.</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                            <div className="flex justify-end mt-4">
                                                <div className="w-full max-w-xs space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Total:</span>
                                                        <span>43,148.75</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Total paid:</span>
                                                        <span>0.00</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                    <Card>
                                        <CardContent className="p-4 space-y-2 text-sm">
                                            <p><span className="font-semibold">Status:</span> Draft</p>
                                            <p><span className="font-semibold">Due date:</span> 10/16/2025</p>
                                            <p><span className="font-semibold">Payments status:</span> N/A</p>
                                            <p><span className="font-semibold">Synced from:</span> --</p>
                                            <p><span className="font-semibold">Synced to:</span> --</p>
                                        </CardContent>
                                        <CardContent className="p-4 border-t">
                                            <Button className="w-full">Change status to posted</Button>
                                            <Button variant="link" className="w-full text-destructive mt-2">Void bill</Button>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <ShoppingCart className="w-5 h-5 text-muted-foreground"/>
                                            <CardTitle>Purchase for bill</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-1">
                                            <p><span className="font-semibold">Order ID:</span> <Link href="#" className="text-primary hover:underline">100171</Link></p>
                                            <p><span className="font-semibold">Order date:</span> 1/29/2025</p>
                                            <p><span className="font-semibold">Supplier:</span> <Link href="#" className="text-primary hover:underline">Payless Distributors</Link></p>
                                        </CardContent>
                                     </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <Receipt className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>Bill payments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-2">No payments</p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between">Post payment <ChevronDown /></Button>
                                                </DropdownMenuTrigger>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <History className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>History</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <div className="flex items-start gap-2">
                                                <div className="p-1.5 bg-blue-100 rounded-full mt-1"><Info className="w-3 h-3 text-blue-600"/></div>
                                                <div>
                                                    <p>Created</p>
                                                    <p className="text-muted-foreground">by You</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                             </div>
                        </TabsContent>
                    </Tabs>
                </main>
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
