
'use client';

import { useState } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  ChevronDown,
  History,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockHistoryData = [
    { id: 1, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '34536187-2', description: 'Geekvape Aegis Legend III Kit-Blue', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -25, onHand: 71899, avgCost: 34.849917, amount: -871.25, balance: 700912.19, details: 'Customer: Four Seasons' },
    { id: 2, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-10', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -30, onHand: 71869, avgCost: 16.80, amount: -504.00, balance: 700408.19, details: 'Customer: Four Seasons' },
    { id: 3, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-17', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -30, onHand: 71839, avgCost: 16.97, amount: -509.10, balance: 699899.09, details: 'Customer: Four Seasons' },
    { id: 4, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-18', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -30, onHand: 71809, avgCost: 16.97, amount: -509.10, balance: 699389.99, details: 'Customer: Four Seasons' },
    { id: 5, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-11', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -20, onHand: 71789, avgCost: 16.80, amount: -336.00, balance: 699053.99, details: 'Customer: Four Seasons' },
    { id: 6, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-4', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -20, onHand: 71769, avgCost: 16.80, amount: -336.00, balance: 698717.99, details: 'Customer: Four Seasons' },
    { id: 7, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '607241704-9', description: 'GeekVape H45 (Aegis Hero 2) Starter Kit (Singl...', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -20, onHand: 71749, avgCost: 16.80, amount: -336.00, balance: 698381.99, details: 'Customer: Four Seasons' },
    { id: 8, recordDate: '9/24/2025', user: 'Juan', timestamp: '9/24/2025', productId: '34536187-9', description: 'Geekvape Aegis Legend III Kit-Rainbow', sublocation: 'Main', transaction: 'Sale 100447 packed', quantity: -25, onHand: 71724, avgCost: 34.873665, amount: -871.84, balance: 697510.15, details: 'Customer: Four Seasons' },
];

export default function StockHistoryPageContent() {
  const router = useRouter();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Stock history</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <History className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Stock history:</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-3xl font-bold p-0">
                  Default
                  <ChevronDown className="w-6 h-6 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Default</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Export</Button>
            <Button variant="outline">Actions</Button>
          </div>
        </div>

        <Tabs defaultValue="stock-history" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select defaultValue="30-days">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30-days">From 30 days ago</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative"><Input placeholder="Transaction user" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Product" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Warning" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Location" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <Button variant="outline">More: 1</Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <ShieldAlert className='w-4 h-4 text-orange-500' />
                <span>Filtered: You do not have authorization to view this summary.</span>
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead>Warning</TableHead>
                    <TableHead>Record date</TableHead>
                    <TableHead>Transaction user</TableHead>
                    <TableHead>Transaction timestamp</TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sublocation</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead>Lot ID</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Quantity on hand units</TableHead>
                    <TableHead className="text-right">Transaction average cost</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Valuation balance</TableHead>
                    <TableHead>Transaction details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistoryData.map((item) => (
                    <TableRow key={item.id} className="text-xs">
                      <TableCell></TableCell>
                      <TableCell>{item.recordDate}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>{item.timestamp}</TableCell>
                      <TableCell className="font-medium text-primary">{item.productId}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.sublocation}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-primary">{item.transaction}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.onHand.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.avgCost.toFixed(6)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
                      <TableCell>{item.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
