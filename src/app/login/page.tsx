'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
           <FileText className="h-8 w-8 mr-2 text-primary" />
           <h1 className="text-3xl font-bold">InvoiceFlow</h1>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
