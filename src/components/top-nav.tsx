
'use client';

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
} from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils';
import React from 'react';


const analyticsLinks: { title: string; href: string; description: string }[] = [
    {
        title: "Overview",
        href: "/analytics?tab=overview",
        description: "Get a high-level overview of your sales performance.",
    },
    {
        title: "Sales",
        href: "/analytics?tab=sales",
        description: "Dive deep into your sales data and trends.",
    },
     {
        title: "Purchases",
        href: "/analytics?tab=purchases",
        description: "Analyze your purchase orders and supplier performance.",
    },
    {
        title: "Product sales",
        href: "/analytics?tab=product-sales",
        description: "Analyze the performance of individual products.",
    },
    {
        title: "Product stock",
        href: "/analytics?tab=product-stock",
        description: "Review your current stock levels and history.",
    },
];

const purchasingLinks: { title: string; href: string; description: string }[] = [
    {
        title: "Suppliers",
        href: "/suppliers",
        description: "View and manage your suppliers.",
    },
    {
        title: "Purchases",
        href: "/purchases",
        description: "Create and track purchase orders.",
    },
    {
        title: "Bills",
        href: "/bills",
        description: "Manage incoming bills from suppliers.",
    },
    {
        title: "Bill Payments",
        href: "/bill-payments",
        description: "Record and track payments made for bills.",
    },
];

const inventoryLinks: { title: string; href: string; description: string }[] = [
    {
        title: "Stock",
        href: "/inventory/stock",
        description: "View current product stock levels.",
    },
    {
        title: "Products",
        href: "/inventory/products",
        description: "Manage your product catalog.",
    },
    {
        title: "Product Groups",
        href: "/inventory/product-groups",
        description: "Group items by attributes.",
    },
    {
        title: "Stock History",
        href: "/inventory/stock-history",
        description: "Track all stock movements and adjustments.",
    },
     {
        title: "Product Lookups",
        href: "/inventory/product-lookup",
        description: "Manage alias SKUs and lookups.",
    },
     {
        title: "Reordering Summary",
        href: "/inventory/reordering-summary",
        description: "View what needs to be reordered.",
    },
    {
        title: "Stock takes",
        href: "/inventory/stock-takes",
        description: "Enter physical count of stock.",
    },
    {
        title: 'Replenishment',
        href: '/inventory/replenishment',
        description: 'Create a transfer order from replenishment calculations.',
    },
];

const sellingLinks: { title: string; href: string; description: string }[] = [
    {
        title: "Customers",
        href: "/customers",
        description: "View and manage your customer list.",
    },
    {
        title: "Quotes",
        href: "/quotes",
        description: "Send quotes to potential customers.",
    },
    {
        title: "Sales",
        href: "/sales",
        description: "Create and manage sales orders.",
    },
    {
        title: "Invoices",
        href: "/invoices",
        description: "Create, send, and track invoices.",
    },
    {
        title: "Invoice Payments",
        href: "/invoice-payments",
        description: "Record and track customer payments.",
    },
    {
        title: "Returns",
        href: "/returns",
        description: "Manage customer returns.",
    }
];

const accountingLinks: { title: string; href: string; description: string }[] = [
    // Add links when accounting pages are created
];


export default function TopNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
        <NavigationMenuList>
             <NavigationMenuItem>
                <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
                <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {analyticsLinks.map((component) => (
                    <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
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
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {purchasingLinks.map((component) => (
                    <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
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
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {inventoryLinks.map((component) => (
                    <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
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
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {sellingLinks.map((component) => (
                    <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                    >
                        {component.description}
                    </ListItem>
                    ))}
                </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
                 <Link href="/reports" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Reports
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>

        </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
  )
})
ListItem.displayName = "ListItem"
