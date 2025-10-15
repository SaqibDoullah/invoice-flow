
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc } from 'firebase/firestore';
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
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type Supplier, supplierSchema, type SupplierFormData } from '@/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

interface EditSupplierDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  supplier: Supplier;
  onSupplierUpdated: () => void;
}

export default function EditSupplierDialog({
  isOpen,
  setIsOpen,
  supplier,
  onSupplierUpdated,
}: EditSupplierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset(supplier);
    }
  }, [supplier, form]);

  const handleSubmit = async (data: SupplierFormData) => {
    const db = getFirestoreDb();
    if (!user || !db || !supplier) return;

    setIsSubmitting(true);
    
    const docRef = doc(db, 'users', user.uid, 'suppliers', supplier.id);
    
    updateDoc(docRef, data)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Supplier updated successfully.',
        });
        onSupplierUpdated();
        setIsOpen(false);
      })
      .catch((serverError) => {
         const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });

        errorEmitter.emit('permission-error', permissionError);

        if (serverError?.code !== 'permission-denied') {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update supplier. Please try again.',
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
          <DialogTitle>Edit Supplier</DialogTitle>
          <DialogDescription>
            Update the details for your supplier. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@supplier.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
