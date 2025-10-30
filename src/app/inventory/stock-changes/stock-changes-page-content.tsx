
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Search, MessageCircle, ChevronDown, Triangle, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CustomizeColumnsDialog from '@/components/inventory/stock-takes/customize-columns-dialog';


const batchStockChangesColumns = [
    { id: 'status', label: 'Status' },
    { id: 'stockChangeId', label: 'Stock change ID' },
    { id: 'orderId', label: 'Order ID' },
    { id: 'date', label: 'Date' },
    { id: 'sublocation', label: 'Sublocation' },
    { id: 'note', label: 'Note' },
    { id: 'commitTimestamp', label: 'Commit timestamp' },
    { id: 'commitUser', label: 'Commit user' },
];


export default function StockChangesPageContent() {
    const [recentChanges, setRecentChanges] = useState<StockHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [columns, setColumns] = useState(batchStockChangesColumns);
    
    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        const historyCollectionRef = collection(db, 'users', user.uid, 'stockHistory');
        const q = query(historyCollectionRef, orderBy('timestamp', 'desc'), limit(5));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHistoryEntry));
            setRecentChanges(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching recent stock changes:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recent stock changes.' });
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
                        <TabsTrigger value="quick">Quick stock changes</TabsTrigger>
                        <TabsTrigger value="batch">Batch stock changes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quick" className="mt-6">
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
                                        {loading ? (
                                            <div className="space-y-4">
                                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full"/>)}
                                            </div>
                                        ) : recentChanges.length > 0 ? (
                                            recentChanges.map(change => (
                                                <div key={change.id} className="text-sm border-b pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-medium text-primary max-w-[80%]">{change.productId} - {change.description}</p>
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0"/>
                                                    </div>
                                                    <p>{format(toDate(change.timestamp)!, 'M/d/yyyy')} &bull; {change.sublocation} &bull; {change.transaction} &bull; {change.details}</p>
                                                    <p className="text-xs text-muted-foreground">{format(toDate(change.timestamp)!, 'MMM d yyyy h:mm:ss a')} by {change.user}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm text-center py-4">No recent stock changes.</p>
                                        )}
                                        <div className="text-center">
                                            <Button variant="link">View full stock change history</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="batch" className="mt-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <ChevronRight className="w-4 h-4" />
                            <span>Batch stock changes</span>
                        </div>

                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                                    <TriangleIcon className="w-6 h-6 text-teal-500" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight">Batch stock changes:</h1>
                                <Select defaultValue="default">
                                    <SelectTrigger className="w-auto text-3xl font-bold border-none shadow-none focus:ring-0 bg-transparent p-0 h-auto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild>
                                    <Link href="/inventory/stock-changes/new">Create batch stock change</Link>
                                </Button>
                                <Button variant="outline">Import batch stock change</Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize columns</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        
                         <div className="mb-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <Input placeholder="Search..." />
                                <Input placeholder="Status" />
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All dates"/>
                                    </SelectTrigger>
                                </Select>
                                 <div className="relative"><Input placeholder="Sublocation" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
                                 <div className="relative"><Input placeholder="Product" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
                                 <div className="relative"><Input placeholder="Reason" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
                            </div>
                             <div className="flex justify-between items-center">
                                <div><Button variant="ghost" size="icon"><ArrowUpDown className="w-4 h-4"/></Button></div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                    <ShieldAlert className='w-4 h-4 text-orange-500' />
                                    <span>Filtered: You do not have authorization to view this summary.</span>
                                    <span className='ml-4'>Selected: You do not have authorization to view this summary.</span>
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"><Checkbox/></TableHead>
                                            {columns.map(col => (
                                                <TableHead key={col.id}>
                                                     {col.id === 'date' ? (
                                                        <div className="flex items-center gap-1">
                                                            <ArrowUpDown className="w-3 h-3"/> {col.label}
                                                        </div>
                                                     ) : col.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                            No batch stock changes found.
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
                 <CustomizeColumnsDialog
                    isOpen={isCustomizeOpen}
                    setIsOpen={setIsCustomizeOpen}
                    columns={columns}
                    setColumns={setColumns}
                />
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
      viewBox="0 0 24"
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
