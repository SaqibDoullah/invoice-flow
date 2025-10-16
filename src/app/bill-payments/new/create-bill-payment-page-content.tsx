
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, CreditCard, ChevronDown, Check, Trash2, History, Info, MessageCircle, X } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateBillPaymentPageContent() {

    const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return (
        <AuthGuard>
            <div className="flex flex-col bg-muted/40">
                <main className="flex-1 container mx-auto p-4 md:p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                             <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                                <CreditCard className="w-8 h-8 text-teal-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Bill payments</h1>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">M20241113-TW...</span>
                                    <span className="text-muted-foreground">&bull;</span>
                                    <span className="text-muted-foreground">11/13/2024</span>
                                    <span className="text-muted-foreground">|</span>
                                    <Badge variant="secondary">Draft</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" disabled>
                                Actions
                                <ChevronDown className="ml-2" />
                            </Button>
                            <Button disabled><Check className="mr-2" /> Save changes</Button>
                        </div>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-8 items-start mt-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardContent className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <div className="space-y-1">
                                        <label className="text-sm font-medium">Payment date</label>
                                        <Input type="date" defaultValue="2024-11-13" disabled />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Supplier</label>
                                        <p className="text-sm pt-2">Heartland</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Amount</label>
                                        <Input type="number" defaultValue="310.00" disabled/>
                                    </div>
                                     <div className="space-y-1">
                                        <label className="text-sm font-medium">Method</label>
                                        <Input disabled />
                                    </div>
                                     <div className="space-y-1">
                                        <label className="text-sm font-medium">Transaction ID</label>
                                        <Input disabled />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex-row justify-between items-center">
                                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Linked bills</CardTitle>
                                    <Button variant="outline" size="sm" disabled><Trash2 className="mr-2 w-4 h-4"/> Delete linked bills</Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-md overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12"><Checkbox disabled/></TableHead>
                                                    <TableHead>Bill ID</TableHead>
                                                    <TableHead>Bill date</TableHead>
                                                    <TableHead>Due date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Outstanding</TableHead>
                                                    <TableHead>Amount paid</TableHead>
                                                    <TableHead className="w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell><Checkbox checked disabled/></TableCell>
                                                    <TableCell className="font-medium text-primary">SO-TX-43159</TableCell>
                                                    <TableCell>4/22/2024</TableCell>
                                                    <TableCell>4/22/2024</TableCell>
                                                    <TableCell>13,700.00</TableCell>
                                                    <TableCell>13,700.00</TableCell>
                                                    <TableCell>
                                                        <Input type="number" defaultValue="310.00" className="w-24 text-right" disabled/>
                                                    </TableCell>
                                                    <TableCell><Button variant="ghost" size="icon" disabled><X className="w-4 h-4"/></Button></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <Button variant="link" className="p-0 h-auto" disabled>Link a new bill to this payment</Button>
                                        <div className="text-right text-sm space-y-1 w-64">
                                            <div className="flex justify-between"><span>Total selected:</span><span>310.00</span></div>
                                            <div className="flex justify-between"><span>Total unallocated:</span><span>0.00</span></div>
                                            <div className="flex justify-between font-bold"><span>Total paid:</span><span>310.00</span></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                         <div className="space-y-6">
                            <Card>
                                <CardContent className="p-4 space-y-2 text-sm">
                                    <p><span className="font-semibold">Status:</span> Draft</p>
                                    <p><span className="font-semibold">Synced from:</span> --</p>
                                    <p><span className="font-semibold">Synced to:</span> --</p>
                                </CardContent>
                                <CardContent className="p-4 border-t">
                                    <Button className="w-full" disabled>Change status to posted</Button>
                                    <Button variant="link" className="w-full text-destructive mt-2" disabled>Void bill payment</Button>
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
                                            <p className="text-muted-foreground">seconds ago by You</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                             <div className="fixed bottom-8 right-8">
                                <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                                    <MessageCircle className="w-8 h-8" />
                                </Button>
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
