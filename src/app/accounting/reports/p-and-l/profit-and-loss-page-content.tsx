
'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const reportData = {
    income: [
        { account: 'Sales', amount: 150000 },
        { account: 'Other Income', amount: 5000 },
    ],
    cogs: [
        { account: 'Cost of Goods Sold', amount: 70000 },
    ],
    expenses: [
        { account: 'Advertising', amount: 10000 },
        { account: 'Rent', amount: 5000 },
        { account: 'Utilities', amount: 2000 },
        { account: 'Salaries', amount: 30000 },
    ],
};


export default function ProfitAndLossPageContent() {

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
    
    const totalIncome = reportData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalCogs = reportData.cogs.reduce((sum, item) => sum + item.amount, 0);
    const grossProfit = totalIncome - totalCogs;
    const totalExpenses = reportData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = grossProfit - totalExpenses;

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
             <Link href="/reports" className="hover:text-foreground">
                Reports
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Profit &amp; Loss</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profit &amp; Loss</h1>
                <p className="text-muted-foreground">For the period: This Fiscal Year</p>
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
                     <Select defaultValue="accrual">
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="accrual">Accrual</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
             <div className="space-y-4">
                 {/* Income Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Income</h3>
                    <div className="space-y-1 pl-4">
                       {reportData.income.map(item => (
                           <div key={item.account} className="flex justify-between text-sm">
                               <span>{item.account}</span>
                               <span>{formatCurrency(item.amount)}</span>
                           </div>
                       ))}
                        <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                            <span>Total Income</span>
                            <span>{formatCurrency(totalIncome)}</span>
                        </div>
                    </div>
                </div>

                {/* COGS Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Cost of Goods Sold</h3>
                    <div className="space-y-1 pl-4">
                       {reportData.cogs.map(item => (
                           <div key={item.account} className="flex justify-between text-sm">
                               <span>{item.account}</span>
                               <span>{formatCurrency(item.amount)}</span>
                           </div>
                       ))}
                         <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                            <span>Total Cost of Goods Sold</span>
                            <span>{formatCurrency(totalCogs)}</span>
                        </div>
                    </div>
                </div>
                
                 {/* Gross Profit */}
                 <div className="flex justify-between font-bold text-lg border-t border-b py-2 my-2">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(grossProfit)}</span>
                </div>

                {/* Expenses Section */}
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                    <div className="space-y-1 pl-4">
                       {reportData.expenses.map(item => (
                           <div key={item.account} className="flex justify-between text-sm">
                               <span>{item.account}</span>
                               <span>{formatCurrency(item.amount)}</span>
                           </div>
                       ))}
                         <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                            <span>Total Expenses</span>
                            <span>{formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>
                </div>

                {/* Net Income */}
                <div className="flex justify-between font-bold text-xl border-t-2 border-primary pt-4 mt-4 text-primary">
                    <span>Net Income</span>
                    <span>{formatCurrency(netIncome)}</span>
                </div>
             </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
