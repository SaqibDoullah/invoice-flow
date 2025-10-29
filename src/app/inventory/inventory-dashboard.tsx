
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AuthGuard from '@/components/auth/auth-guard';

const inventoryFeatures = [
  {
    title: 'Stock',
    description: 'View product stock levels.',
    icon: <Factory className="w-8 h-8 text-blue-500" />,
    href: '/inventory/stock',
    color: 'blue',
  },
   {
    title: 'Stock history',
    description: 'View stock and transaction history.',
    icon: <History className="w-8 h-8 text-blue-500" />,
    href: '/inventory/stock-history',
    color: 'blue',
  },
  {
    title: 'Products',
    description: 'View all products.',
    icon: <Boxes className="w-8 h-8 text-blue-500" />,
    href: '/inventory/products',
    color: 'blue',
  },
  {
    title: 'Product lookups',
    description: 'View all product lookups & alias SKUs.',
    icon: <Search className="w-8 h-8 text-purple-500" />,
    href: '/inventory/product-lookup',
    color: 'purple',
  },
  {
    title: 'Stock takes',
    description: 'Enter physical count of stock.',
    icon: <ClipboardList className="w-8 h-8 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
    {
    title: 'Stock changes',
    description: 'Adjust the stock levels.',
    icon: <ArrowLeftRight className="w-8 h-8 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
  {
    title: 'Replenishment',
    description: 'Create a transfer order from calculations.',
    icon: <RefreshCcw className="w-8 h-8 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
  {
    title: 'Transfers',
    description: 'Move stock between locations.',
    icon: <Truck className="w-8 h-8 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
];

const FeatureCard = ({ title, description, icon, href, color }: (typeof inventoryFeatures)[0]) => {
  const isImplemented = href !== '#';

  const content = (
    <div className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-accent">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/50`}>
            {icon}
        </div>
        <div>
            <h3 className={`font-semibold text-blue-600`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );

  if (!isImplemented) {
      return <div title="Coming soon!" className="cursor-not-allowed opacity-70">{content}</div>;
  }

  return (
      <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
