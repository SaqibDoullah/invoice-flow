'use client';

import Link from 'next/link';
import {
  Factory,
  History,
  Boxes,
  Search,
  ClipboardList,
  ArrowUpRightSquare,
  RefreshCw,
  Truck,
  ArrowUp,
} from 'lucide-react';
import Header from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AuthGuard from '@/components/auth/auth-guard';

const inventoryFeatures = [
  {
    title: 'Stock',
    description: 'View product stock levels.',
    icon: <Factory className="w-8 h-8 text-blue-500" />,
    href: '#',
    color: 'blue',
  },
  {
    title: 'Stock history',
    description: 'View stock and transaction history.',
    icon: <History className="w-8 h-8 text-blue-500" />,
    href: '#',
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
    icon: <Search className="w-8 h-8 text-blue-500" />,
    href: '#',
    color: 'blue',
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
    icon: <ArrowUp className="w-8 h-8 text-purple-500" />,
    href: '#',
    color: 'purple',
  },
  {
    title: 'Replenishment',
    description: 'Create a transfer order from calculations.',
    icon: <RefreshCw className="w-8 h-8 text-purple-500" />,
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
      <Card className={`h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${!isImplemented && 'opacity-60 cursor-not-allowed'}`}>
          <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/50`}>
                  {icon}
              </div>
              <div>
                  <CardTitle className={`text-lg font-semibold text-${color}-600 dark:text-${color}-400`}>{title}</CardTitle>
                  <CardDescription className="text-sm">{description}</CardDescription>
              </div>
          </CardHeader>
      </Card>
  );

  if (!isImplemented) {
      return <div title="Coming soon!">{content}</div>;
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Inventory</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FeatureCard {...inventoryFeatures[0]} />
                <FeatureCard {...inventoryFeatures[2]} />
                <FeatureCard {...inventoryFeatures[4]} />
                <FeatureCard {...inventoryFeatures[6]} />
              </div>
              <div className="space-y-6">
                 <FeatureCard {...inventoryFeatures[1]} />
                 <FeatureCard {...inventoryFeatures[3]} />
                 <FeatureCard {...inventoryFeatures[5]} />
                 <FeatureCard {...inventoryFeatures[7]} />
              </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
