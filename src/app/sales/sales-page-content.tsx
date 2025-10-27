
'use client';

import { useState } from 'react';
import { Home, ChevronRight, DollarSign, ChevronDown, Search, Filter, ArrowUpDown, MessageCircle, ShieldAlert } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type SalesOrder } from '@/types';
import { mockSalesOrders } from '@/lib/mock-data';

export default function SalesPageContent() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(mockSalesOrders);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'committed': return 'bg-green-100 text-green-800';
        case 'draft': return 'bg-gray-100 text-gray-800';
        default: return 'bg-secondary text-secondary-foreground';
    }
  }

  const getFulfillmentStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
          case 'backordered': return 'text-red-600';
          case 'uncommitted': return 'text-orange-600';
          case 'packed w/ exceptions': return 'text-orange-600';
          default: return '';
      }
  }


  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Sales</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Sales:</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  Main view <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Main view</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button>Create sales order</Button>
            <Button variant="outline">Import sales orders</Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">Export <ChevronDown className="w-4 h-4 ml-2" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Export CSV</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions <ChevronDown className="w-4 h-4 ml-2" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Action 1</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Input placeholder="Search..." className="w-48" />
          <Input placeholder="Status: Committed, Draft" className="w-48" />
          <Select defaultValue="all-dates">
              <SelectTrigger className="w-48">
                  <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all-dates">All dates</SelectItem>
              </SelectContent>
          </Select>
          <div className="relative w-48"><Input placeholder="Customer"/><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/></div>
          <Input placeholder="Shipments status summary" className="w-48" />
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
          <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mb-4">
            <ShieldAlert className='w-4 h-4 text-orange-500' />
            <span>Filtered: You do not have authorization to view this summary.</span>
            <span className='pl-4'>Selected: You do not have authorization to view this summary.</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox /></TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order date</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Ship to: name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Fulfillment status</TableHead>
                    <TableHead>Shipments</TableHead>
                    <TableHead>Shipments status summary</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Invoices status summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell><Badge variant="secondary" className={getStatusBadge(order.status)}>{order.status}</Badge></TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell className="font-medium text-primary">{order.orderId}</TableCell>
                      <TableCell className="text-primary">{order.customer}</TableCell>
                      <TableCell>{order.shipToName}</TableCell>
                      <TableCell>{order.source}</TableCell>
                      <TableCell>{order.origin}</TableCell>
                      <TableCell>{order.batchId}</TableCell>
                      <TableCell className={getFulfillmentStatusBadge(order.fulfillmentStatus)}>{order.fulfillmentStatus}</TableCell>
                      <TableCell>{order.shipments}</TableCell>
                      <TableCell>{order.shipmentsStatusSummary}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                      <TableCell>{order.invoicesStatusSummary}</TableCell>
                    </TableRow>
                  ))}
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
      </div>
    </AuthGuard>
  );
}
