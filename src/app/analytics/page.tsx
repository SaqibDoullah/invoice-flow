
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AnalyticsOverviewPageContent from './analytics-overview-page-content';

function AnalyticsPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'overview';
    return <AnalyticsOverviewPageContent defaultTab={tab} />;
}

export default function AnalyticsOverviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsPage />
        </Suspense>
    );
}
