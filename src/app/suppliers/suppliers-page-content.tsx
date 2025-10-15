
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
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
import { type Supplier } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import AddSupplierDialog from '@/components/suppliers/add-supplier-dialog';
import EditSupplierDialog from '@/components/suppliers/edit-supplier-dialog';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
    const q = query(supplierCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const suppliersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(suppliersList);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: supplierCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Error Fetching Suppliers",
                description: `Code: ${serverError.code}. ${serverError.message}`,
            });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditSupplierOpen(true);
  };
  
  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    const db = getFirestoreDb();
    if (!selectedSupplier || !user || !db) return;

    const docRef = doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id);
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success',
                description: 'Supplier deleted successfully.',
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
                    description: 'Failed to delete supplier.',
                });
            }
        })
        .finally(() => {
            setIsDeleteDialogOpen(false);
            setSelectedSupplier(null);
        })
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
              <Button onClick={() => setIsAddSupplierOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>A list of all your suppliers.</CardDescription>
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
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.email}</TableCell>
                           <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditClick(supplier)} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-destructive focus:text-destructive cursor-pointer">
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
                          No suppliers found. Add a supplier to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <AddSupplierDialog
          isOpen={isAddSupplierOpen}
          setIsOpen={setIsAddSupplierOpen}
          onSupplierAdded={() => { /* Real-time listener handles updates */ }}
        />
        {selectedSupplier && (
            <EditSupplierDialog
                isOpen={isEditSupplierOpen}
                setIsOpen={setIsEditSupplierOpen}
                supplier={selectedSupplier}
                onSupplierUpdated={() => { /* Real-time listener handles updates */ }}
            />
        )}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this supplier.
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
