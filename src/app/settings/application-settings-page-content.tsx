'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Settings, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AuthGuard from '@/components/auth/auth-guard';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ApplicationSettingsPageContent() {

    const renderSection = (title: string, addAction: string) => (
        <div className="py-4 border-b">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">none</p>
            <Button variant="link" className="p-0 h-auto text-sm">{addAction}</Button>
        </div>
    );

    return (
        <AuthGuard>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Action 1</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <span className="text-sm text-muted-foreground">All changes saved</span>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="company-name">Name</Label>
                                            <Input id="company-name" defaultValue="Heartland" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="measure-system">Default system of measure</Label>
                                            <Select defaultValue="us">
                                                <SelectTrigger id="measure-system">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="us">English system / United States customary units</SelectItem>
                                                    <SelectItem value="metric">Metric</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea id="notes" rows={3}/>
                                        </div>
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
                                         <Select defaultValue="cst">
                                            <SelectTrigger className="mt-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cst">UTC-5:00 - CST6CDT</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="company-color-switch">Company color</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: '#3b82f6' }}></div>
                                                <Switch id="company-color-switch" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    {/* Other tab contents would go here */}
                </Tabs>

                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </main>
        </AuthGuard>
    );
}
