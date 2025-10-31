'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, ChevronDown, Check, Trash2, History, Info, MessageCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/auth/auth-guard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AverageCostChangePageContentProps {
    id: string;
}

export default function AverageCostChangePageContent({ id }: AverageCostChangePageContentProps) {

    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                            <Calculator className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                             <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">Average cost changes</p>
                             <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">Average cost change {id}</h1>
                                <Badge variant="secondary">Draft</Badge>
                             </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Print average cost change <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Print average cost change</DropdownMenuItem>
                                <DropdownMenuItem>Export average cost change to excel</DropdownMenuItem>
                                <DropdownMenuItem>Email average cost change</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Import average cost change items</DropdownMenuItem>
                                <DropdownMenuItem>Customize this screen</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button><Check className="mr-2 h-4 w-4" /> Save changes</Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-64">
                                    <label className="text-sm">Effective date</label>
                                    <Input type="date" defaultValue="2025-10-31"/>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
                             </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                     <Button variant="outline" size="sm" disabled><Trash2 className="mr-2 w-4 h-4" /> Delete items</Button>
                                </div>
                                <div className="border rounded-md overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12"><Checkbox disabled/></TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Effective date avg cost</TableHead>
                                                <TableHead>Expected avg cost</TableHead>
                                                <TableHead>Resulting avg cost</TableHead>
                                                <TableHead>Change in valuation</TableHead>
                                                <TableHead>Item notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                                                    Type on last line to add an item. Additional lines are automatically added.
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <Textarea placeholder="Notes"/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                             <CardHeader className="flex-row items-center gap-2 space-y-0">
                                <Calculator className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Average cost change</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm"><span className="font-semibold">Status:</span> Draft</p>
                                <Alert variant="destructive" className="bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200">
                                    <AlertTitle className="font-bold">Empty item list</AlertTitle>
                                    <AlertDescription>
                                       Please add items to the average cost change to enable posting.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                            <CardContent className="p-4 border-t space-y-2">
                                <Button className="w-full" disabled>Change status to posted</Button>
                                <Button variant="link" className="w-full text-destructive">Cancel average cost change</Button>
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
                    </div>
                </div>

                <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </main>
        </AuthGuard>
    );
}
