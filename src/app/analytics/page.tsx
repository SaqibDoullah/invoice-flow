
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AnalyticsOverviewPageContent from './analytics-overview-page-content';

function AnalyticsPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'overview';
    const validTabs = ['overview', 'sales', 'product-sales', 'product-stock', 'purchases'];
    const defaultTab = validTabs.includes(tab) ? tab : 'overview';

    return <AnalyticsOverviewPageContent defaultTab={defaultTab} />;
}

export default function AnalyticsOverviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsPage />
        </Suspense>
    );
}
