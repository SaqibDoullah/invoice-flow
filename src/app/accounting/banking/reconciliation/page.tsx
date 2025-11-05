
import AuthGuard from '@/components/auth/auth-guard';

export default function ReconciliationPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Reconciliation</h1>
                <p className="text-muted-foreground">This page will display the bank reconciliation wizard.</p>
            </div>
        </AuthGuard>
    )
}
