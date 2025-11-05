
import AuthGuard from '@/components/auth/auth-guard';

export default function CreditNotesPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Credit Notes</h1>
                <p className="text-muted-foreground">This page will display customer credit notes.</p>
            </div>
        </AuthGuard>
    )
}
