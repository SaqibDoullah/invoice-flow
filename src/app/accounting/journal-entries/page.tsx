
import AuthGuard from '@/components/auth/auth-guard';

export default function JournalEntriesPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Journal Entries</h1>
                <p className="text-muted-foreground">This page will display journal entries.</p>
            </div>
        </AuthGuard>
    )
}
