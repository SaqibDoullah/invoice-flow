
import AuthGuard from '@/components/auth/auth-guard';

export default function BalanceSheetPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Balance Sheet</h1>
                <p className="text-muted-foreground">This page will display the balance sheet report.</p>
            </div>
        </AuthGuard>
    )
}
