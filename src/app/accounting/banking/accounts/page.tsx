
import AuthGuard from '@/components/auth/auth-guard';

export default function BankAccountsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Bank Accounts</h1>
                <p className="text-muted-foreground">This page will display bank accounts.</p>
            </div>
        </AuthGuard>
    )
}
