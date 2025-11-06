
import ProfitAndLossPageContent from './profit-and-loss-page-content';
import AuthGuard from '@/components/auth/auth-guard';

export default function ProfitAndLossPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <ProfitAndLossPageContent />
            </div>
        </AuthGuard>
    )
}
