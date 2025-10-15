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
  ArrowUp,
  MessageSquareQuote,
  DollarSign,
  ArrowLeftRight,
  Undo2,
  Calculator,
  BookCopy,
  Library,
  BookCheck,
  RefreshCcw,
} from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const purchasingFeatures = [
  { title: 'Suppliers', description: 'View all suppliers.', icon: <Users className="w-6 h-6" />, href: '/suppliers', color: 'red' },
  { title: 'Purchases', description: 'View all purchase orders.', icon: <ShoppingCart className="w-6 h-6" />, href: '#', color: 'red' },
  { title: 'Bills', description: 'View all bills.', icon: <Receipt className="w-6 h-6" />, href: '#', color: 'red' },
  { title: 'Bill payments', description: 'View all bill payments.', icon: <CreditCard className="w-6 h-6" />, href: '#', color: 'orange' },
  { title: 'Reorder', description: 'Create a purchase order from reorder quantities.', icon: <RefreshCw className="w-6 h-6" />, href: '#', color: 'orange' },
  { title: 'Reorder (legacy)', description: 'Legacy reordering screen.', icon: <RefreshCw className="w-6 h-6" />, href: '#', color: 'orange' },
];

const inventoryFeatures = [
  { title: 'Stock', description: 'View product stock levels.', icon: <Factory className="w-6 h-6" />, href: '#', color: 'blue' },
  { title: 'Stock history', description: 'View stock and transaction history.', icon: <History className="w-6 h-6" />, href: '#', color: 'blue' },
  { title: 'Products', description: 'View all products.', icon: <Boxes className="w-6 h-6" />, href: '/inventory/products', color: 'blue' },
  { title: 'Product lookups', description: 'View all product lookups & alias SKUs.', icon: <Search className="w-6 h-6" />, href: '#', color: 'blue' },
  { title: 'Stock takes', description: 'Enter physical count of stock.', icon: <ClipboardList className="w-6 h-6" />, href: '#', color: 'purple' },
  { title: 'Stock changes', description: 'Adjust the stock levels.', icon: <ArrowUp className="w-6 h-6" />, href: '#', color: 'purple' },
  { title: 'Replenishment', description: 'Create a transfer order from replenishment calculations.', icon: <RefreshCcw className="w-6 h-6" />, href: '#', color: 'purple' },
  { title: 'Transfers', description: 'Move stock between locations.', icon: <ArrowLeftRight className="w-6 h-6" />, href: '#', color: 'purple' },
];

const sellingFeatures = [
  { title: 'Customers', description: 'View all customers.', icon: <Users className="w-6 h-6" />, href: '/customers', color: 'green' },
  { title: 'Quotes', description: 'View all sales quotes.', icon: <MessageSquareQuote className="w-6 h-6" />, href: '#', color: 'green' },
  { title: 'Sales', description: 'View all sales orders.', icon: <DollarSign className="w-6 h-6" />, href: '#', color: 'green' },
  { title: 'Invoices', description: 'View all invoices.', icon: <FileText className="w-6 h-6" />, href: '/invoices', color: 'green' },
  { title: 'Invoice payments', description: 'View all invoice payments.', icon: <CreditCard className="w-6 h-6" />, href: '#', color: 'green' },
  { title: 'Returns', description: 'View all returns.', icon: <Undo2 className="w-6 h-6" />, href: '#', color: 'green' },
];

const accountingFeatures = [
    { title: 'Average cost changes', description: 'Update product\'s average cost.', icon: <Calculator className="w-6 h-6" />, href: '#', color: 'teal' },
    { title: 'Journal entries', description: 'View all journal entries.', icon: <BookCopy className="w-6 h-6" />, href: '#', color: 'teal' },
    { title: 'Consolidations', description: 'View all consolidations.', icon: <Library className="w-6 h-6" />, href: '#', color: 'teal' },
    { title: 'General ledger', description: 'View all financial transactions.', icon: <BookCopy className="w-6 h-6" />, href: '#', color: 'teal' },
    { title: 'QuickBooks Online sync status', description: 'View transactions\' sync status.', icon: <RefreshCcw className="w-6 h-6" />, href: '#', color: 'teal' },
];

const colorVariants = {
  red: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/50', text: 'text-teal-600 dark:text-teal-400', icon: 'text-teal-500' },
};

const FeatureCard = ({ title, description, icon, href, color }: { title: string, description: string, icon: React.ReactNode, href: string, color: keyof typeof colorVariants }) => {
  const isImplemented = href !== '#';
  const colors = colorVariants[color];

  const cardContent = (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${isImplemented ? 'hover:bg-accent/50' : 'cursor-not-allowed opacity-60'}`}>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
            {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colors.icon}` })}
        </div>
        <div>
            <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );

  if (!isImplemented) {
    return <div title="Coming soon!">{cardContent}</div>;
  }

  return <Link href={href}>{cardContent}</Link>;
};

const FeatureSection = ({ title, features }: { title: string, features: Array<(typeof purchasingFeatures)[0]> }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </CardContent>
  </Card>
);

export default function DashboardPageContent() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
              <FeatureSection title="Purchasing" features={purchasingFeatures} />
              <FeatureSection title="Inventory" features={inventoryFeatures} />
              <FeatureSection title="Selling" features={sellingFeatures} />
              <FeatureSection title="Accounting" features={accountingFeatures} />
            </div>
        </main>
      </div>
    </AuthGuard>
  );
}
