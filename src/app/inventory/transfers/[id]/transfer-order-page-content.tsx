
'use client';

import { useState } from 'react';
import { 
    RefreshCw,
    Home, 
    ChevronRight, 
    Printer, 
    ChevronDown, 
    Check, 
    Info,
    Search,
    Trash2,
    MessageCircle,
    History,
    File,
    Triangle,
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface TransferOrderPageContentProps {
    orderId: string;
}

export default function TransferOrderPageContent({ orderId }: TransferOrderPageContentProps) {
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const { toast } = useToast();

    const handleSaveAddress = () => setIsEditingAddress(false);

    const showComingSoon = () => {
        toast({
            title: 'Coming Soon',
            description: 'This feature is not yet implemented.',
        });
    };

    return (
        <AuthGuard>
            <div className="flex flex-col bg-muted/40">
                <main className="flex-1 container mx-auto p-4 md:p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                             <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                                <RefreshCw className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Transfer orders</p>
                                <div className="flex items-center gap-2 text-lg font-semibold">
                                    <span>{orderId} - 10/30/2025</span>
                                    <Badge variant="secondary">Draft</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Print transfer order
                                        <ChevronDown className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={showComingSoon}>Print transfer order</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon}>Print transfer order with barcode</DropdownMenuItem>
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
                                    <DropdownMenuItem onSelect={showComingSoon}>Import transfer order items</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon}>Duplicate order</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon} disabled>Duplicate order with selection</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={showComingSoon}>Customize this screen</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button><Check className="mr-2" /> Save changes</Button>
                        </div>
                    </div>

                    <Tabs defaultValue="transfer-order" className="w-full">
                        <TabsList>
                            <TabsTrigger value="transfer-order">Transfer order</TabsTrigger>
                            <TabsTrigger value="products-view">Products view</TabsTrigger>
                            <TabsTrigger value="shipments">Shipments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="transfer-order" className="mt-4">
                            <div className="grid lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Information</CardTitle></CardHeader>
                                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Order date</label>
                                                <Input type="date" defaultValue="2025-10-30" />
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Origin</label>
                                                <Input defaultValue="Tawakkal Warehouse" readOnly />
                                            </div>
                                            <div className="space-y-1 relative">
                                                <label className="text-sm font-medium">Estimated ship date</label>
                                                <Input type="date" /><Info className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/>
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Reference number</label>
                                                <Input/>
                                            </div>
                                             <div className="space-y-1 relative">
                                                <label className="text-sm font-medium">Transit sublocation</label>
                                                <Input placeholder="Default from home settings (No facility specified)" /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/>
                                            </div>
                                            <div className="space-y-1 relative">
                                                <label className="text-sm font-medium">Destination</label>
                                                <Input placeholder="-- Unspecified --" /><Search className="absolute right-3 top-1/2 mt-1.5 w-4 h-4 text-muted-foreground"/>
                                            </div>
                                             <div className="space-y-1">
                                                <label className="text-sm font-medium">Estimated receive date</label>
                                                <Input type="date" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Address Information</CardTitle></CardHeader>
                                        <CardContent>
                                            {isEditingAddress ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-sm font-semibold">Ship from</label><Input defaultValue="Heartland" /></div>
                                                    <div><label className="text-sm font-semibold">Ship to</label><Input defaultValue="Heartland" /></div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div><p className="font-semibold">Ship from</p><p>Heartland</p></div>
                                                    <div><p className="font-semibold">Ship to</p><p>Heartland</p></div>
                                                </div>
                                            )}
                                            {isEditingAddress ? (
                                                <div className='flex gap-2'>
                                                     <Button variant="link" className="p-0 h-auto mt-2" onClick={handleSaveAddress}>Save</Button>
                                                     <Button variant="link" className="p-0 h-auto mt-2 text-muted-foreground" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setIsEditingAddress(true)}>Edit ship to or ship from address</Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                                            <Button variant="outline" size="sm"><Trash2 className="mr-2"/> Delete items</Button>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">Summary: TOTAL 0 units</p>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b text-muted-foreground">
                                                        <th className="p-2 w-10 text-left font-normal"><Checkbox/></th>
                                                        <th className="p-2 text-left font-normal">warning</th>
                                                        <th className="p-2 text-left font-normal">product</th>
                                                        <th className="p-2 text-right font-normal">quantity</th>
                                                        <th className="p-2 text-right font-normal">quantity not shipped units</th>
                                                        <th className="p-2 text-right font-normal">quantity shipped units</th>
                                                        <th className="p-2 text-right font-normal">quantity received units</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">Type on last line to add an item. Additional lines are automatically added.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</CardTitle></CardHeader>
                                        <CardContent>
                                            <Textarea placeholder="Internal notes"/>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attachments</CardTitle></CardHeader>
                                        <CardContent className="text-center py-8">
                                            <p className="text-muted-foreground text-sm">No attachments uploaded yet</p>
                                            <Button variant="link" className="text-sm h-auto p-0 mt-1">Drag and drop attachment or <span className="underline">browse</span> (10MB limit)</Button>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <RefreshCw className="w-5 h-5 text-muted-foreground"/>
                                            <CardTitle>Transfer order</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <p><span className="font-semibold">Status:</span> Draft</p>
                                            <p><span className="font-semibold">Shipment status:</span> Not packed or shipped</p>
                                            <Alert variant="destructive" className="bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200">
                                                <AlertTitle className="font-bold">No items or adjustments in transfer order</AlertTitle>
                                                <AlertDescription>
                                                   Please add items or adjustments to the transfer order in order to enable actions.
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                        <CardContent className="p-4 border-t space-y-2">
                                            <Button className="w-full" disabled>Change status to committed</Button>
                                            <Button variant="link" className="w-full text-muted-foreground" disabled>Change status to completed</Button>
                                            <Button variant="link" className="w-full text-destructive">Cancel transfer order</Button>
                                        </CardContent>
                                     </Card>
                                     <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <RefreshCw className="w-5 h-5 text-muted-foreground"/>
                                            <CardTitle>Shipments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link href="#" className="text-primary hover:underline">Transfer shipment {orderId}-1</Link>
                                            <p className="text-sm text-muted-foreground">Editable</p>
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between mt-2" disabled>Ship transfer order <ChevronDown /></Button>
                                                </DropdownMenuTrigger>
                                            </DropdownMenu>
                                        </CardContent>
                                     </Card>
                                      <Card>
                                        <CardHeader className="flex-row items-center gap-2 space-y-0">
                                            <Triangle className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>Stock changes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-2">No stock changes</p>
                                            <Button variant="outline" className="w-full" disabled>Add new stock change</Button>
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
                                            <Button variant="outline" className="w-full mt-4">View detailed order history</Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                 </div>
            </div>
        </AuthGuard>
    );
}
