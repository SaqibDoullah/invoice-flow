
import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StockPage() {
    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Stock Levels</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This page will display the current stock levels for all products.</p>
                    </CardContent>
                </Card>
            </main>
        </AuthGuard>
    );
}
