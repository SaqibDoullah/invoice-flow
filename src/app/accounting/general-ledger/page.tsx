
import GeneralLedgerPageContent from './general-ledger-page-content';

export default function GeneralLedgerPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <GeneralLedgerPageContent />
            </div>
        </AuthGuard>
    )
}
import AuthGuard from '@/components/auth/auth-guard';
