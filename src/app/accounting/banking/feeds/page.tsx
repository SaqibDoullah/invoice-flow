
import AuthGuard from '@/components/auth/auth-guard';

export default function BankFeedsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Bank Feeds / Imports</h1>
                <p className="text-muted-foreground">This page will handle bank feeds and imports.</p>
            </div>
        </AuthGuard>
    )
}
