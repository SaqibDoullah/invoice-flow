'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getFirestoreDb, getFirebaseAuth } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const settingsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      companyAddress: '',
      companyCity: '',
    }
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const db = getFirestoreDb();
      if (!user || !db) {
        setDataLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        // Start with default values from auth profile
        const defaultData: Partial<SettingsFormData> = {
            fullName: user.displayName || '',
        }

        if (docSnap.exists()) {
          form.reset({ ...defaultData, ...docSnap.data() });
        } else {
          form.reset(defaultData);
        }
      } catch (error: any) {
        console.error("Error fetching company info:", { code: error?.code, message: error?.message });
        if ((error as any).code !== 'unavailable') {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load settings.' });
        }
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchCompanyInfo();
    }
  }, [user, authLoading, form, toast]);

  const onSubmit = async (data: SettingsFormData) => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    if (!user || !auth || !db) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      if (user.displayName !== data.fullName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.fullName });
      }
      
      // Update Firestore document
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    } catch (error: any) {
      console.error("Error saving settings:", { code: error?.code, message: error?.message });
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = dataLoading || authLoading;

  return (
    <AuthGuard>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
          
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                      <CardTitle>Profile</CardTitle>
                      <CardDescription className="mt-1">Your personal account details.</CardDescription>
                  </div>
                    <div className="md:col-span-2">
                        <Card>
                          <CardContent className="p-6">
                              {isLoading ? <p>Loading...</p> : (
                              <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="fullName"
                                      render={({ field }) => (
                                          <FormItem>
                                          <FormLabel>Full Name</FormLabel>
                                          <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                          <FormMessage />
                                          </FormItem>
                                      )}
                                      />
                                  <div className="space-y-2">
                                      <Label htmlFor="email">Email Address</Label>
                                      <Input id="email" type="email" placeholder="Your email" disabled defaultValue={user?.email || ''} />
                                  </div>
                              </div>
                              )}
                          </CardContent>
                        </Card>
                    </div>

                  <Separator className="md:col-span-3" />

                  <div className="md:col-span-1">
                      <CardTitle>Company</CardTitle>
                      <CardDescription className="mt-1">Details for your invoices.</CardDescription>
                  </div>

                  <div className="md:col-span-2">
                      <Card>
                          <CardContent className="p-6">
                          {isLoading ? <p>Loading...</p> : (
                              <div className="space-y-4">
                              <FormField
                                  control={form.control}
                                  name="companyName"
                                  render={({ field }) => (
                                      <FormItem>
                                      <FormLabel>Company Name</FormLabel>
                                      <FormControl><Input placeholder="Your Company Name" {...field} /></FormControl>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                                  />
                              <FormField
                                  control={form.control}
                                  name="companyAddress"
                                  render={({ field }) => (
                                      <FormItem>
                                      <FormLabel>Address</FormLabel>
                                      <FormControl><Input placeholder="123 Business St, Suite 100" {...field} /></FormControl>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                                  />
                              <FormField
                                  control={form.control}
                                  name="companyCity"
                                  render={({ field }) => (
                                      <FormItem>
                                      <FormLabel>City, State, ZIP</FormLabel>
                                      <FormControl><Input placeholder="City, State, 12345" {...field} /></FormControl>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              </div>
                          )}
                          </CardContent>
                      </Card>
                  </div>

                  <Separator className="md:col-span-3" />

                    <div className="md:col-span-3 flex justify-end">
                      <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                      </Button>
                  </div>
              </form>
          </Form>
        </main>
      </div>
    </AuthGuard>
  );
}