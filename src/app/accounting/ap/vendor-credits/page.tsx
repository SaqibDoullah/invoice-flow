
import AuthGuard from '@/components/auth/auth-guard';

export default function VendorCreditsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Vendor Credits</h1>
                <p className="text-muted-foreground">This page will display vendor credits.</p>
            </div>
        </AuthGuard>
    )
}
