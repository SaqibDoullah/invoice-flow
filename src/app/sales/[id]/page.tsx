
'use client';
import SalesOrderPageContent from './sales-order-page-content';

export default function SalesOrderPage({ params }: { params: { id: string } }) {
    return (
        <SalesOrderPageContent orderId={params.id} />
    )
}
