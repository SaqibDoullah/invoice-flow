
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Settings, ChevronDown, MessageCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AuthGuard from '@/components/auth/auth-guard';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { userProfileSchema, type UserProfileFormData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

export default function ApplicationSettingsPageContent() {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<UserProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            companyName: '',
            systemOfMeasure: 'us',
            notes: '',
            timezone: 'cst',
            companyColorEnabled: false,
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                ...profile,
                companyName: profile.companyName || '',
                systemOfMeasure: profile.systemOfMeasure || 'us',
                notes: profile.notes || '',
                timezone: profile.timezone || 'cst',
                companyColorEnabled: profile.companyColorEnabled || false,
            });
        }
    }, [profile, form]);

    const onSubmit = async (data: UserProfileFormData) => {
        const db = getFirestoreDb();
        if (!user || !db) return;
        setIsSubmitting(true);
        
        const userDocRef = doc(db, 'users', user.uid);
        
        updateDoc(userDocRef, data)
            .then(() => {
                toast({ title: 'Success', description: 'Settings updated successfully.' });
            })
            .catch((serverError: any) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: data,
                });
                errorEmitter.emit('permission-error', permissionError);

                if (serverError.code !== 'permission-denied') {
                     toast({ variant: 'destructive', title: 'Error', description: 'Failed to update settings.' });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };


    const renderSection = (title: string, addAction: string) => (
        <div className="py-4 border-b">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">none</p>
            <Button variant="link" className="p-0 h-auto text-sm">{addAction}</Button>
        </div>
    );
    
    if (authLoading) {
        return (
            <div className="container mx-auto p-8 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    return (
        <AuthGuard>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <main className="container mx-auto p-4 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                                    <Settings className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Link href="/" className="hover:text-foreground">Home</Link>
                                    </div>
                                    <h1 className="text-2xl font-bold">Application settings</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="company-info">
                            <TabsList className="flex-wrap h-auto">
                                <TabsTrigger value="company-info">Company info</TabsTrigger>
                                <TabsTrigger value="users">Users</TabsTrigger>
                                <TabsTrigger value="product">Product</TabsTrigger>
                                <TabsTrigger value="facility">Facility</TabsTrigger>
                                <TabsTrigger value="purchasing">Purchasing</TabsTrigger>
                                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                                <TabsTrigger value="variances">Variances</TabsTrigger>
                                <TabsTrigger value="selling">Selling</TabsTrigger>
                                <TabsTrigger value="accounting">Accounting</TabsTrigger>
                                <TabsTrigger value="screens">Screens</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="billing">Billing</TabsTrigger>
                            </TabsList>
                            <TabsContent value="company-info" className="mt-6">
                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardContent className="p-6 space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="companyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Name</FormLabel>
                                                            <FormControl><Input {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="systemOfMeasure"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Default system of measure</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="us">English system / United States customary units</SelectItem>
                                                                    <SelectItem value="metric">Metric</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Notes</FormLabel>
                                                            <FormControl><Textarea rows={3} {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-6">
                                                {renderSection("Addresses", "add address")}
                                                {renderSection("Phone numbers", "add phone number")}
                                                {renderSection("Email addresses", "add email address")}
                                                {renderSection("Websites & social networks", "add web address")}
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold">Timezone</h3>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    This timezone setting is used specifically for displaying transaction timestamps in report columns. If no timezone is selected, timestamps in reports will default to GMT.
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    In all other areas of the application, such as product lookups, quick transfers, builds, shipments, variances, invoices, and stock history, timestamps (including last updated, created, and status updates) are displayed in the local timezone of your browser.
                                                </p>
                                                <FormField
                                                    control={form.control}
                                                    name="timezone"
                                                    render={({ field }) => (
                                                        <FormItem className="mt-4">
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="cst">UTC-5:00 - CST6CDT</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="lg:col-span-1 space-y-6">
                                        <Card>
                                            <CardContent className="p-6 text-center">
                                                <div className="w-48 mx-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-md flex items-center justify-center">
                                                    <Image src="https://assets.stickpng.com/images/5847f975cef1014c0b5e489c.png" alt="Heartland Logo" width={150} height={40} data-ai-hint="logo Heartland" />
                                                </div>
                                                <div className="mt-4">
                                                    <Button variant="link">Change image</Button>
                                                    <Button variant="link" className="text-destructive">Remove image</Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">Supported formats: JPG, PNG. For best results, we recommend resizing your image to 150 x 540 pixels.</p>
                                            </CardContent>
                                            <CardContent className="p-6 border-t">
                                                <FormField
                                                    control={form.control}
                                                    name="companyColorEnabled"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between">
                                                            <FormLabel>Company color</FormLabel>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: '#3b82f6' }}></div>
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="fixed bottom-8 right-8">
                            <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                                <MessageCircle className="w-8 h-8" />
                            </Button>
                        </div>
                    </main>
                </form>
            </Form>
        </AuthGuard>
    );
}
