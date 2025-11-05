
import AuthGuard from '@/components/auth/auth-guard';

export default function TrialBalancePage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Trial Balance</h1>
                <p className="text-muted-foreground">This page will display the trial balance.</p>
            </div>
        </AuthGuard>
    )
}
