
import DashboardLayout from '@/components/dashboard-layout';
import PurchaseOrderPageContent from './purchase-order-page-content';

export default function PurchaseOrderPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <PurchaseOrderPageContent orderId={params.id} />
        </DashboardLayout>
    )
}
