
'use client';

import { usePathname } from 'next/navigation';
import DashboardSidebar from './dashboard-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <>
            <DashboardSidebar />
            {children}
        </>
    );
}
