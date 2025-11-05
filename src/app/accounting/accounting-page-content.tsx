
'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, BookCopy, Library, FileText, Banknote } from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardContent } from '@/components/ui/card';

const accountingFeatures = [
    { 
        title: 'Average cost changes', 
        description: "Update product's average cost.", 
        icon: <Calculator />, 
        href: '/accounting/average-cost-changes', 
        color: 'teal' 
    },
    { 
        title: 'Journal entries', 
        description: 'View all journal entries.', 
        icon: <BookCopy />, 
        href: '/accounting/journal-entries', 
        color: 'teal' 
    },
    { 
        title: 'Consolidations', 
        description: 'View all consolidations.', 
        icon: <Library />, 
        href: '/accounting/consolidations', 
        color: 'teal' 
    },
    { 
        title: 'General ledger', 
        description: 'View all financial transactions.', 
        icon: <BookCopy />, 
        href: '/accounting/general-ledger', 
        color: 'teal' 
    },
    {
        title: 'Banking & reconciliation',
        description: 'Import, match, and reconcile bank transactions.',
        icon: <Banknote />,
        href: '#',
        color: 'teal'
    },
    {
        title: 'Tax summary',
        description: 'Collected vs payable taxes.',
        icon: <FileText />,
        href: '#',
        color: 'teal'
    }
];

const colorVariants = {
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/50', icon: 'text-teal-500' },
};

const FeatureCard = ({ title, description, icon, href, color }: { title: string, description: string, icon: React.ReactNode, href: string, color: keyof typeof colorVariants }) => {
  const isImplemented = href !== '#';
  const colors = colorVariants[color];

  const cardContent = (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 h-full ${isImplemented ? 'hover:bg-accent' : 'cursor-not-allowed opacity-60'}`}>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
            {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colors.icon}` })}
        </div>
        <div>
            <h3 className={`font-semibold text-blue-600`}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );

  if (!isImplemented) {
    return <div title="Coming soon!" className="h-full"><Card className="h-full">{cardContent}</Card></div>;
  }

  return <Link href={href} className="h-full"><Card className="h-full">{cardContent}</Card></Link>;
};

export default function AccountingPageContent() {
    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8">Accounting</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accountingFeatures.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </main>
        </AuthGuard>
    );
}
