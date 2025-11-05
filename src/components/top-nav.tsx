
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import React from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { Button } from './ui/button';


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
    { 
        title: 'Stock Changes', 
        href: '/inventory/stock-changes', 
        description: 'Adjust stock levels for products.' 
    },
    { 
        title: 'Transfers', 
        href: '/inventory/transfers', 
        description: 'Manage stock transfers between locations.' 
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

const navConfig = [
    { name: 'analytics', links: analyticsLinks },
    { name: 'purchasing', links: purchasingLinks },
    { name: 'inventory', links: inventoryLinks },
    { name: 'selling', links: sellingLinks },
    { name: 'accounting', links: [] },
    { name: 'reports', href: '/reports' },
    { name: 'create', links: [] },
    { name: 'import', links: [] },
    { name: 'help', href: '#' },
];

type TopNavProps = {
    include?: string[];
}

export default function TopNav({ include }: TopNavProps) {
  const pathname = usePathname();
  
  const allNavItems = navConfig.map(item => {
    const key = item.name;

    if (key === 'create') {
        return (
             <NavigationMenuItem key={key}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "flex items-center gap-1")}>
                             Create <ChevronDown className="h-4 w-4" />
                         </NavigationMenuLink>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem asChild><Link href="/inventory/products/new">Product</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/inventory/product-lookup/new">Product lookup</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/suppliers">Supplier</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/purchases/new">Purchase order</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/customers">Customer</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/quotes/new">Quote</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/sales/new">Sales order</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/returns">Return</Link></DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild><Link href="/inventory/stock-takes/new">Stock take</Link></DropdownMenuItem>
                         <DropdownMenuItem asChild><Link href="/inventory/stock-changes/new">Stock change</Link></DropdownMenuItem>
                         <DropdownMenuItem asChild><Link href="/inventory/transfers/new">Transfer order</Link></DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild><Link href="/accounting/average-cost-changes/new">Average cost change</Link></DropdownMenuItem>
                         <DropdownMenuItem>Journal entry</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </NavigationMenuItem>
        )
    }

    if (key === 'import') {
         return (
             <NavigationMenuItem key={key}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "flex items-center gap-1")}>
                           Import <ChevronDown className="h-4 w-4" />
                         </NavigationMenuLink>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>Import screen</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Products</DropdownMenuItem>
                        <DropdownMenuItem>Product lookups</DropdownMenuItem>
                        <DropdownMenuItem>Product supplier fields</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Suppliers</DropdownMenuItem>
                        <DropdownMenuItem>Purchase orders</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Customers</DropdownMenuItem>
                        <DropdownMenuItem>Sales orders</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Stock take</DropdownMenuItem>
                        <DropdownMenuItem>Stock change</DropdownMenuItem>
                        <DropdownMenuItem>Transfer orders</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Average cost change</DropdownMenuItem>
                        <DropdownMenuItem>Journal entries</DropdownMenuItem>
                        <DropdownMenuItem>Sublocations</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </NavigationMenuItem>
         )
    }
    
    if (key === 'accounting') {
        return (
            <NavigationMenuItem key={key}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "flex items-center gap-1")}>
                            Accounting <ChevronDown className="h-4 w-4" />
                         </NavigationMenuLink>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem asChild><Link href="/accounting">Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/accounting/chart-of-accounts">Chart of Accounts</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/accounting/journal-entries">Journal Entries</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/accounting/general-ledger">General Ledger</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/accounting/trial-balance">Trial Balance</Link></DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Financial Reports</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/accounting/reports/p-and-l">Profit & Loss Statement</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/reports/balance-sheet">Balance Sheet</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/reports/cash-flow">Cash Flow Statement</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/tax-summary">Tax Summary</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/reports/inventory-valuation">Inventory Valuation</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Banking</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/accounting/banking/accounts">Bank Accounts</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/banking/reconciliation">Reconciliation</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/banking/feeds">Bank Feeds / Imports</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Accounts Receivable</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/invoices">Invoices</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/ar/credit-notes">Credit Notes</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/invoice-payments">Payments Received</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/ar/aging">AR Aging Report</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Accounts Payable</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem asChild><Link href="/bills">Bills</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/ap/vendor-credits">Vendor Credits</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/bill-payments">Payments Made</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/accounting/ap/aging">AP Aging Report</Link></DropdownMenuItem>
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/accounting/average-cost-changes">Average Cost Changes</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </NavigationMenuItem>
        )
    }

    if (item.links && item.links.length > 0) {
        return (
            <NavigationMenuItem key={key}>
                <NavigationMenuTrigger>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</NavigationMenuTrigger>
                <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {item.links.map((component) => (
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
        );
    }

    if (item.href) {
         return (
             <NavigationMenuItem key={key}>
                 <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
         );
    }
    
    return null;
  });

  if (include) {
      return (
          <>
            {allNavItems.filter(item => include.includes(item?.key as string))}
          </>
      )
  }

  return (
     <NavigationMenu>
        <NavigationMenuList>
            {allNavItems.filter(item => !['create', 'import', 'help'].includes(item?.key as string))}
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
