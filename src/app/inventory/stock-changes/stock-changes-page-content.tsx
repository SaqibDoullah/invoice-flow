
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Search, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AuthGuard from '@/components/auth/auth-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const recentChanges = [
    { id: '34536187-6', name: 'Geekvape Aegis Legend lll Kit-Silver', date: '10/24/2025', location: 'A1-01-A', change: 'Add 1 units', reason: 'Found', committed: 'Oct 24 2025 11:28:15 am by ali' },
    { id: '630987110-1', name: 'Vaporesso Xros 3ML Replacement Pods Corex 3.0 (Pack of 4)=0.6 Ohms', date: '10/17/2025', location: 'Main', change: 'Add 50 units', committed: 'Oct 17 2025 10:44:28 am by all' },
    { id: '630887110-1', name: 'Vaporesso Xros 3ML Replacement Pods Corex 3.0 (Pack of 4)=0.6 Ohms', date: '10/17/2025', location: 'C1-01-A', change: 'Add 50 units', committed: 'Oct 17 2025 10:44:54 am by all' },
    { id: '587028855-5', name: 'Vaporesso XROS Replacement Pod 2.0 Corex 3ML (4 Pack) Type-Mes...', date: '10/16/2025', location: 'C1-01-A', change: 'Add 700 units', committed: 'Oct 16 2025 12:14:32 pm by ali' },
    { id: '116042166-5', name: 'SMOK Novo GT Starter Kit (Single Unit) Color-Pale Gold', date: '10/7/2025', location: 'C6-01-A', change: 'Add 41 units', committed: 'Oct 7 2025 3:03:45 pm by Wara' },
]

export default function StockChangesPageContent() {
    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/inventory" className="hover:text-foreground">
                        Inventory
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>Quick stock change</span>
                </div>
                
                <h1 className="text-2xl font-bold tracking-tight mb-4">Quick stock change</h1>

                <Tabs defaultValue="quick">
                    <TabsList>
                        <TabsTrigger value="quick">Quick stock changes</TabsTrigger>
                        <TabsTrigger value="batch">Batch stock changes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quick" className="mt-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            Create Stock Change
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-8">
                                            <div className="flex flex-col items-center">
                                                {[...Array(8)].map((_, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                            {i + 1}
                                                        </div>
                                                        {i < 7 && <div className="w-px h-16 bg-border" />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex-1 space-y-9">
                                                <div className="space-y-1 pt-1">
                                                    <label className="text-sm font-medium">Select product</label>
                                                    <div className="relative">
                                                        <Input placeholder="-- Unspecified --" />
                                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select sublocation, lot id or packing to change</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Lot ID</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Packing</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Change quantity</label>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span>Set to: <Input className="w-24 inline-block ml-2"/></span>
                                                        <span>or</span>
                                                        <span>Add: <Input className="w-24 inline-block ml-2"/></span>
                                                         <span>or</span>
                                                        <span>Remove: <Input className="w-24 inline-block ml-2"/></span>
                                                         <span>or</span>
                                                        <span>Break apart case: <Input className="w-24 inline-block ml-2"/></span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select reason</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Note</label>
                                                    <Textarea />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Enter date of change</label>
                                                    <Input type="date" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-6 flex justify-center">
                                    <Button>Commit stock change</Button>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle>Recent stock changes</CardTitle>
                                        <div className="p-2 bg-muted rounded-full">
                                            <TriangleIcon className="w-4 h-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {recentChanges.map(change => (
                                            <div key={change.id} className="text-sm border-b pb-2">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-primary max-w-[80%]">{change.id} - {change.name}</p>
                                                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0"/>
                                                </div>
                                                <p>{change.date} &bull; {change.location} &bull; {change.change} &bull; {change.reason}</p>
                                                <p className="text-xs text-muted-foreground">{change.committed}</p>
                                            </div>
                                        ))}
                                        <div className="text-center">
                                            <Button variant="link">View full stock change history</Button>
                                        </div>
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
        </AuthGuard>
    );
}

function TriangleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 3.73 21h16.54a2 2 0 0 0 1.73-3Z" />
    </svg>
  )
}
