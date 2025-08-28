
import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"
import DashboardLayout from '@/components/dashboard-layout';

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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}