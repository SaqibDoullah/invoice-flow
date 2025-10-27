
'use client';

import AuthGuard from '@/components/auth/auth-guard';

interface SalesOrderPageContentProps {
    orderId: string;
}

export default function SalesOrderPageContent({ orderId }: SalesOrderPageContentProps) {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Sales Order: {orderId}</h1>
                <p>Details for this sales order will be displayed here.</p>
            </div>
        </AuthGuard>
    )
}
