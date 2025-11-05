
import AuthGuard from '@/components/auth/auth-guard';

export default function CashFlowPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Cash Flow Statement</h1>
                <p className="text-muted-foreground">This page will display the cash flow statement.</p>
            </div>
        </AuthGuard>
    )
}
