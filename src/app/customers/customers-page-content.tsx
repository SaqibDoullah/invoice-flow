'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const customerCollectionRef = collection(db, 'users', user.uid, 'customers');
    const q = query(customerCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const customersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(customersList);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: customerCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Error Fetching Customers",
                description: `Code: ${serverError.code}. ${serverError.message}`,
            });
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const handleCustomerAdded = (newCustomer: Customer) => {
    // The real-time listener will handle this automatically, but we can optimistically update
    setCustomers(prev => [...prev, newCustomer]);
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
