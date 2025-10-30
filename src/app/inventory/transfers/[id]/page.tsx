
'use client';
import TransferOrderPageContent from './transfer-order-page-content';

export default function TransferOrderPage({ params }: { params: { id: string } }) {
    return (
        <TransferOrderPageContent orderId={params.id} />
    )
}
