
import AuthGuard from '@/components/auth/auth-guard';
import BankFeedsPageContent from './bank-feeds-page-content';

export default function BankFeedsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <BankFeedsPageContent />
            </div>
        </AuthGuard>
    )
}
