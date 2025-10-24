
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, ChevronRight, Filter, Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AuthGuard from '@/components/auth/auth-guard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productLookupFormSchema, type ProductLookupFormData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function CreateProductLookupPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductLookupFormData>({
        resolver: zodResolver(productLookupFormSchema),
        defaultValues: {
            productLookup: '',
            productId: '',
            notes: '',
            lotId: '',
            packing: '',
            stores: '',
        }
    });
    
    const handleSubmit = async (data: ProductLookupFormData) => {
        const db = getFirestoreDb();
        if (!user || !db) return;

        setIsSubmitting(true);

        const collectionRef = collection(db, 'users', user.uid, 'productLookups');

        const payload = {
            ...data,
            status: 'Active', // Default status
            description: '', // This would be populated based on the selected product
        };

        addDoc(collectionRef, payload)
          .then(() => {
            toast({ title: 'Success', description: 'Product lookup created.' });
            router.push('/inventory/product-lookup');
          })
          .catch((serverError) => {
              const permissionError = new FirestorePermissionError({
                  path: collectionRef.path,
                  operation: 'create',
                  requestResourceData: payload,
              });
              errorEmitter.emit('permission-error', permissionError);

              if (serverError.code !== 'permission-denied') {
                  toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: 'Failed to create product lookup.',
                  });
              }
          })
          .finally(() => {
            setIsSubmitting(false);
          });
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
                         <Link href="/inventory/product-lookup" className="hover:text-foreground">
                            Product lookups
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span>Create product lookup</span>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                            <Filter className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                             <p className="text-blue-600 dark:text-blue-400 font-semibold">Product lookups</p>
                             <h1 className="text-2xl font-bold">Create product lookup</h1>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="productLookup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product lookup</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input placeholder="-- Unspecified --" {...field} />
                                                </FormControl>
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="lotId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lot ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="packing"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Packing</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="stores"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stores</FormLabel>
                                             <div className="relative">
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create product lookup
                                </Button>
                            </form>
                        </Form>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
