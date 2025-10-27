
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, Plus, Image as ImageIcon, ArrowLeft } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productGroupSchema, type ProductGroupFormData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';


export default function NewItemGroupPageContent() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductGroupFormData>({
        resolver: zodResolver(productGroupSchema),
        defaultValues: {
            type: 'Goods',
            name: '',
            description: '',
            isReturnable: true,
            createAttributes: true,
            attributes: [{ attribute: '', options: '' }],
            itemType: ['Sellable', 'Purchasable', 'Track Inventory'],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "attributes",
    });
    
    const createAttributes = form.watch('createAttributes');

    const handleSubmit = async (data: ProductGroupFormData) => {
        setIsSubmitting(true);
        console.log(data);
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
    };

    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                <div className="mb-6">
                    <Button variant="outline" asChild>
                        <Link href="/inventory/product-groups">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Product Groups
                        </Link>
                    </Button>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">New Item Group</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <Card>
                             <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-6">
                                                    <FormLabel className="w-32">Type</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl><RadioGroupItem value="Goods" /></FormControl>
                                                                <FormLabel className="font-normal">Goods</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl><RadioGroupItem value="Service" /></FormControl>
                                                                <FormLabel className="font-normal">Service</FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="flex items-start">
                                                    <FormLabel className="w-32 mt-2">Item Group Name*</FormLabel>
                                                    <div className="flex-1">
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem className="flex items-start">
                                                    <FormLabel className="w-32 mt-2">Description</FormLabel>
                                                    <FormControl><Textarea className="flex-1" rows={3} {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center pl-36">
                                            <FormField
                                                control={form.control}
                                                name="isReturnable"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Returnable Item</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <FormLabel className="w-32">Unit*</FormLabel>
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <Select><SelectTrigger><SelectValue placeholder="Select or type to add"/></SelectTrigger><SelectContent></SelectContent></Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <FormLabel className="w-32">Manufacturer</FormLabel>
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <Select><SelectTrigger><SelectValue placeholder="Select or Add Manufacturer"/></SelectTrigger><SelectContent></SelectContent></Select>
                                                <div className="flex items-center">
                                                    <FormLabel className="pr-4">Brand</FormLabel>
                                                    <Select><SelectTrigger><SelectValue placeholder="Select or Add Brand"/></SelectTrigger><SelectContent></SelectContent></Select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <FormLabel className="w-32">Inventory Valuation Method</FormLabel>
                                            <Select defaultValue="FIFO"><SelectTrigger className="w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FIFO">FIFO (First In First Out)</SelectItem></SelectContent></Select>
                                        </div>

                                        <div className="pl-36 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="createAttributes"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Create Attributes and Options</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                            {createAttributes && (
                                                <div className="space-y-4">
                                                    {fields.map((item, index) => (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`attributes.${index}.attribute`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        {index === 0 && <FormLabel>Attribute*</FormLabel>}
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl><SelectTrigger><SelectValue placeholder="e.g: color" /></SelectTrigger></FormControl>
                                                                            <SelectContent><SelectItem value="color">Color</SelectItem><SelectItem value="size">Size</SelectItem></SelectContent>
                                                                        </Select>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`attributes.${index}.options`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        {index === 0 && <FormLabel>Options*</FormLabel>}
                                                                        <div className="flex items-center gap-2">
                                                                            <FormControl><Input placeholder="" {...field} /></FormControl>
                                                                            <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="link" size="sm" onClick={() => append({ attribute: '', options: '' })}><Plus className="mr-2"/>Add more attributes</Button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                    <div className="md:col-span-1">
                                        <div className="p-4 border-2 border-dashed rounded-lg text-center h-56 flex flex-col justify-center items-center">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                                            <p className="text-sm">Drag image(s) here or <Button variant="link" className="p-0 h-auto">Browse images</Button></p>
                                            <p className="text-xs text-muted-foreground mt-2">You can add up to 15 images, each not exceeding 5 MB in size and 7000 X 7000 pixels resolution.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">Select your Item Type:</h3>
                                <FormField
                                    control={form.control}
                                    name="itemType"
                                    render={() => (
                                        <FormItem className="flex items-center gap-6 mt-2">
                                            {['Sellable', 'Purchasable', 'Track Inventory'].map((item) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name="itemType"
                                                render={({ field }) => {
                                                return (
                                                    <FormItem key={item} className="flex items-center gap-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...(field.value || []), item])
                                                                    : field.onChange(field.value?.filter((value) => value !== item))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{item}</FormLabel>
                                                    </FormItem>
                                                )
                                                }}
                                            />
                                            ))}
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-muted-foreground font-semibold">
                                                <th className="p-2">ITEM NAME*</th>
                                                <th className="p-2">SKU</th>
                                                <th className="p-2">COST PRICE ($)*</th>
                                                <th className="p-2">SELLING PRICE ($)*</th>
                                                <th className="p-2">UPC</th>
                                                <th className="p-2">EAN</th>
                                                <th className="p-2">ISBN</th>
                                                <th className="p-2">REORDER POINT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Dynamic rows for items would go here */}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>


                        <div className="flex justify-start gap-4 pt-6 border-t">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                            <Button type="button" variant="outline" asChild>
                               <Link href="/inventory/product-groups">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </AuthGuard>
    );
}
