'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import { Toaster } from './ui/toaster';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FirebaseErrorListener = dynamic(
  () => import('./FirebaseErrorListener'),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return (
            <>
                {children}
                <Toaster />
                {process.env.NODE_ENV === 'development' && (
                  <Suspense fallback={null}>
                    <FirebaseErrorListener />
                  </Suspense>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Toaster />
            {process.env.NODE_ENV === 'development' && (
              <Suspense fallback={null}>
                <FirebaseErrorListener />
              </Suspense>
            )}
        </div>
    );
}
