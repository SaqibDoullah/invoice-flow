
'use client';

import Link from 'next/link';
import {
  Factory,
  History,
  Boxes,
  Search,
  ClipboardList,
  ArrowLeftRight,
  RefreshCcw,
  Truck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AuthGuard from '@/components/auth/auth-guard';
import { cn } from '@/lib/utils';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: keyof typeof colorVariants;
};

const inventoryFeatures: Feature[] = [
  {
    title: 'Stock',
    description: 'View product stock levels.',
    icon: <Factory className="w-6 h-6 text-blue-500" />,
    href: '/inventory/stock',
    color: 'blue',
  },
   {
    title: 'Stock history',
    description: 'View stock and transaction history.',
    icon: <History className="w-6 h-6 text-blue-500" />,
    href: '/inventory/stock-history',
    color: 'blue',
  },
  {
    title: 'Products',
    description: 'View all products.',
    icon: <Boxes className="w-6 h-6 text-blue-500" />,
    href: '/inventory/products',
    color: 'blue',
  },
  {
    title: 'Product lookups',
    description: 'View all product lookups & alias SKUs.',
    icon: <Search className="w-6 h-6 text-blue-500" />,
    href: '/inventory/product-lookup',
    color: 'blue',
  },
  {
    title: 'Stock takes',
    description: 'Enter physical count of stock.',
    icon: <ClipboardList className="w-6 h-6 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
    {
    title: 'Stock changes',
    description: 'Adjust the stock levels.',
    icon: <ArrowLeftRight className="w-6 h-6 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
  {
    title: 'Replenishment',
    description: 'Create a transfer order from calculations.',
    icon: <RefreshCcw className="w-6 h-6 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
  {
    title: 'Transfers',
    description: 'Move stock between locations.',
    icon: <Truck className="w-6 h-6 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
];

const colorVariants = {
    blue: "bg-blue-100 dark:bg-blue-900/50",
    purple: "bg-purple-100 dark:bg-purple-900/50"
}

const FeatureCard = ({ title, description, icon, href, color }: Feature) => {
  const isImplemented = href !== '#';

  const content = (
      <div className="flex items-start gap-4">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", colorVariants[color])}>
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-blue-600">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
  );

  if (!isImplemented) {
      return (
        <div title="Coming soon!" className="h-20 cursor-not-allowed rounded-lg p-2 opacity-70 transition-colors duration-200 hover:bg-accent">
            {content}
        </div>
      );
  }

  return (
      <Link 
        href={href} 
        className="block h-20 rounded-lg p-2 transition-colors duration-200 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {content}
      </Link>
  );
};


export default function InventoryDashboard() {
  return (
    <AuthGuard>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Inventory</h1>
          
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {inventoryFeatures.map((feature) => (
                      <FeatureCard key={feature.title} {...feature} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
