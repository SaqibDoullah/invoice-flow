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
  Search,
  Filter,
} from 'lucide-react';

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
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const mockLedgerData = [
    { date: '10/26/2024', type: 'Invoice', num: '1001', contact: 'Customer A', memo: 'Sale of goods', account: 'Accounts Receivable', debit: 500, credit: 0, balance: 500 },
    { date: '10/26/2024', type: 'Invoice', num: '1001', contact: 'Customer A', memo: 'Sale of goods', account: 'Sales', debit: 0, credit: 500, balance: -500 },
    { date: '10/25/2024', type: 'Bill', num: 'B-501', contact: 'Supplier X', memo: 'Office Supplies', account: 'Office Expenses', debit: 150, credit: 0, balance: 150 },
    { date: '10/25/2024', type: 'Bill', num: 'B-501', contact: 'Supplier X', memo: 'Office Supplies', account: 'Accounts Payable', debit: 0, credit: 150, balance: -150 },
    { date: '10/24/2024', type: 'Payment', num: 'P-201', contact: 'Customer A', memo: 'Payment for INV-1001', account: 'Cash', debit: 500, credit: 0, balance: 500 },
    { date: '10/24/2024', type: 'Payment', num: 'P-201', contact: 'Customer A', memo: 'Payment for INV-1001', account: 'Accounts Receivable', debit: 0, credit: 500, balance: -500 },
];

export default function GeneralLedgerPageContent() {

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
            <span>General Ledger</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <BookCopy className="w-6 h-6 text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Export As <ChevronDown className="w-4 h-4 ml-2" />
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
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <Select defaultValue="this-fiscal-year">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-fiscal-year">Date Range: This Fiscal Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="accrual">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="accrual">Accounting Basis: Accrual</SelectItem>
                        </SelectContent>
                    </Select>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-10"/>
                    </div>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" />More Filters</Button>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>No.</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Memo/Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLedgerData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell className="text-primary hover:underline cursor-pointer">{entry.num}</TableCell>
                      <TableCell className="text-primary hover:underline cursor-pointer">{entry.contact}</TableCell>
                      <TableCell>{entry.memo}</TableCell>
                      <TableCell>{entry.account}</TableCell>
                      <TableCell className="text-right font-mono">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
