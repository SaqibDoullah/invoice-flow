
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  FileText,
  ChevronDown,
  Printer,
  Download,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const taxData = [
    { jurisdiction: 'California', rate: '7.25%', collected: 1812.50, payable: 1812.50 },
    { jurisdiction: 'Texas', rate: '6.25%', collected: 1250.00, payable: 1250.00 },
    { jurisdiction: 'New York', rate: '4.00%', collected: 800.00, payable: 800.00 },
];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);


export default function TaxSummaryPageContent() {
    
    const totalCollected = taxData.reduce((sum, item) => sum + item.collected, 0);
    const totalPayable = taxData.reduce((sum, item) => sum + item.payable, 0);

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
            <span>Tax Summary</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tax Summary</h1>
                <p className="text-muted-foreground">For period: This Fiscal Year</p>
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
                    <label className="text-sm font-medium">Date range</label>
                    <Select defaultValue="this-fiscal-year">
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-fiscal-year">This Fiscal Year</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead className="text-right">Tax Collected</TableHead>
                    <TableHead className="text-right">Tax Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxData.map((row) => (
                    <TableRow key={row.jurisdiction}>
                        <TableCell className="font-medium">{row.jurisdiction}</TableCell>
                        <TableCell>{row.rate}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(row.collected)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(row.payable)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalCollected)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalPayable)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
