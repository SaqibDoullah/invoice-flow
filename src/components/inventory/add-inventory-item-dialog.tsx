
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type Supplier, inventoryItemSchema, type InventoryItemFormData } from '@/types';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { errorEmitter } from '@/lib/error-emitter';

interface AddInventoryItemDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  suppliers: Supplier[];
  onItemAdded: () => void;
}

export default function AddInventoryItemDialog({
  isOpen,
  setIsOpen,
  suppliers,
  onItemAdded,
}: AddInventoryItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      sku: '',
      quantity: 0,
      price: 0,
      supplierId: '',
    },
  });

  const handleSubmit = async (data: InventoryItemFormData) => {
    const db = getFirestoreDb();
    if (!user || !db) return;

    setIsSubmitting(true);
    
    const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
    
    // If 'none' was selected, treat it as an empty string for the database
    const payload = {
        ...data,
        supplierId: data.supplierId === 'none' ? '' : data.supplierId,
    };
    
    addDoc(itemCollectionRef, payload)
      .then((docRef) => {
        toast({
          title: 'Success',
          description: 'Inventory item added successfully.',
        });
        onItemAdded();
        setIsOpen(false);
        form.reset();
      })
      .catch((serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: itemCollectionRef.path,
          operation: 'create',
          requestResourceData: payload,
        });

        errorEmitter.emit('permission-error', permissionError);

        if (serverError?.code !== 'permission-denied') {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add item. Please try again.',
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Enter the details for the new item. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., T-Shirt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="TSHIRT-BLK-LG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
