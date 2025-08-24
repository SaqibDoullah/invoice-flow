
'use client';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" placeholder="Your Company Name" defaultValue="InvoiceFlow" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Input id="companyAddress" placeholder="123 Business St, Suite 100" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="companyCity">City, State, ZIP</Label>
                    <Input id="companyCity" placeholder="City, State, 12345" />
                  </div>
                   <div className="flex justify-end">
                     <Button>Save Changes</Button>
                   </div>
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
                    <Input id="email" type="email" placeholder="Your email" disabled defaultValue="user@example.com" />
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

    