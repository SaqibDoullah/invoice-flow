'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import InvoiceList from '@/components/invoices/invoice-list';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <Button asChild>
              <Link href="/invoices/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search by customer or invoice #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InvoiceList searchTerm={searchTerm} statusFilter={statusFilter} />
        </main>
      </div>
    </AuthGuard>
  );
}
