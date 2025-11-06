
import AuthGuard from '@/components/auth/auth-guard';
import BankAccountsPageContent from './bank-accounts-page-content';

export default function BankAccountsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-4 md:p-8">
                <BankAccountsPageContent />
            </div>
        </AuthGuard>
    )
}
