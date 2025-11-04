
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Settings, ChevronDown, MessageCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { userProfileSchema, type UserProfileFormData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SecurityGroups from '@/components/settings/security-groups';
import Notifications from '@/components/settings/notifications';
import ProductSettings from '@/components/settings/product-settings';
import FacilitySettings from '@/components/settings/facility-settings';

const timezones = [
    { value: 'Etc/GMT+12', label: '(GMT-12:00) International Date Line West' },
    { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island, Samoa' },
    { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii' },
    { value: 'US/Alaska', label: '(GMT-09:00) Alaska' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time (US & Canada)' },
    { value: 'America/Tijuana', label: '(GMT-08:00) Tijuana, Baja California' },
    { value: 'America/Denver', label: '(GMT-07:00) Mountain Time (US & Canada)' },
    { value: 'America/Chihuahua', label: '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
    { value: 'America/Phoenix', label: '(GMT-07:00) Arizona' },
    { value: 'America/Chicago', label: '(GMT-06:00) Central Time (US & Canada)' },
    { value: 'America/Mexico_City', label: '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
    { value: 'America/Regina', label: '(GMT-06:00) Saskatchewan' },
    { value: 'America/Bogota', label: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco' },
    { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada)' },
    { value: 'America/Indiana/Indianapolis', label: '(GMT-05:00) Indiana (East)' },
    { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time (Canada)' },
    { value: 'America/Caracas', label: '(GMT-04:00) Caracas, La Paz' },
    { value: 'America/Manaus', label: '(GMT-04:00) Manaus' },
    { value: 'America/Santiago', label: '(GMT-04:00) Santiago' },
    { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland' },
    { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brasilia' },
    { value: 'America/Buenos_Aires', label: '(GMT-03:00) Buenos Aires, Georgetown' },
    { value: 'America/Godthab', label: '(GMT-03:00) Greenland' },
    { value: 'America/Montevideo', label: '(GMT-03:00) Montevideo' },
    { value: 'Atlantic/South_Georgia', label: '(GMT-02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
    { value: 'Atlantic/Cape_Verde', label: '(GMT-01:00) Cape Verde Is.' },
    { value: 'Africa/Casablanca', label: '(GMT+00:00) Casablanca, Monrovia, Reykjavik' },
    { value: 'Etc/Greenwich', label: '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London' },
    { value: 'Europe/Amsterdam', label: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna' },
    { value: 'Europe/Belgrade', label: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague' },
    { value: 'Europe/Brussels', label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' },
    { value: 'Europe/Sarajevo', label: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
    { value: 'Africa/Lagos', label: '(GMT+01:00) West Central Africa' },
    { value: 'Asia/Amman', label: '(GMT+02:00) Amman' },
    { value: 'Europe/Athens', label: '(GMT+02:00) Athens, Bucharest, Istanbul' },
    { value: 'Asia/Beirut', label: '(GMT+02:00) Beirut' },
    { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo' },
    { value: 'Africa/Harare', label: '(GMT+02:00) Harare, Pretoria' },
    { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
    { value: 'Asia/Jerusalem', label: '(GMT+02:00) Jerusalem' },
    { value: 'Europe/Minsk', label: '(GMT+02:00) Minsk' },
    { value: 'Africa/Windhoek', label: '(GMT+02:00) Windhoek' },
    { value: 'Asia/Kuwait', label: '(GMT+03:00) Kuwait, Riyadh, Baghdad' },
    { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
    { value: 'Africa/Nairobi', label: '(GMT+03:00) Nairobi' },
    { value: 'Asia/Tbilisi', label: '(GMT+03:00) Tbilisi' },
    { value: 'Asia/Tehran', label: '(GMT+03:30) Tehran' },
    { value: 'Asia/Dubai', label: '(GMT+04:00) Abu Dhabi, Muscat' },
    { value: 'Asia/Baku', label: '(GMT+04:00) Baku' },
    { value: 'Asia/Yerevan', label: '(GMT+04:00) Yerevan' },
    { value: 'Asia/Kabul', label: '(GMT+04:30) Kabul' },
    { value: 'Asia/Yekaterinburg', label: '(GMT+05:00) Yekaterinburg' },
    { value: 'Asia/Karachi', label: '(GMT+05:00) Islamabad, Karachi, Tashkent' },
    { value: 'Asia/Kolkata', label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
    { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu' },
    { value: 'Asia/Almaty', label: '(GMT+06:00) Almaty, Novosibirsk' },
    { value: 'Asia/Dhaka', label: '(GMT+06:00) Astana, Dhaka' },
    { value: 'Asia/Rangoon', label: '(GMT+06:30) Yangon (Rangoon)' },
    { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
    { value: 'Asia/Krasnoyarsk', label: '(GMT+07:00) Krasnoyarsk' },
    { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
    { value: 'Asia/Kuala_Lumpur', label: '(GMT+08:00) Kuala Lumpur, Singapore' },
    { value: 'Asia/Irkutsk', label: '(GMT+08:00) Irkutsk, Ulaan Bataar' },
    { value: 'Australia/Perth', label: '(GMT+08:00) Perth' },
    { value: 'Asia/Taipei', label: '(GMT+08:00) Taipei' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
    { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul' },
    { value: 'Asia/Yakutsk', label: '(GMT+09:00) Yakutsk' },
    { value: 'Australia/Adelaide', label: '(GMT+09:30) Adelaide' },
    { value: 'Australia/Darwin', label: '(GMT+09:30) Darwin' },
    { value: 'Australia/Brisbane', label: '(GMT+10:00) Brisbane' },
    { value: 'Australia/Canberra', label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
    { value: 'Australia/Hobart', label: '(GMT+10:00) Hobart' },
    { value: 'Pacific/Guam', label: '(GMT+10:00) Guam, Port Moresby' },
    { value: 'Asia/Vladivostok', label: '(GMT+10:00) Vladivostok' },
    { value: 'Asia/Magadan', label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia' },
    { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland, Wellington' },
    { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.' },
    { value: 'Pacific/Tongatapu', label: '(GMT+13:00) Nuku\'alofa' },
];

export default function ApplicationSettingsPageContent() {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [users, setUsers] = useState<UserProfileFormData[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [activeUserSubTab, setActiveUserSubTab] = useState('users');
    
    const form = useForm<UserProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            companyName: '',
            companyLogoUrl: '',
            systemOfMeasure: 'us',
            notes: '',
            timezone: 'America/Chicago',
            companyColorEnabled: false,
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                ...profile,
                companyName: profile.companyName || '',
                companyLogoUrl: profile.companyLogoUrl || '',
                systemOfMeasure: profile.systemOfMeasure || 'us',
                notes: profile.notes || '',
                timezone: profile.timezone || 'America/Chicago',
                companyColorEnabled: profile.companyColorEnabled || false,
            });
        }
    }, [profile, form]);

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || !db || authLoading) return;

        setUsersLoading(true);
        const usersColRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersColRef, (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    fullName: data.fullName,
                    email: data.email, // Ensure email is fetched
                } as UserProfileFormData;
            });
            setUsers(usersData);
            setUsersLoading(false);
        }, (error) => {
            console.error("Error fetching users collection:", error);
            const permissionError = new FirestorePermissionError({
                path: usersColRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setUsersLoading(false);
        });

        return () => unsubscribe();

    }, [user, authLoading]);

    const saveProfileUpdate = async (data: Partial<UserProfileFormData>) => {
        const db = getFirestoreDb();
        if (!user || !db) return;
        
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
        });
    };

    const onSubmit = async (data: UserProfileFormData) => {
        setIsSubmitting(true);
        await saveProfileUpdate(data);
        setIsSubmitting(false);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const storage = getFirebaseStorage();
        if (!file || !user || !storage) return;

        setIsUploading(true);
        try {
            if (profile?.companyLogoUrl) {
                const oldStorageRef = ref(storage, profile.companyLogoUrl);
                await deleteObject(oldStorageRef).catch((error) => {
                    if (error.code !== 'storage/object-not-found') {
                        throw error;
                    }
                });
            }
            const filePath = `logos/${user.uid}/${file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            form.setValue('companyLogoUrl', downloadURL);
            await saveProfileUpdate({ companyLogoUrl: downloadURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the new logo.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        const storage = getFirebaseStorage();
        if (!user || !profile?.companyLogoUrl || !storage) return;
        
        setIsUploading(true);
        try {
            const storageRef = ref(storage, profile.companyLogoUrl);
            await deleteObject(storageRef);
            form.setValue('companyLogoUrl', '');
            await saveProfileUpdate({ companyLogoUrl: '' });
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                form.setValue('companyLogoUrl', '');
                await saveProfileUpdate({ companyLogoUrl: '' });
            } else {
                console.error("Error removing image:", error);
                toast({ variant: 'destructive', title: 'Removal Failed', description: 'Could not remove the company logo.' });
            }
        } finally {
            setIsUploading(false);
        }
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
                                <p className="text-sm text-muted-foreground">All changes saved</p>
                                <Button type="submit" disabled={isSubmitting || isUploading}>
                                    {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="company-info" className="w-full">
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
                                                                     {timezones.map(tz => (
                                                                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                                                    ))}
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
                                                <div className="w-48 h-24 mx-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-md flex items-center justify-center relative">
                                                    {isUploading ? (
                                                        <Loader2 className="w-8 h-8 animate-spin" />
                                                    ) : form.watch('companyLogoUrl') ? (
                                                        <Image src={form.watch('companyLogoUrl')} alt="Company Logo" layout="fill" objectFit="contain" />
                                                    ) : (
                                                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="mt-4">
                                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                                    <Button type="button" variant="link" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>Change image</Button>
                                                    <Button type="button" variant="link" className="text-destructive" onClick={handleRemoveImage} disabled={isUploading || !form.watch('companyLogoUrl')}>Remove image</Button>
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
                             <TabsContent value="users" className="mt-6">
                                <div className="grid md:grid-cols-4 gap-8">
                                    <div className="md:col-span-1">
                                        <nav className="flex flex-col gap-1">
                                            <Button variant={activeUserSubTab === 'users' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveUserSubTab('users')}>Users</Button>
                                            <Button variant={activeUserSubTab === 'security-groups' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveUserSubTab('security-groups')}>Security groups</Button>
                                            <Button variant={activeUserSubTab === 'notifications' ? 'secondary' : 'ghost'} className="justify-start" onClick={() => setActiveUserSubTab('notifications')}>Notifications</Button>
                                            <Button variant="ghost" className="justify-start text-muted-foreground">Mobile scanner</Button>
                                            <Button variant="ghost" className="justify-start text-muted-foreground">API keys</Button>
                                        </nav>
                                    </div>
                                    <div className="md:col-span-3">
                                        {activeUserSubTab === 'users' && (
                                            <>
                                                <h2 className="text-2xl font-bold mb-4">Users</h2>
                                                <Card>
                                                    <CardContent className="p-0">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Username</TableHead>
                                                                    <TableHead>Email</TableHead>
                                                                    <TableHead>Security groups</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {usersLoading ? (
                                                                    <TableRow>
                                                                        <TableCell colSpan={3} className="h-24 text-center">
                                                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ) : users.length > 0 ? (
                                                                    users.map((user, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell>{user.fullName}</TableCell>
                                                                            <TableCell>{user.email || '--'}</TableCell>
                                                                            <TableCell>--</TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell colSpan={3} className="h-24 text-center">
                                                                            No users found.
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </CardContent>
                                                </Card>
                                            </>
                                        )}
                                        {activeUserSubTab === 'security-groups' && (
                                            <SecurityGroups />
                                        )}
                                        {activeUserSubTab === 'notifications' && (
                                            <Notifications users={users} />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="product" className="mt-6">
                                <ProductSettings />
                            </TabsContent>
                            <TabsContent value="facility" className="mt-6">
                                <FacilitySettings />
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
