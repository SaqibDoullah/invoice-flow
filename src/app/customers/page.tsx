'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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
import { db } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  invoices: number;
  totalBilled: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = query(collection(db, 'users', user.uid, 'invoices'));
        const querySnapshot = await getDocs(q);
        const invoices = querySnapshot.docs.map(doc => doc.data() as Invoice);

        const customerData = invoices.reduce((acc, invoice) => {
          const { customerName, customerEmail, total } = invoice;
          const customerId = `${customerName}-${customerEmail}`;
          if (!acc[customerId]) {
            acc[customerId] = {
              id: customerId,
              name: customerName,
              email: customerEmail,
              invoices: 0,
              totalBilled: 0,
            };
          }
          acc[customerId].invoices += 1;
          acc[customerId].totalBilled += total;
          return acc;
        }, {} as Record<string, Customer>);

        setCustomers(Object.values(customerData));
      } catch (error: any) {
        console.error("Error fetching customer data: ", { code: error?.code, message: error?.message });
        toast({
            variant: "destructive",
            title: "Error Fetching Customers",
            description: `Code: ${error.code}. ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchCustomerData();
    }
  }, [user, authLoading, toast]);

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
                <CardDescription>A list of all your customers derived from your invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || authLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
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
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell className="text-center">{customer.invoices}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customer.totalBilled)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No customer data found. Create an invoice to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

          </main>
        </div>
      </SidebarInset>
    </AuthGuard>
  );
}
