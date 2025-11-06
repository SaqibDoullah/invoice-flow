
import AuthGuard from '@/components/auth/auth-guard';
import ReconciliationPageContent from './reconciliation-page-content';

export default function ReconciliationPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <ReconciliationPageContent />
            </div>
        </AuthGuard>
    )
}
