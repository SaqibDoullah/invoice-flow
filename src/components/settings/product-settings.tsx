
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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


export default function ProductSettings() {
    return (
        <div className="space-y-8">
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
