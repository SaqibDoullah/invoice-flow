
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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const reportData = {
    operatingActivities: [
        { account: 'Net Income', amount: 38000, isPositive: true },
        { account: 'Depreciation', amount: 5000, isPositive: true },
        { account: 'Increase in Accounts Receivable', amount: -10000, isPositive: false },
        { account: 'Decrease in Inventory', amount: 15000, isPositive: true },
        { account: 'Increase in Accounts Payable', amount: 8000, isPositive: true },
    ],
    investingActivities: [
        { account: 'Purchase of Equipment', amount: -20000, isPositive: false },
        { account: 'Sale of Assets', amount: 3000, isPositive: true },
    ],
    financingActivities: [
        { account: 'Proceeds from Long-term Debt', amount: 50000, isPositive: true },
        { account: 'Payment of Dividends', amount: -10000, isPositive: false },
    ],
    cashAtBeginning: 25000,
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

const ReportRow = ({ account, amount }: { account: string, amount: number }) => (
    <div className="flex justify-between text-sm py-1">
        <span>{account}</span>
        <span>{amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}</span>
    </div>
);

const ReportSection = ({ title, items, isSubSection = false }: { title: string, items: {account: string, amount: number}[], isSubSection?: boolean }) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return (
         <div className={isSubSection ? 'pl-4' : ''}>
            <h3 className={`font-semibold mb-2 ${isSubSection ? 'text-base' : 'text-lg'}`}>{title}</h3>
            <div className="space-y-1 pl-4">
               {items.map(item => <ReportRow key={item.account} {...item} />)}
                <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                    <span>Net Cash from {title}</span>
                    <span>{total < 0 ? `(${formatCurrency(Math.abs(total))})` : formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};


export default function CashFlowStatementPageContent() {
    
    const totalOperating = reportData.operatingActivities.reduce((sum, item) => sum + item.amount, 0);
    const totalInvesting = reportData.investingActivities.reduce((sum, item) => sum + item.amount, 0);
    const totalFinancing = reportData.financingActivities.reduce((sum, item) => sum + item.amount, 0);

    const netCashChange = totalOperating + totalInvesting + totalFinancing;
    const cashAtEnd = reportData.cashAtBeginning + netCashChange;

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
            <span>Cash Flow Statement</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cash Flow Statement</h1>
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
             <div className="max-w-2xl mx-auto space-y-6">
                <ReportSection title="Operating Activities" items={reportData.operatingActivities} />
                <ReportSection title="Investing Activities" items={reportData.investingActivities} />
                <ReportSection title="Financing Activities" items={reportData.financingActivities} />
                
                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between font-bold">
                        <span>Net Increase/Decrease in Cash</span>
                        <span>{netCashChange < 0 ? `(${formatCurrency(Math.abs(netCashChange))})` : formatCurrency(netCashChange)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cash at Beginning of Period</span>
                        <span>{formatCurrency(reportData.cashAtBeginning)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>Cash at End of Period</span>
                        <span>{formatCurrency(cashAtEnd)}</span>
                    </div>
                </div>
             </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
