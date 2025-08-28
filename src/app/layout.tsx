import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';

// Dynamically import the client-side providers with SSR turned off.
// This is the key to preventing the Firebase SDK from being initialized on the server.
const ClientProviders = dynamic(() => import('@/components/client-providers'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'InvoiceFlow',
  description: 'A production-ready Invoice Generator web app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <ClientProviders>{children}</ClientProviders>
        </SidebarProvider>
      </body>
    </html>
  );
}
