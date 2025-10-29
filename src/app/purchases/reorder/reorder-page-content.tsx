
'use client';

import { useState } from 'react';
import { 
    Home, 
    ChevronRight, 
    RefreshCw, 
    ChevronDown, 
    Search, 
    Filter,
    ArrowUpDown,
    ShieldAlert,
    MessageCircle,
    ImageIcon
} from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReorderPageContent() {
    // For now, the component is static as per the image.
    // State and logic will be added in subsequent steps.

    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Reorder</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                            <RefreshCw className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Reorder:</h1>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-3xl font-bold p-0">
                                    Main view
                                    <ChevronDown className="w-6 h-6 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Main view</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button>Create purchase</Button>
                        <Button variant="outline">Reset quantity</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Export <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Export CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Action 1</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mb-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Input placeholder="Search..." />
                         <Select defaultValue="drop-ship">
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="drop-ship">Location: Drop Ship</SelectItem></SelectContent>
                        </Select>
                        <div className="relative"><Input placeholder="Supplier" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/></div>
                         <Select defaultValue="gt-zero">
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="gt-zero">Recommended quantity: Quantity to order > 0</SelectItem></SelectContent>
                        </Select>
                        <div className="relative"><Input placeholder="Category" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More: 1</Button>
                            <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
                
                 <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md mb-4 space-y-1">
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Filtered: You do not have authorization to view this summary.</span></div>
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Selected: You do not have authorization to view this summary.</span></div>
                    <div className="flex items-center gap-2"><ShieldAlert className='w-4 h-4 text-orange-500' /><span>Suppliers: You do not have authorization to view this summary.</span></div>
                </div>


                <Card>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-16 text-center"><ImageIcon className="w-4 h-4 mx-auto"/></TableHead>
                                        <TableHead>Product ID Description</TableHead>
                                        <TableHead>Supplier 1 Supplier 1 Price</TableHead>
                                        <TableHead>Supplier 2 Supplier 2 price</TableHead>
                                        <TableHead>Sales velocity</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>On order On hand Reservations Available</TableHead>
                                        <TableHead>Stockout Reorder point ↓ Reorder variance Reorder point max</TableHead>
                                        <TableHead>Recommended quantity</TableHead>
                                        <TableHead>Quantity to order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={10} className="h-24 text-center text-red-600">
                                            There are no products that have a reorder quantity specified and match the selected filters
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                </Card>
                <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </main>
        </AuthGuard>
    );
}
