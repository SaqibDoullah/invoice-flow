
'use client';

import { useState } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  MessageCircle,
  ImageIcon,
  ChevronDown,
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockData = [
    { id: '100000-1', desc: 'Voopoo Argus P2 Kit-Crystal Pink', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: 'D1-03-C', stdBuyPrice: 13.90, reservations: 0, remaining: 12, loc1Avail: null, loc2Avail: null, loc3Avail: 12 },
    { id: '100000-2', desc: 'Voopoo Argus P2 Kit-Emerald Green', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 13.90, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100000-3', desc: 'Voopoo Argus P2 Kit-Matte Black', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 13.90, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100000-4', desc: 'Voopoo Argus P2 Kit-Neon Blue', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 15.04, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100000-5', desc: 'Voopoo Argus P2 Kit-Pearl White', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 15.04, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100000-6', desc: 'Voopoo Argus P2 Kit-Ruby Red', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 15.04, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100000-7', desc: 'Voopoo Argus P2 Kit-Titanium Gray', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: 'D1-03-C', stdBuyPrice: 15.04, reservations: 0, remaining: 10, loc1Avail: null, loc2Avail: null, loc3Avail: 10 },
    { id: '100000-8', desc: 'Voopoo Argus P2 Kit-Voilet Purple', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 15.04, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '100001-1', desc: 'Yocan Ziva Pro Battery-Display of 10-Black', salesVel: '0.00', stockout: '', onOrder: 0, sublocations: '', stdBuyPrice: 60.00, reservations: 0, remaining: 0, loc1Avail: null, loc2Avail: null, loc3Avail: null },
    { id: '003924243-1', desc: 'SMOK Mag Solo Starter Kit (Single Unit) Color=...', salesVel: '0.67', stockout: '15 d', onOrder: 0, sublocations: 'C7-02-C', stdBuyPrice: 31.67, reservations: 0, remaining: 10, loc1Avail: null, loc2Avail: null, loc3Avail: 10 },
    { id: '24838229-1', desc: 'SMOK Novo M Replacement Pod (3 Pack) Resi...', salesVel: '6.67', stockout: '115 d', onOrder: 0, sublocations: 'C8-02-D', stdBuyPrice: 3.98, reservations: 50, remaining: 770, loc1Avail: null, loc2Avail: null, loc3Avail: 770 },
];


export default function ReorderingSummaryPageContent() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
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
          <span>Reordering summary</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Reordering summary</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='outline'>Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Customize columns</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="reordering-summary" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <p className="text-sm text-muted-foreground my-4">This screen shows quantity on hand and reorder points for each location and product. Use the <Link href="#" className="text-primary hover:underline">reorder screen</Link> to create a purchase order based on reorder points.</p>

        <div className="mt-4 mb-4 flex flex-wrap items-center gap-4">
            <div className='relative w-48'>
                <Input placeholder="Search..." />
            </div>
            <div className="relative w-48"><Input placeholder="Category" /></div>
            <div className="relative w-48"><Input placeholder="Manufacturer" /></div>
            <div className="relative w-48"><Input placeholder="Status" /></div>
            <div className="relative w-48"><Input placeholder="Supplier" /></div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters...</Button>
            <Button variant="ghost" size="icon"><ArrowUpDown className="w-4 h-4" /></Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="p-2 w-10">Img</TableHead>
                    <TableHead className="p-2">Product ID</TableHead>
                    <TableHead className="p-2">Description</TableHead>
                    <TableHead className="p-2">Sales velocity</TableHead>
                    <TableHead className="p-2">Stockout + BOM</TableHead>
                    <TableHead className="p-2">On order units</TableHead>
                    <TableHead className="p-2">Sublocations</TableHead>
                    <TableHead className="p-2">Std buy price</TableHead>
                    <TableHead className="p-2">Reservations units</TableHead>
                    <TableHead className="p-2">Remaining + BOM units</TableHead>
                    <TableHead className="p-2 text-center border-l" colSpan={3}>Location: Drop Ship</TableHead>
                    <TableHead className="p-2 text-center border-l" colSpan={3}>Location: Marhaba</TableHead>
                    <TableHead className="p-2 text-center border-l" colSpan={3}>Location: Tawakkal Warehouse</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2"></TableHead>
                    <TableHead className="p-2 text-right border-l">Avail</TableHead>
                    <TableHead className="p-2 text-right">Reorder level</TableHead>
                    <TableHead className="p-2 text-right">Variance</TableHead>
                    <TableHead className="p-2 text-right border-l">Avail</TableHead>
                    <TableHead className="p-2 text-right">Reorder level</TableHead>
                    <TableHead className="p-2 text-right">Variance</TableHead>
                    <TableHead className="p-2 text-right border-l">Avail</TableHead>
                    <TableHead className="p-2 text-right">Reorder level</TableHead>
                    <TableHead className="p-2 text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow><TableCell colSpan={19} className="h-24 text-center">Loading...</TableCell></TableRow>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <TableRow key={item.id} className="text-xs">
                        <TableCell className="p-2"><ImageIcon className="w-4 h-4 text-muted-foreground"/></TableCell>
                        <TableCell className="p-2 font-medium text-primary">{item.id}</TableCell>
                        <TableCell className="p-2">{item.desc}</TableCell>
                        <TableCell className="p-2">{item.salesVel}</TableCell>
                        <TableCell className="p-2">{item.stockout}</TableCell>
                        <TableCell className="p-2">{item.onOrder}</TableCell>
                        <TableCell className="p-2">{item.sublocations}</TableCell>
                        <TableCell className="p-2">{formatCurrency(item.stdBuyPrice)}</TableCell>
                        <TableCell className="p-2">{item.reservations}</TableCell>
                        <TableCell className="p-2">{item.remaining}</TableCell>
                        <TableCell className="p-2 border-l">{item.loc1Avail}</TableCell><TableCell></TableCell><TableCell></TableCell>
                        <TableCell className="p-2 border-l">{item.loc2Avail}</TableCell><TableCell></TableCell><TableCell></TableCell>
                        <TableCell className="p-2 border-l">{item.loc3Avail}</TableCell><TableCell></TableCell><TableCell></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={19} className="h-24 text-center">
                        No data found.
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
