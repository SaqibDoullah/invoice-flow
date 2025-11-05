
import AuthGuard from '@/components/auth/auth-guard';

export default function GeneralLedgerPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">General Ledger</h1>
                <p className="text-muted-foreground">This page will display the general ledger.</p>
            </div>
        </AuthGuard>
    )
}
