'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null; // Or a loading spinner
  }
  
  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
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
      <div className="hidden bg-muted lg:block" />
    </div>
  );
}
