
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, RefreshCw, ChevronDown } from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReorderLegacyPageContent() {
  return (
    <AuthGuard>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Reorder</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Action 1</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <div className="p-2 rounded-full bg-muted">
                <RefreshCw className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Reorder</h1>
        </div>

        <p className="text-muted-foreground mb-6">Select location and supplier to preview the list of items to reorder. The list of items can be edited once a purchase order has been created with the create purchase order button.</p>

        <div className="grid md:grid-cols-3 gap-6 items-start mb-6">
            <Card className="md:col-span-1">
                <CardContent className="p-4">
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-sm text-muted-foreground mb-2">Reorder based on quantity on hand and reorder points for this location:</p>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Location options would go here */}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardContent className="p-4">
                    <h3 className="font-semibold">Supplier</h3>
                    <p className="text-sm text-muted-foreground mb-2">Specify suppliers on the product's detail screen to reorder by supplier.</p>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                             {/* Supplier options would go here */}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            <div className="md:col-span-1 flex items-center justify-center">
                 <Button disabled>No purchase orders to create</Button>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Search:" className="max-w-xs" />
            <span className="text-sm font-medium">Filters:</span>
            <Select defaultValue="all-categories">
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-categories">All categories</SelectItem>
                </SelectContent>
            </Select>
             <Select defaultValue="all-manufacturers">
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-manufacturers">All manufacturers</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="border rounded-md overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]"><div className="flex items-center gap-1"><ArrowDown className="w-3 h-3"/> Product ID</div></TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Alternate suppliers</TableHead>
                        <TableHead>Location available</TableHead>
                        <TableHead>Reorder point</TableHead>
                        <TableHead>Reorder variance</TableHead>
                        <TableHead>Reorder point max</TableHead>
                        <TableHead>Reorder point max calc</TableHead>
                        <TableHead>Reorder in qty of</TableHead>
                        <TableHead>Quantity to order</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={10}>
                            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                                <p className="font-bold">No products match</p>
                                <p>There are no products that have a reorder quantity specified and match the selected filters.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <div className="fixed bottom-8 right-8">
            <Button size="icon" className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-8 h-8" />
            </Button>
        </div>
      </main>
    </AuthGuard>
  );
}
