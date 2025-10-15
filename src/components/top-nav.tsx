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
  { title: 'Overview', href: '#', description: 'A high-level overview of business performance.' },
  { title: 'Sales orders', href: '#', description: 'Analyze sales order trends and history.' },
  { title: 'Product sales', href: '#', description: 'Breakdown of sales by individual product.' },
  { title: 'Product stock', href: '#', description: 'Monitor current and historical stock levels.' },
];

const purchasingFeatures = [
  { title: 'Suppliers', href: '/suppliers', description: 'View all suppliers.' },
  { title: 'Purchase orders', href: '#', description: 'View all purchase orders.' },
  { title: 'Bills', href: '#', description: 'View all bills.' },
  { title: 'Bill payments', href: '#', description: 'View all bill payments.' },
  { title: 'Supplier credits', href: '#', description: 'View all supplier credits.' },
  { title: 'Reordering', href: '#', description: 'Create a purchase order from reorder quantities.' },
  { title: 'Reordering (legacy)', href: '#', description: 'Legacy reordering screen.' },
];

const sellingFeatures = [
    { title: 'Customers', href: '/customers', description: 'View and manage your customers.' },
    { title: 'Invoices', href: '/invoices', description: 'Create and manage sales invoices.' },
    { title: 'Quotes', href: '#', description: 'Send quotes to potential customers.' },
];

const inventoryFeatures = [
    { title: 'Products', href: '/inventory/products', description: 'Manage your product catalog.' },
    { title: 'Inventory Dashboard', href: '/inventory', description: 'Get an overview of your stock.' },
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
          <Link href="/reports" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), pathname.startsWith('/reports') ? 'bg-accent' : '')}>
                Reports
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Barcoding</NavigationMenuTrigger>
           <NavigationMenuContent>
             <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                <ListItem href="#" title="Barcoding coming soon">
                    Streamline your inventory management with barcode scanning.
                </ListItem>
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
