
import AuthGuard from '@/components/auth/auth-guard';

export default function QboIntegrationPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">QuickBooks Online Integration</h1>
                <p className="text-muted-foreground">This page will display the QBO sync status.</p>
            </div>
        </AuthGuard>
    )
}
