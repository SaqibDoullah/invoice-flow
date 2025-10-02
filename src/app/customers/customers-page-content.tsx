'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { getFirestoreDb } from '@/lib/firebase-client';
import { type Customer, type CustomerFormData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import AddCustomerDialog from '@/components/customers/add-customer-dialog';
import EditCustomerDialog from '@/components/customers/edit-customer-dialog';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerOpen(true);
  };
  
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    const db = getFirestoreDb();
    if (!selectedCustomer || !user || !db) return;

    const docRef = doc(db, 'users', user.uid, 'customers', selectedCustomer.id);
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success',
                description: 'Customer deleted successfully.',
            });
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);

            if (serverError.code !== 'permission-denied') {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete customer.',
                });
            }
        })
        .finally(() => {
            setIsDeleteDialogOpen(false);
            setSelectedCustomer(null);
        })
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
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                           <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditClick(customer)} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-destructive focus:text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                           </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
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
          onCustomerAdded={() => { /* Real-time listener handles updates */ }}
        />
        {selectedCustomer && (
            <EditCustomerDialog
                isOpen={isEditCustomerOpen}
                setIsOpen={setIsEditCustomerOpen}
                customer={selectedCustomer}
                onCustomerUpdated={() => { /* Real-time listener handles updates */ }}
            />
        )}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this customer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                Continue
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
