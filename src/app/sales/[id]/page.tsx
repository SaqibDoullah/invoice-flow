
'use client';
import SalesOrderPageContent from './sales-order-page-content';

export default function SalesOrderPage({ params }: { params: { id: string } }) {
    // This component remains simple, passing the ID to the client component
    // which will now handle its own Suspense boundary for search params.
    return (
        <SalesOrderPageContent orderId={params.id} />
    )
}
