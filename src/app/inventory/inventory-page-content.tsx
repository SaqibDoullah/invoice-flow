
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import { type InventoryItem, type Supplier } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import AddInventoryItemDialog from '@/components/inventory/add-inventory-item-dialog';
import EditInventoryItemDialog from '@/components/inventory/edit-inventory-item-dialog';

export default function InventoryPageContent() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
    const q = query(itemCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const itemsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        
        // Fetch suppliers to map supplier names
        const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
        const supplierSnapshot = await getDocs(supplierCollectionRef);
        const supplierList = supplierSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(supplierList);

        const itemsWithSuppliers = itemsList.map(item => {
            const supplier = supplierList.find(s => s.id === item.supplierId);
            return { ...item, supplier };
        });

        setInventoryItems(itemsWithSuppliers);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Error Fetching Inventory",
                description: `Code: ${serverError.code}. ${serverError.message}`,
            });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditItemOpen(true);
  };
  
  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    const db = getFirestoreDb();
    if (!selectedItem || !user || !db) return;

    const docRef = doc(db, 'users', user.uid, 'inventory', selectedItem.id);
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success',
                description: 'Item deleted successfully.',
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
                    description: 'Failed to delete item.',
                });
            }
        })
        .finally(() => {
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        })
  }
  
  const formatCurrency = (amount: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                  <Link href="/inventory">
                      Back to Inventory
                  </Link>
              </Button>
              <Button onClick={() => setIsAddItemOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
              </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>A list of all items in your inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || authLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || '-'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                         <TableCell>
                              <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(item)} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive focus:text-destructive cursor-pointer">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                              </DropdownMenu>
                         </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No inventory items found. Add an item to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <AddInventoryItemDialog
        isOpen={isAddItemOpen}
        setIsOpen={setIsAddItemOpen}
        suppliers={suppliers}
        onItemAdded={() => { /* Real-time listener handles updates */ }}
      />
      {selectedItem && (
          <EditInventoryItemDialog
              isOpen={isEditItemOpen}
              setIsOpen={setIsEditItemOpen}
              item={selectedItem}
              suppliers={suppliers}
              onItemUpdated={() => { /* Real-time listener handles updates */ }}
          />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item from your inventory.
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
    </AuthGuard>
  );
}
