
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  BookCopy,
  ChevronDown,
  Printer,
  Download,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockTrialBalanceData = [
    { code: '1010', name: 'Cash', debit: 125000.00, credit: 0 },
    { code: '1200', name: 'Accounts Receivable', debit: 55000.00, credit: 0 },
    { code: '1400', name: 'Inventory Asset', debit: 210000.00, credit: 0 },
    { code: '2000', name: 'Accounts Payable', debit: 0, credit: 35000.00 },
    { code: '2200', name: 'Sales Tax Payable', debit: 0, credit: 8500.00 },
    { code: '3000', name: "Owner's Equity", debit: 0, credit: 346500.00 },
    { code: '4000', name: 'Sales', debit: 0, credit: 150000.00 },
    { code: '4500', name: 'Shipping Income', debit: 0, credit: 5000.00 },
    { code: '5000', name: 'Cost of Goods Sold', debit: 75000.00, credit: 0 },
    { code: '6000', name: 'Bank Fees', debit: 250.00, credit: 0 },
    { code: '6100', name: 'Rent Expense', debit: 10000.00, credit: 0 },
];

export default function TrialBalancePageContent() {

  const totalDebits = mockTrialBalanceData.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredits = mockTrialBalanceData.reduce((acc, curr) => acc + curr.credit, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <AuthGuard>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/accounting" className="hover:text-foreground">
                Accounting
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Trial Balance</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <BookCopy className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
                <p className="text-muted-foreground">As of {format(new Date(), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Export <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">Customize</Button>
          </div>
        </div>

        <Card className="mb-6">
            <CardContent className="p-4 flex gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-sm font-medium">As of date</label>
                    <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-48"/>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Accounting basis</label>
                     <p className="font-medium pt-2">Accrual</p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Account Code</TableHead>
                    <TableHead className="w-2/4">Account Name</TableHead>
                    <TableHead className="text-right w-1/4">Debit</TableHead>
                    <TableHead className="text-right w-1/4">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrialBalanceData.map((entry) => (
                    <TableRow key={entry.code}>
                      <TableCell className="font-mono">{entry.code}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell className="text-right font-mono">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalDebits)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalCredits)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}

