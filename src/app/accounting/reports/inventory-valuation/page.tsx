
import InventoryValuationPageContent from './inventory-valuation-page-content';
import AuthGuard from '@/components/auth/auth-guard';

export default function InventoryValuationPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <InventoryValuationPageContent />
            </div>
        </AuthGuard>
    )
}
