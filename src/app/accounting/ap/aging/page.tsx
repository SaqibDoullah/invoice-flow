
import AuthGuard from '@/components/auth/auth-guard';

export default function ApAgingPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">AP Aging Report</h1>
                <p className="text-muted-foreground">This page will display the accounts payable aging report.</p>
            </div>
        </AuthGuard>
    )
}
