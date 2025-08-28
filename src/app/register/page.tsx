'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="grid gap-2 text-center">
          <div className="flex justify-center items-center mb-2">
            <FileText className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">InvoiceFlow</h1>
          </div>
          <p className="text-balance text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
