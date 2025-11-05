
import AuthGuard from '@/components/auth/auth-guard';

export default function ProfitAndLossPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
                <p className="text-muted-foreground">This page will display the P&L report.</p>
            </div>
        </AuthGuard>
    )
}
