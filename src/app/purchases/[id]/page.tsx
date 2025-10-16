import PurchaseOrderPageContent from './purchase-order-page-content';

export default function PurchaseOrderPage({ params }: { params: { id: string } }) {
    return (
        <PurchaseOrderPageContent orderId={params.id} />
    )
}