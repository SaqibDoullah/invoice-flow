
import AuthGuard from '@/components/auth/auth-guard';

export default function ConsolidationsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Consolidations</h1>
                <p className="text-muted-foreground">This page will display financial consolidations.</p>
            </div>
        </AuthGuard>
    )
}
