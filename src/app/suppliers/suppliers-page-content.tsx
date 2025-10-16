'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';
import { Plus, MoreHorizontal, Edit, Trash2, Home, ChevronRight, Upload, Download, Settings2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import AuthGuard from '@/components/auth/auth-guard';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');


  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
    
    const conditions = [];
    if (statusFilter !== 'all') {
        conditions.push(where('status', '==', statusFilter));
    }
    
    const q = query(supplierCollectionRef, ...conditions);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let suppliersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        
        if (searchTerm) {
            suppliersList = suppliersList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

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
  }, [user, authLoading, toast, searchTerm, statusFilter]);

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
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Suppliers</span>
            </div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Suppliers: Default</h1>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddSupplierOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Supplier
                </Button>
                 <Button variant="outline" disabled><Upload className="mr-2 h-4 w-4" /> Import</Button>
                 <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" /> Export</Button>
                 <Button variant="outline" disabled><Settings2 className="mr-2 h-4 w-4" /> Actions</Button>
              </div>
          </div>
          
          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                 <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Created date" />
                    </SelectTrigger>
                 </Select>
                 <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Last updated date" />
                    </SelectTrigger>
                 </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span>Filtered: You do not have authorization to view this summary.</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading || authLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Primary Phone Number</TableHead>
                      <TableHead>Primary Email Addresses</TableHead>
                      <TableHead>Primary Address</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'} className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                                {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contactName}</TableCell>
                          <TableCell>{supplier.phoneNumber}</TableCell>
                          <TableCell>{supplier.email}</TableCell>
                          <TableCell>{supplier.address}</TableCell>
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
                        <TableCell colSpan={7} className="h-24 text-center">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
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