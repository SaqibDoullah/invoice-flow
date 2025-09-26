'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
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
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Customer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import AddCustomerDialog from '@/components/customers/add-customer-dialog';

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const fetchCustomers = async () => {
    const db = getFirestoreDb();
    if (!user || !db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'users', user.uid, 'customers'));
      const querySnapshot = await getDocs(q);
      const customersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customersList);
    } catch (error: any) {
      console.error("Error fetching customers: ", { code: error?.code, message: error?.message });
      toast({
          variant: "destructive",
          title: "Error Fetching Customers",
          description: `Code: ${error.code}. ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCustomers();
    }
  }, [user, authLoading]);

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    fetchCustomers(); // Re-fetch to ensure data is sorted and consistent
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <Button onClick={() => setIsAddCustomerOpen(true)}>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          No customers found. Add a customer to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <AddCustomerDialog
          isOpen={isAddCustomerOpen}
          setIsOpen={setIsAddCustomerOpen}
          onCustomerAdded={handleCustomerAdded}
        />
      </div>
    </AuthGuard>
  );
}
