
'use client';

import * as React from 'react';
import {
  Users,
  FileText,
  Truck,
  ShoppingCart,
  Receipt,
  CreditCard,
  RefreshCw,
  Boxes,
  Factory,
  History,
  Search,
  ClipboardList,
  ArrowLeftRight,
  RefreshCcw,
  MessageSquareQuote,
  DollarSign,
  Undo2,
  Calculator,
} from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const purchasingFeatures = [
  { title: 'Suppliers', description: 'View all suppliers.', icon: <Users />, href: '/suppliers', color: 'red' },
  { title: 'Purchases', description: 'View all purchase orders.', icon: <ShoppingCart />, href: '/purchases', color: 'orange' },
  { title: 'Bills', description: 'View all bills.', icon: <Receipt />, href: '/bills', color: 'orange' },
  { title: 'Bill payments', description: 'View all bill payments.', icon: <CreditCard />, href: '/bill-payments', color: 'orange' },
  { title: 'Reorder', description: 'Create a purchase order from reorder quantities.', icon: <RefreshCw />, href: '/purchases/reorder', color: 'yellow' },
  { title: 'Reorder (legacy)', description: 'Legacy reordering screen.', icon: <RefreshCw />, href: '/purchases/reorder/reorder-legacy', color: 'yellow' },
];

const inventoryFeatures = [
  { title: 'Stock', description: 'View product stock levels.', icon: <Factory />, href: '/inventory/stock', color: 'blue' },
  { title: 'Products', description: 'View all products.', icon: <Boxes />, href: '/inventory/products', color: 'blue' },
  { title: 'Stock takes', description: 'Enter physical count of stock.', icon: <ClipboardList />, href: '/inventory/stock-takes', color: 'purple' },
  { title: 'Replenishment', description: 'Create a transfer order from replenishment calculations.', icon: <RefreshCcw />, href: '/inventory/replenishment', color: 'purple' },
];

const inventoryFeaturesCol2 = [
    { title: 'Stock history', description: 'View stock and transaction history.', icon: <History />, href: '/inventory/stock-history', color: 'blue' },
    { title: 'Product lookups', description: 'View all product lookups & alias SKUs.', icon: <Search />, href: '/inventory/product-lookup', color: 'blue' },
    { title: 'Stock changes', description: 'Adjust the stock levels.', icon: <ArrowLeftRight />, href: '/inventory/stock-changes', color: 'purple' },
    { title: 'Transfers', description: 'Move stock between locations.', icon: <Truck />, href: '/inventory/transfers', color: 'purple' },
]

const sellingFeatures = [
  { title: 'Customers', description: 'View all customers.', icon: <Users />, href: '/customers', color: 'green' },
  { title: 'Quotes', description: 'Send quotes to potential customers.', icon: <MessageSquareQuote />, href: '/quotes', color: 'green' },
  { title: 'Sales', description: 'View all sales orders.', icon: <DollarSign />, href: '/sales', color: 'green' },
  { title: 'Invoices', description: 'View all invoices.', icon: <FileText />, href: '/invoices', color: 'green' },
  { title: 'Invoice payments', description: 'View all invoice payments.', icon: <CreditCard />, href: '/invoice-payments', color: 'green' },
  { title: 'Returns', description: 'View all returns.', icon: <Undo2 />, href: '/returns', color: 'green' },
];

const accountingFeatures = [
    { title: 'Accounting', description: "Manage GL, AR/AP, banking, and financial reports.", icon: <Calculator />, href: '/accounting', color: 'teal' },
];

const colorVariants = {
  red: { bg: 'bg-red-500', text: 'text-red-500', icon: 'text-white' },
  orange: { bg: 'bg-orange-400', text: 'text-orange-400', icon: 'text-white' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-400', icon: 'text-white' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', icon: 'text-white' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', icon: 'text-white' },
  green: { bg: 'bg-green-500', text: 'text-green-500', icon: 'text-white' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-500', icon: 'text-white' },
};

const FeatureCard = ({ title, description, icon, href, color = "teal" }): { title: string, description: string, icon: React.ReactNode, href: string, color?: string }) => {
  const isImplemented = href !== '#';
  const colors = colorVariants[color];

  const cardContent = (
    <div className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${isImplemented ? 'hover:bg-accent' : 'cursor-not-allowed opacity-60'}`}>
        <div className={`p-2 rounded-md ${colors.bg}`}>
            {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colors.icon}` })}
        </div>
        <div>
            <h3 className={`font-semibold text-blue-600`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );

  if (!isImplemented) {
    return <div title="Coming soon!">{cardContent}</div>;
  }

  return <Link href={href}>{cardContent}</Link>;
};


export default function DashboardPageContent() {
  return (
    <AuthGuard>
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              <div className="space-y-8 lg:col-span-1">
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Purchasing</h2>
                     <Card>
                        <CardContent className="p-2 flex flex-col gap-1">
                            {purchasingFeatures.map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </CardContent>
                     </Card>
                 </div>
              </div>

              <div className="space-y-8 lg:col-span-2">
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Inventory</h2>
                    <Card>
                        <CardContent className="p-2 grid grid-cols-2 gap-1">
                            <div className="flex flex-col gap-1">
                                {inventoryFeatures.map((feature) => (
                                    <FeatureCard key={feature.title} {...feature} />
                                ))}
                            </div>
                             <div className="flex flex-col gap-1">
                                {inventoryFeaturesCol2.map((feature) => (
                                    <FeatureCard key={feature.title} {...feature} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Accounting</h2>
                     <Card>
                        <CardContent className="p-2 flex flex-col gap-1">
                            {accountingFeatures.map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </CardContent>
                    </Card>
                 </div>
              </div>

              <div className="space-y-8 lg:col-span-1">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Selling</h2>
                    <Card>
                        <CardContent className="p-2 flex flex-col gap-1">
                            {sellingFeatures.map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
              </div>

            </div>
        </main>
    </AuthGuard>
  );
}
