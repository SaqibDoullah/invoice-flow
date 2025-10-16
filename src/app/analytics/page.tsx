
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AnalyticsOverviewPageContent from './analytics-overview-page-content';

function AnalyticsPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');
    return <AnalyticsOverviewPageContent key={tab} />; // Use key to force re-render on tab change if needed
}

export default function AnalyticsOverviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsPage />
        </Suspense>
    );
}
