
import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StockHistoryPage() {
    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Stock History</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This page will display the stock and transaction history for all products.</p>
                    </CardContent>
                </Card>
            </main>
        </AuthGuard>
    );
}
