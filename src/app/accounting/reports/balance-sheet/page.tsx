
import BalanceSheetPageContent from './balance-sheet-page-content';
import AuthGuard from '@/components/auth/auth-guard';

export default function BalanceSheetPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <BalanceSheetPageContent />
            </div>
        </AuthGuard>
    )
}
