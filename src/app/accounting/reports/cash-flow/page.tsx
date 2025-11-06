
import CashFlowStatementPageContent from './cash-flow-statement-page-content';
import AuthGuard from '@/components/auth/auth-guard';

export default function CashFlowPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <CashFlowStatementPageContent />
            </div>
        </AuthGuard>
    )
}
