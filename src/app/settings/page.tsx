'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const companyInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
});
type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: '',
      companyAddress: '',
      companyCity: '',
    }
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data() as CompanyInfoFormData);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load company information.' });
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyInfo();
  }, [user, form, toast]);

  const onSubmit = async (data: CompanyInfoFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      toast({ title: 'Success', description: 'Company information updated successfully.' });
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save company information.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Update your company's details. This will be displayed on your invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <p>Loading...</p> : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <div className="flex justify-end">
                           <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Your email" disabled defaultValue={user?.email || ''} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full mt-2">Change Password</Button>
                  </div>
                  <Separator />
                  <div>
                     <Button variant="destructive">Delete Account</Button>
                     <p className="text-sm text-muted-foreground mt-2">Permanently delete your account and all of your data. This action cannot be undone.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </AuthGuard>
  );
}
