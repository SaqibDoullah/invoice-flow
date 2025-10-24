
'use client';

import { useState } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  MessageCircle,
  ChevronDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ProductLookup } from '@/types';
import { Badge } from '@/components/ui/badge';

const mockProductLookups: ProductLookup[] = [
    { id: '1', productLookup: '100000', notes: '', productId: '100000-1', description: 'Voopoo Argus P2 Kit-Crystal Pink', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '2', productLookup: '100000-1', notes: '', productId: '100000-1', description: 'Voopoo Argus P2 Kit-Crystal Pink', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '3', productLookup: '100000-2', notes: '', productId: '100000-2', description: 'Voopoo Argus P2 Kit-Emerald Green', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '4', productLookup: '100000-3', notes: '', productId: '100000-3', description: 'Voopoo Argus P2 Kit-Matte Black', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '5', productLookup: '100000-4', notes: '', productId: '100000-4', description: 'Voopoo Argus P2 Kit-Neon Blue', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '6', productLookup: '100000-5', notes: '', productId: '100000-5', description: 'Voopoo Argus P2 Kit-Pearl White', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '7', productLookup: '100000-6', notes: '', productId: '100000-6', description: 'Voopoo Argus P2 Kit-Ruby Red', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '8', productLookup: '100000-7', notes: '', productId: '100000-7', description: 'Voopoo Argus P2 Kit-Titanium Gray', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '9', productLookup: '100000-8', notes: '', productId: '100000-8', description: 'Voopoo Argus P2 Kit-Voilet Purple', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '10', productLookup: '100001', notes: '', productId: '100001-1', description: 'Yocan Ziva Pro Battery-Display of 10-Black', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '11', productLookup: '100001-2', notes: '', productId: '100001-2', description: 'Yocan Ziva Pro Battery-Display of 10-Cyan', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '12', productLookup: '100001-3', notes: '', productId: '100001-3', description: 'Yocan Ziva Pro Battery-Display of 10-Dark B...', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '13', productLookup: '100001-8', notes: '', productId: '100001-8', description: 'Yocan Ziva Pro Battery-Display of 10-Assort...', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '14', productLookup: '100002', notes: '', productId: '100002', description: '', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '15', productLookup: '100003', notes: '', productId: '6941291559317', description: 'Voopoo Argus Cartridge-3ML-Pack of 3-0.4...', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '16', productLookup: '100004', notes: '', productId: '6941291553179', description: 'Voopoo PnP-X Coils - Pack of 5-0.15 Ohms', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '17', productLookup: '100006', notes: '', productId: '100006', description: '', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '18', productLookup: '003924243-1', notes: '', productId: '003924243-1', description: 'SMOK Mag Solo Starter Kit (Single Unit) Col...', status: 'Active', packing: '', lotId: '', stores: '' },
    { id: '19', productLookup: '003924243-2', notes: '', productId: '003924243-2', description: 'SMOK Mag Solo Starter Kit (Single Unit) Col...', status: 'Active', packing: '', lotId: '', stores: '' },
];


export default function ProductLookupsPageContent() {
  const [lookups, setLookups] = useState<ProductLookup[]>(mockProductLookups);
  const [loading, setLoading] = useState(false); // Using mock data, so no real loading
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Product lookups</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Product lookups</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/inventory/product-lookup/new">Create product lookup</Link>
            </Button>
            <Button variant='outline'>Import product lookups</Button>
            <Button variant='outline'>Export product lookups</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Customize this screen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-muted-foreground">All changes saved</span>
          </div>
        </div>

        <Tabs defaultValue="product-lookup" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 flex flex-wrap items-center gap-4">
            <div className='relative w-48'>
                <Input placeholder="Search..." />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm">Filters:</span>
            <Select defaultValue="active">
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-lookups">
              <SelectTrigger className="w-auto">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all-lookups">All lookups</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="regular-lookups">
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="regular-lookups">Regular lookups</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-stores">
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stores">All stores</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="p-2 text-left">Product lookup</TableHead>
                    <TableHead className="p-2 text-left">Notes</TableHead>
                    <TableHead className="p-2 text-left">Product ID</TableHead>
                    <TableHead className="p-2 text-left">Description</TableHead>
                    <TableHead className="p-2 text-left">Status</TableHead>
                    <TableHead className="p-2 text-left">Packing</TableHead>
                    <TableHead className="p-2 text-left">Lot ID</TableHead>
                    <TableHead className="p-2 text-left">Stores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow><TableCell colSpan={8} className="h-24 text-center">Loading...</TableCell></TableRow>
                  ) : lookups.length > 0 ? (
                    lookups.map((lookup) => (
                      <TableRow key={lookup.id}>
                        <TableCell className="p-2 font-medium text-primary">{lookup.productLookup}</TableCell>
                        <TableCell className="p-2">{lookup.notes}</TableCell>
                        <TableCell className="p-2 text-primary">{lookup.productId}</TableCell>
                        <TableCell className="p-2">{lookup.description}</TableCell>
                        <TableCell className="p-2">
                            <Badge variant="outline" className="border-none">
                                {lookup.status} <ChevronDown className="w-3 h-3 ml-1" />
                            </Badge>
                        </TableCell>
                        <TableCell className="p-2">{lookup.packing}</TableCell>
                        <TableCell className="p-2">{lookup.lotId}</TableCell>
                        <TableCell className="p-2">{lookup.stores}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No product lookups found.
                      </TableCell>
                    </TableRow>
                  )}
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
