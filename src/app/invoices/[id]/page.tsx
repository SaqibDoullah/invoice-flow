
'use client'

import InvoiceDetailPageContent from './invoice-detail-page-content';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthGuard from '@/components/auth/auth-guard';

export default function InvoiceDetailPage() {
    return (
        <AuthGuard>
            <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 print:hidden">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoices
                        </Link>
                    </Button>
                </div>
                <InvoiceDetailPageContent />
            </main>
        </AuthGuard>
    )
}
