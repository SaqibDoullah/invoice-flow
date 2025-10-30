'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Search, MessageCircle, ChevronDown, Truck, Undo2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AuthGuard from '@/components/auth/auth-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type StockHistoryEntry } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransfersPageContent() {
    const [recentTransfers, setRecentTransfers] = useState<StockHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        const historyCollectionRef = collection(db, 'users', user.uid, 'stockHistory');
        // Assuming 'Transfer' is a possible value in the 'transaction' field
        const q = query(historyCollectionRef, where('transaction', '==', 'Transfer'), orderBy('timestamp', 'desc'), limit(5));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHistoryEntry));
            setRecentTransfers(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching recent transfers:", error);
            // Don't show toast if it's just no data
            if(error.code !== 'not-found') {
              toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recent transfers.' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);
    
    const toDate = (v: any): Date | null => {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (typeof v.toDate === 'function') return v.toDate();
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };


    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                <Tabs defaultValue="quick">
                    <TabsList>
                        <TabsTrigger value="quick">Quick stock transfers</TabsTrigger>
                        <TabsTrigger value="orders">Transfer orders</TabsTrigger>
                        <TabsTrigger value="shipments">Transfer shipments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quick" className="mt-6">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Create Quick Stock Transfer</h2>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex gap-8">
                                            <div className="flex flex-col items-center">
                                                {[...Array(6)].map((_, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                            {i + 1}
                                                        </div>
                                                        {i < 5 && <div className="w-px h-16 bg-border" />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex-1 space-y-9">
                                                <div className="space-y-1 pt-1">
                                                    <label className="text-sm font-medium">Select product to transfer</label>
                                                    <div className="relative">
                                                        <Input placeholder="-- Unspecified --" />
                                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select FROM sublocation, lot id or packing to change</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Enter quantity to transfer</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Select TO destination sublocation</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Note</label>
                                                    <Input />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Enter date of transfer</label>
                                                    <Input type="date" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-6">
                                    <Button>Commit quick stock transfer</Button>
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                 <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">&nbsp;</h2>
                                <Card>
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle>Recent quick stock transfers</CardTitle>
                                        <div className="p-2 bg-muted rounded-full">
                                            <Undo2 className="w-4 h-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {loading ? (
                                            <div className="space-y-4">
                                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full"/>)}
                                            </div>
                                        ) : recentTransfers.length > 0 ? (
                                            recentTransfers.map(t => (
                                                <div key={t.id} className="text-sm border-b pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-medium text-primary max-w-[80%]">{t.productId} - {t.description}</p>
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0"/>
                                                    </div>
                                                    <p>{format(toDate(t.timestamp)!, 'M/d/yyyy')} &bull; {t.details}</p>
                                                    <p className="text-xs text-muted-foreground">Committed {format(toDate(t.timestamp)!, 'PPp')} by {t.user}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm text-center py-4">No recent quick stock transfers.</p>
                                        )}
                                        <div className="text-center">
                                            <Button variant="link">View full quick stock transfer history</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="orders">
                        <p>Transfer orders will be shown here.</p>
                    </TabsContent>
                     <TabsContent value="shipments">
                        <p>Transfer shipments will be shown here.</p>
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
