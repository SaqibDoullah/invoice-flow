
'use client';

import { usePathname } from 'next/navigation';
import DashboardSidebar from './dashboard-sidebar';
import { SidebarProvider, SidebarInset } from './ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}