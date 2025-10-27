
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { FileText, Users, Boxes, Truck, BarChart2 } from 'lucide-react';

const analyticsFeatures = [
  { title: 'Overview', href: '/analytics', description: 'A high-level overview of business performance.' },
  { title: 'Sales orders', href: '/analytics?tab=sales', description: 'Analyze sales order trends and history.' },
  { title: 'Product sales', href: '#', description: 'Breakdown of sales by individual product.' },
  { title: 'Product stock', href: '#', description: 'Monitor current and historical stock levels.' },
];

const purchasingFeatures = [
  { title: 'Suppliers', href: '/suppliers', description: 'View all suppliers.' },
  { title: 'Purchase orders', href: '/purchases', description: 'View all purchase orders.' },
  { title: 'Bills', href: '/bills', description: 'View all bills.' },
  { title: 'Bill payments', href: '/bill-payments', description: 'View all bill payments.' },
  { title: 'Supplier credits', href: '#', description: 'View all supplier credits.' },
  { title: 'Reordering', href: '#', description: 'Create a purchase order from reorder quantities.' },
  { title: 'Reordering (legacy)', href: '#', description: 'Legacy reordering screen.' },
];

const sellingFeatures = [
    { title: 'Customers', href: '/customers', description: 'View and manage your customers.' },
    { title: 'Quotes', href: '#', description: 'Send quotes to potential customers.' },
    { title: 'Sales orders', href: '#', description: 'View all sales orders.' },
    { title: 'Invoices', href: '/invoices', description: 'Create and manage sales invoices.' },
    { title: 'Invoice payments', href: '#', description: 'View all invoice payments.' },
    { title: 'Returns', href: '#', description: 'View all returns.' },
];

const inventoryFeatures = [
    { title: 'Stock', href: '/inventory/stock', description: 'View product stock levels.' },
    { title: 'Products', href: '/inventory/products', description: 'View all products.' },
    { title: 'Product groups', href: '/inventory/product-groups', description: 'Manage groups of related products.' },
    { title: 'Product lookups', href: '/inventory/product-lookup', description: 'View all product lookups & alias SKUs.' },
    { title: 'Stock history', href: '/inventory/stock-history', description: 'View stock and transaction history.' },
    { title: 'Stock takes', href: '#', description: 'Enter physical count of stock.' },
    { title: 'Stock changes', href: '#', description: 'Adjust the stock levels.' },
    { title: 'Stock transfers', href: '#', description: 'Move stock between locations.' },
    { title: 'Replenishment', href: '#', description: 'Create a transfer order from calculations.' },
];

const accountingFeatures = [
    { title: 'Average cost changes', href: '#', description: "Update product's average cost." },
    { title: 'Journal entries', href: '#', description: 'View all journal entries.' },
    { title: 'Consolidations', href: '#', description: 'View all consolidations.' },
    { title: 'General ledger', href: '#', description: 'View all financial transactions.' },
    { title: 'QuickBooks Online sync status', href: '#', description: "View transactions' sync status." },
];

const reportsFeatures = [
    { title: 'Stock', href: '#', description: 'Reports on stock levels and valuation.' },
    { title: 'Purchase and sales', href: '/reports', description: 'Analyze purchases and sales performance.' },
    { title: 'Master data', href: '#', description: 'Reports on master data records.' },
    { title: 'Accounting', href: '#', description: 'Financial statements and accounting reports.' },
    { title: 'Documents', href: '#', description: 'View and export various documents.' },
    { title: 'Labels', href: '#', description: 'Generate and print labels.' },
    { title: 'Amazon FBA', href: '#', description: 'Reports related to Amazon FBA.' },
];

const barcodingFeatures = [
    { title: 'Android scanner app', href: '#', description: 'Use your Android device to scan barcodes.' },
    { title: 'Print barcode labels', href: '#', description: 'Generate and print barcode labels for your products.' },
];


const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default function TopNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
          <NavigationMenuContent>
             <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
                {analyticsFeatures.map((component) => (
                    <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                    className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                    >
                    {component.description}
                    </ListItem>
                ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Purchasing</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
              {purchasingFeatures.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Inventory</NavigationMenuTrigger>
           <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
              {inventoryFeatures.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Accounting</NavigationMenuTrigger>
           <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
              {accountingFeatures.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Selling</NavigationMenuTrigger>
           <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
              {sellingFeatures.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Reports</NavigationMenuTrigger>
           <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
              {reportsFeatures.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg_accent' : ''}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Barcoding</NavigationMenuTrigger>
           <NavigationMenuContent>
             <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1 lg:w-[600px] ">
                {barcodingFeatures.map((component) => (
                    <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                    className={pathname.startsWith(component.href) && component.href !== '#' ? 'bg-accent' : ''}
                    >
                    {component.description}
                    </ListItem>
                ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Integrations</NavigationMenuTrigger>
          <NavigationMenuContent>
             <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                <ListItem href="#" title="Integrations coming soon">
                    Connect with your favorite apps.
                </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  );
}

    