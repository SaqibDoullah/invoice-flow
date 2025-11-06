
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
    assets: {
        currentAssets: [
            { account: 'Cash and Cash Equivalents', amount: 75000 },
            { account: 'Accounts Receivable', amount: 50000 },
            { account: 'Inventory', amount: 120000 },
        ],
        fixedAssets: [
            { account: 'Property, Plant, and Equipment', amount: 250000 },
        ]
    },
    liabilities: {
        currentLiabilities: [
            { account: 'Accounts Payable', amount: 40000 },
            { account: 'Short-term Loans', amount: 25000 },
        ],
        longTermLiabilities: [
            { account: 'Long-term Debt', amount: 100000 },
        ]
    },
    equity: [
        { account: 'Common Stock', amount: 150000 },
        { account: 'Retained Earnings', amount: 180000 },
    ],
};

const ReportRow = ({ account, amount }: { account: string, amount: number }) => (
    <div className="flex justify-between text-sm py-1">
        <span>{account}</span>
        <span>{formatCurrency(amount)}</span>
    </div>
);

const ReportSection = ({ title, items }: { title: string, items: {account: string, amount: number}[]}) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return (
         <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="space-y-1 pl-4">
               {items.map(item => <ReportRow key={item.account} {...item} />)}
                <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                    <span>Total {title}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);


export default function BalanceSheetPageContent() {
    
    const totalCurrentAssets = reportData.assets.currentAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalFixedAssets = reportData.assets.fixedAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities = reportData.liabilities.currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLongTermLiabilities = reportData.liabilities.longTermLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    
    const totalEquity = reportData.equity.reduce((sum, item) => sum + item.amount, 0);

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

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
            <span>Balance Sheet</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
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
          <CardContent className="p-6">
             <div className="grid md:grid-cols-2 gap-8">
                 {/* Left side: Assets */}
                 <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Assets</h2>
                    <ReportSection title="Current Assets" items={reportData.assets.currentAssets} />
                    <ReportSection title="Fixed Assets" items={reportData.assets.fixedAssets} />
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-4">
                        <span>Total Assets</span>
                        <span>{formatCurrency(totalAssets)}</span>
                    </div>
                 </div>

                 {/* Right side: Liabilities & Equity */}
                 <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2">Liabilities and Equity</h2>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
                        <div className="space-y-4 pl-4">
                            <ReportSection title="Current Liabilities" items={reportData.liabilities.currentLiabilities} />
                            <ReportSection title="Long-Term Liabilities" items={reportData.liabilities.longTermLiabilities} />
                             <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                                <span>Total Liabilities</span>
                                <span>{formatCurrency(totalLiabilities)}</span>
                            </div>
                        </div>
                    </div>
                    <ReportSection title="Equity" items={reportData.equity} />

                     <div className="flex justify-between font-bold text-lg border-t pt-2 mt-4">
                        <span>Total Liabilities and Equity</span>
                        <span>{formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                 </div>
             </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
