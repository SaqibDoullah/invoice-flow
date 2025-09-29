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
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type Customer, customerSchema, type CustomerFormData } from '@/types';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { errorEmitter } from '@/lib/error-emitter';

interface AddCustomerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCustomerAdded: () => void;
}

export default function AddCustomerDialog({
  isOpen,
  setIsOpen,
  onCustomerAdded,
}: AddCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    const db = getFirestoreDb();
    if (!user || !db) return;

    setIsSubmitting(true);
    
    const customerCollectionRef = collection(db, 'users', user.uid, 'customers');
    
    addDoc(customerCollectionRef, data)
      .then((docRef) => {
        toast({
          title: 'Success',
          description: 'Customer added successfully.',
        });
        onCustomerAdded();
        setIsOpen(false);
        form.reset();
      })
      .catch((serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: customerCollectionRef.path,
          operation: 'create',
          requestResourceData: data,
        });

        errorEmitter.emit('permission-error', permissionError);

        // Fallback toast for general errors
        if (serverError?.code !== 'permission-denied') {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add customer. Please try again.',
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
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the details for your new customer. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Customer Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
