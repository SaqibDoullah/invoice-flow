
import AuthGuard from '@/components/auth/auth-guard';

export default function ArAgingPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">AR Aging Report</h1>
                <p className="text-muted-foreground">This page will display the accounts receivable aging report.</p>
            </div>
        </AuthGuard>
    )
}
