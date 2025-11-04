
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const CheckboxField = ({ id, label, description, checked = false, disabled = false }: { id: string, label: string, description: string, checked?: boolean, disabled?: boolean }) => (
    <div className="flex items-start space-x-3">
        <Checkbox id={id} checked={checked} disabled={disabled} className="mt-1" />
        <div className="grid gap-1.5 leading-none">
            <label
                htmlFor={id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
            </label>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const initialCategories = [
    "Vape Starter Kits",
    "Vape Tanks",
    "Vape Pods",
    "Vape Coils",
    "Vaporizers",
    "Vape Batteries",
    "Vaporizers Accessories",
    "Vape Mods",
    "Miscellaneous",
    "Vape Accessories",
    "Disposable Drop Ship",
    "Disposable",
];

export default function ProductSettings() {
    const [categories, setCategories] = useState(initialCategories);
    const [newCategory, setNewCategory] = useState('');

    const addCategory = () => {
        if (newCategory.trim()) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const removeCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 space-y-2">
                    <h3 className="text-lg font-semibold">Custom fields</h3>
                    <p className="text-sm text-muted-foreground">Enter names for custom fields on this list to add your own fields to each product. For example, Color or Fabric type.</p>
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Data type</TableHead>
                                    <TableHead>Options</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Template variable</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={5} className="py-2">
                                         <Button variant="link" className="p-0 h-auto text-sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add custom products field
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                     <p className="text-xs text-muted-foreground">Enter as many custom fields as required. Additional rows are automatically added.</p>
                </CardContent>
            </Card>

            <Card>
                 <CardContent className="p-6 space-y-2">
                    <h3 className="text-lg font-semibold">Product categories</h3>
                    <p className="text-sm text-muted-foreground">Products can be organized by category for sorting, grouping and filtering. Setup categories by adding names to this list (just type over or delete the sample category names). For example, enter Meat, Bread, and Dairy on different lines to organize food products into three categories.</p>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="legacy-categories" />
                        <label
                            htmlFor="legacy-categories"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Use legacy categories
                        </label>
                    </div>
                    <div className="border rounded-md mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-full">Option name</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {categories.map((category, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="py-1">
                                            <div className="flex items-center">
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move mr-2" />
                                                <Input defaultValue={category} className="border-none focus-visible:ring-0" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-1">
                                            <Button variant="ghost" size="icon" onClick={() => removeCategory(index)}>
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                 <TableRow>
                                    <TableCell colSpan={2} className="py-1">
                                         <Button variant="link" className="p-0 h-auto text-sm" onClick={addCategory}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            add product category option
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                     <p className="text-xs text-muted-foreground">Enter as many categories as required. Additional rows are automatically added.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-6 space-y-2">
                    <h3 className="text-lg font-semibold">Selling prices</h3>
                    <p className="text-sm text-muted-foreground">If you have multiple prices for your products, define the price levels here. For example, enter Wholesale, Retail and Preferred customer to setup three price lists. The product's detail screen will have one field for each price level.</p>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2">Name</TableHead>
                                    <TableHead className="w-1/2">Formula</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1,2,3,4].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                        <TableCell><Button variant="link" className="p-0 h-auto text-sm">add formula</Button></TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={2}>
                                        <Button variant="link" className="p-0 h-auto text-sm">
                                            <Plus className="mr-2 h-4 w-4" /> add product price level option
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                     <p className="text-xs text-muted-foreground">Enter as many price levels as required. Additional rows are automatically added.</p>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="update-prices" />
                        <label
                            htmlFor="update-prices"
                            className="text-sm font-medium leading-none"
                        >
                            Update prices on quantity change
                        </label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-2">
                    <h3 className="text-lg font-semibold">Stores</h3>
                    <p className="text-sm text-muted-foreground">
                        Use stores to track how products are listed for sale. For each store, you control the product lookup(s) used to identify your products in the store.
                        <br/>
                        The options base quantity, include supplier quantity, minimum quantity, and maximum quantity control the calculation used to determine the quantity listed for each product in the store. The options specified on this screen are default values used for all products in a store and can be changed for specific products on the product detail screen.
                    </p>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Base quantity</TableHead>
                                    <TableHead>Inc supplier qty</TableHead>
                                    <TableHead>Quantity perc</TableHead>
                                    <TableHead>Min qty</TableHead>
                                    <TableHead>Max qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                    <TableCell><Select><SelectTrigger /></Select></TableCell>
                                    <TableCell><Select><SelectTrigger /></Select></TableCell>
                                    <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                    <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                    <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-xs text-muted-foreground">Enter as many stores as required. Additional rows are automatically added.</p>
                </CardContent>
            </Card>


            <Card>
                <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold">Required fields</h3>
                    <div className="space-y-4">
                        <CheckboxField id="use-product-id" label="Use product ID field" description="(required for all products, up to 191 digits & letters, must be unique)" checked disabled />
                        <CheckboxField id="use-description" label="Use description field" description="(the product's name)" checked disabled />
                        <CheckboxField id="use-category" label="Use category field" description="(allows grouping products for easier searching and reporting)" checked disabled />
                        <CheckboxField id="use-notes" label="Use notes field" description="(multi-line text field with additional information on product)" checked disabled />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold">Optional fields</h3>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                        <CheckboxField id="use-std-accounting-cost" label="Use Std accounting cost field" description="(used to calculate the total cost of orders and stock on hand)" checked />
                        <CheckboxField id="use-weight" label="Use Weight field" checked />
                        <CheckboxField id="use-stock-valuation" label="Use stock valuation fields" description="(displays the valuation of stock for each product)" checked />
                        <CheckboxField id="use-hazardous" label="Use Hazardous material code field" />
                        <CheckboxField id="use-std-packing" label="Use Std packing field" description="(used to track full cases/pallets in addition to open stock units)" checked />
                        <CheckboxField id="use-upc" label="Use UPC field" checked />
                        <CheckboxField id="use-std-bin-id" label="Use Std bin ID field" description="(used as the expected bin/bay for the product)" checked />
                        <CheckboxField id="use-ean" label="Use EAN field" checked />
                        <CheckboxField id="use-accounting-fields" label="Use accounting fields" description="(used to override company wide default accounts for specific products)" />
                        <CheckboxField id="use-case-whd" label="Use Case width, height, and depth" />
                        <CheckboxField id="use-cbm" label="Use CBM per unit field" />
                        <CheckboxField id="use-manufacturer" label="Use Manufacturer field" checked />
                        <CheckboxField id="use-mfg-id" label="Use Mfg ID field" checked />
                        <CheckboxField id="use-amazon-asin" label="Use Amazon ASIN field" checked />
                        <CheckboxField id="use-code-128" label="Use Code 128 field" checked />
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                        <p className="text-sm text-muted-foreground">Packing allows stock to be tracked in cases in addition to units. If this is enabled, the "View stock" screen will show open stock and case stock separately.</p>
                        <CheckboxField id="use-packing" label="Use packing for tracking stock" checked />
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                        <p className="text-sm text-muted-foreground">Sales velocity is the rate at which a product has sold per time period. This number is expressed in units per day(s). Finale displays sales velocity and days until stock out (or just stockout) aggregated across all locations and for each sublocation.</p>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="sales-velocity-period">Sales velocity time period (days):</Label>
                            <Input id="sales-velocity-period" type="number" defaultValue={30} className="w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
