'use client';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// Mock data for customers - replace with real data from Firestore later
const customers = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', invoices: 5, totalBilled: 2500 },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', invoices: 3, totalBilled: 1500 },
];

export default function CustomersPage() {
  return (
    <AuthGuard>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
               <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>A list of all your customers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Invoices</TableHead>
                      <TableHead className="text-right">Total Billed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell className="text-center">{customer.invoices}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customer.totalBilled)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </main>
        </div>
      </SidebarInset>
    </AuthGuard>
  );
}
