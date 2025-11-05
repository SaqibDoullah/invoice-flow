
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, BookUser, Search, Plus, Upload, Download, Settings, Printer, Mail, ArrowUpDown } from 'lucide-react';

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

const mockAccounts = [
    { code: '1010', name: 'Cash', type: 'Asset', subType: 'Bank', balance: 125000.00, isActive: true, isSystem: true },
    { code: '1200', name: 'Accounts Receivable (A/R)', type: 'Asset', subType: 'Accounts Receivable', balance: 55000.00, isActive: true, isSystem: true },
    { code: '1400', name: 'Inventory Asset', type: 'Asset', subType: 'Current Asset', balance: 210000.00, isActive: true, isSystem: true },
    { code: '2000', name: 'Accounts Payable (A/P)', type: 'Liability', subType: 'Accounts Payable', balance: 35000.00, isActive: true, isSystem: true },
    { code: '2200', name: 'Sales Tax Payable', type: 'Liability', subType: 'Current Liability', balance: 8500.00, isActive: true, isSystem: true },
    { code: '3000', name: 'Owner\'s Equity', type: 'Equity', subType: '', balance: 346500.00, isActive: true, isSystem: true },
    { code: '4000', name: 'Sales', type: 'Income', subType: '', balance: 150000.00, isActive: true, isSystem: true },
    { code: '4500', name: 'Shipping Income', type: 'Income', subType: '', balance: 5000.00, isActive: true, isSystem: true },
    { code: '5000', name: 'Cost of Goods Sold (COGS)', type: 'Expense', subType: 'Cost of Goods Sold', balance: 75000.00, isActive: true, isSystem: true },
    { code: '6000', name: 'Bank Fees', type: 'Expense', subType: 'Bank Charges', balance: 250.00, isActive: true, isSystem: false },
    { code: '6100', name: 'Rent Expense', type: 'Expense', subType: 'Operating Expense', balance: 10000.00, isActive: true, isSystem: false },
];


export default function ChartOfAccountsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = mockAccounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/accounting" className="hover:text-foreground">
            Accounting
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Chart of Accounts</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
              <BookUser className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Account
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 w-10 p-0">
                        <Settings className="h-5 w-5" />
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
                        Email to a friend
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                    placeholder="Search accounts..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><div className="flex items-center gap-1"><ArrowUpDown className="w-4 h-4"/>Account Code</div></TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.code} className={account.isSystem ? 'bg-muted/50' : ''}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>
                        <p>{account.name}</p>
                        {account.isSystem && <p className="text-xs text-muted-foreground">System Account</p>}
                      </TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(account.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-right text-sm text-muted-foreground">
            {filteredAccounts.length} of {mockAccounts.length} accounts showing.
        </div>
      </div>
    </AuthGuard>
  );
}
