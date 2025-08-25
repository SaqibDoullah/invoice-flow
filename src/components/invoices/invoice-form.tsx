'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type InvoiceFormData, invoiceSchema, type Invoice } from '@/types';
import { Textarea } from '../ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

interface InvoiceFormProps {
  initialData?: Invoice;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
}

export default function InvoiceForm({ initialData, onSubmit }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? { 
          ...initialData,
          invoiceDate: initialData.invoiceDate.toDate(),
          dueDate: initialData.dueDate.toDate(),
          discount: initialData.discount || 0,
          discountType: initialData.discountType || 'percentage' 
        }
      : {
          customerName: '',
          customerEmail: '',
          status: 'draft',
          invoiceDate: new Date(),
          dueDate: addDays(new Date(), 30),
          items: [{ name: '', specification: '', price: 0, quantity: 1, lineTotal: 0 }],
          discount: 0,
          discountType: 'percentage',
          subtotal: 0,
          total: 0,
          ownerId: '',
          invoiceNumber: '',
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
  });
  const watchedDiscount = useWatch({
    control: form.control,
    name: 'discount',
  });
    const watchedDiscountType = useWatch({
    control: form.control,
    name: 'discountType',
  });

  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = price * quantity;
      if (form.getValues(`items.${watchedItems.indexOf(item)}.lineTotal`) !== lineTotal) {
        form.setValue(`items.${watchedItems.indexOf(item)}.lineTotal`, lineTotal);
      }
      return acc + lineTotal;
    }, 0);

    const discountAmount = watchedDiscountType === 'percentage' 
        ? subtotal * ((Number(watchedDiscount) || 0) / 100)
        : Number(watchedDiscount) || 0;
    
    const total = subtotal - discountAmount;

    if (form.getValues('subtotal') !== subtotal) {
      form.setValue('subtotal', subtotal);
    }
    if (form.getValues('total') !== total) {
      form.setValue('total', total);
    }
  }, [watchedItems, watchedDiscount, watchedDiscountType, form]);

  const processSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };
  
  if (authLoading) {
      return (
          <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{initialData ? `Edit Invoice ${initialData.invoiceNumber}` : 'New Invoice'}</h1>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Invoice'}
            </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="customerName"
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
                name="customerEmail"
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
               <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave blank for auto-generation" {...field} disabled={!!initialData}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="void">Void</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
               <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg relative">
                    <div className="col-span-12 md:col-span-3">
                         <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Web Design" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <FormField
                            control={form.control}
                            name={`items.${index}.specification`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Specification</FormLabel>
                                <FormControl><Textarea placeholder="e.g., 5 pages, responsive" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                        <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Qty</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                        <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <div className="col-span-4 md:col-span-1">
                        <FormLabel>Total</FormLabel>
                        <div className="font-medium h-10 flex items-center">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(watchedItems[index]?.lineTotal || 0)}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                       <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-2">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              ))}
            </div>
             <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', specification: '', price: 0, quantity: 1, lineTotal: 0 })}
                className="mt-4"
                >
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(form.getValues('subtotal'))}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount</span>
                     <div className="flex items-center w-48">
                        <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormControl><Input type="number" {...field} className="rounded-r-none" /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ToggleGroup 
                                            type="single"
                                            variant="outline"
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value as 'percentage' | 'fixed')}
                                            className="rounded-l-none"
                                            >
                                            <ToggleGroupItem value="percentage" className="rounded-l-none border-y border-l">
                                                %
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="fixed">
                                                $
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                 <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(form.getValues('total'))}
                    </span>
                </div>
            </div>
        </div>
      </form>
    </Form>
  );
}
