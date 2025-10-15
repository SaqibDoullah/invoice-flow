
'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
