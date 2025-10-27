
import Link from 'next/link';
import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';

export default function ProductGroupsPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Product Groups</h1>
                <p className="text-muted-foreground mb-4">This page will list all product groups.</p>
                <Button asChild>
                    <Link href="/inventory/product-groups/new">
                        Create New Item Group
                    </Link>
                </Button>
            </div>
        </AuthGuard>
    )
}

    