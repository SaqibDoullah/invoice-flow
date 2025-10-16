
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, ChevronDown, Filter, MoreVertical, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type BillPayment } from '@/types';
import { mockBillPayments } from '@/lib/mock-data';

export default function BillPaymentsPageContent() {
  const [billPayments, setBillPayments] = useState<BillPayment[]>(mockBillPayments);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <AuthGuard>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Bill payments</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Bill payments:</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    Default <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Default</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/purchases">Create bill payment from bill</Link>
              </Button>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Export <ChevronDown className="w-4 h-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem>Export CSV</DropdownMenuItem>
                      <DropdownMenuItem>Export PDF</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Action 1</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search..." className="max-w-xs" />
            <Input type="date" placeholder="All dates" className="w-auto"/>
            <Input placeholder="Supplier" />
            <Input placeholder="Method" />
            <Input placeholder="Status: Posted, Draft" />
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters</Button>
            <Button variant="ghost"><RefreshCw className="h-4 w-4" /></Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Record created</TableHead>
                      <TableHead>Record last updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billPayments.length > 0 ? (
                      billPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell>
                            <Badge variant="secondary">{payment.status}</Badge>
                          </TableCell>
                          <TableCell>{format(payment.date, 'MM/dd/yyyy')}</TableCell>
                          <TableCell className="font-medium text-blue-600">{payment.paymentId}</TableCell>
                          <TableCell>{payment.supplier}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{format(payment.recordCreated, "MMM d yyyy h:mm:ss a")}</TableCell>
                          <TableCell>{format(payment.recordLastUpdated, "MMM d yyyy h:mm:ss a")}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No bill payments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
