'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  FirebaseError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const registerSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof registerSchema>>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'register' && { fullName: '' }),
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema> | z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    if (!auth || !db) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firebase is not configured correctly. Please check your environment variables.",
        });
        setIsLoading(false);
        return;
    }
    try {
      if (mode === 'register') {
        const { email, password, fullName } = values as z.infer<typeof registerSchema>;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        // Also save the name to the user's document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { fullName: fullName }, { merge: true });

      } else {
        const { email, password } = values as z.infer<typeof loginSchema>;
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = 'An unexpected error occurred.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (firebaseError.code === 'auth/configuration-not-found') {
        errorMessage = 'Authentication configuration is missing. Please contact support.';
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
      console.error(`${mode} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-muted/40 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Log In' : 'Create an Account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your credentials to access your account.'
              : 'Fill in the details below to create a new account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {mode === 'register' && (
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Log In' : 'Register'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline">
                  Register
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Log In
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
