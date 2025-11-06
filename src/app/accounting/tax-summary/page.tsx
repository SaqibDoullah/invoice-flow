
import AuthGuard from '@/components/auth/auth-guard';
import TaxSummaryPageContent from './tax-summary-page-content';

export default function TaxSummaryPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <TaxSummaryPageContent />
            </div>
        </AuthGuard>
    )
}
