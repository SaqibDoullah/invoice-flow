
import AuthGuard from '@/components/auth/auth-guard';

export default function ChartOfAccountsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Chart of Accounts</h1>
                <p className="text-muted-foreground">This page will display the chart of accounts.</p>
            </div>
        </AuthGuard>
    )
}
