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
    History
} from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PurchaseOrderPageContentProps {
    orderId: string;
}

export default function PurchaseOrderPageContent({ orderId }: PurchaseOrderPageContentProps) {

    return (
        <AuthGuard>
            <div className="flex flex-col min-h-screen bg-muted/40">
                <Header />
                <div className="flex-1 container mx-auto p-4 md:p-8">
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
                                        <Printer className="mr-2" />
                                        Print purchase order
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Default</DropdownMenuItem>
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
                        </TabsList>
                        <TabsContent value="purchase">
                            <div className="grid lg:grid-cols-3 gap-8 items-start mt-4">
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
                    </Tabs>
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
