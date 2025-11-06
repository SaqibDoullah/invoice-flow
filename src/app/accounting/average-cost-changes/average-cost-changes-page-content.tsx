
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Calculator, ChevronDown, Search, ArrowUpDown, ShieldAlert, MessageCircle } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { format, isValid } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type AverageCostChange } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isValid(d) ? d : null;
};

export default function AverageCostChangesPageContent() {
    const [changes, setChanges] = useState<AverageCostChange[]>([]);
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
        const changesRef = collection(db, 'users', user.uid, 'averageCostChanges');
        const q = query(changesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const changesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AverageCostChange));
            setChanges(changesData);
            setLoading(false);
        }, (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: changesRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);

            if (serverError.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch average cost changes.'});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);

    return (
        <AuthGuard>
            <main className="container mx-auto p-4 md:p-8">
                 <Tabs defaultValue="average-cost-changes">
                    <TabsList>
                        <TabsTrigger value="average-cost-changes">Average cost changes</TabsTrigger>
                        <TabsTrigger value="quick-average-cost-changes">Quick average cost changes</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center justify-between mt-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                            <Calculator className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link href="/" className="hover:text-foreground">Home</Link>
                            </div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Average cost changes:
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="text-2xl font-bold p-1">
                                            Default <ChevronDown className="w-5 h-5 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Default</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/accounting/average-cost-changes/new">Create average cost change</Link>
                        </Button>
                        <Button variant="outline">Import average cost change</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Action 1</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                 <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Input placeholder="Search..." />
                        <Input placeholder="Status: Draft, Posted" />
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Effective date: All dates"/></SelectTrigger>
                        </Select>
                        <div className="relative"><Input placeholder="Product"/><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/></div>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Created: All dates"/></SelectTrigger>
                        </Select>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Last updated: All dates"/></SelectTrigger>
                        </Select>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <Button variant="ghost" size="icon"><ArrowUpDown className="h-4 w-4"/></Button>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <ShieldAlert className='w-4 h-4 text-orange-500' />
                            <span>Filtered: You do not have authorization to view this summary.</span>
                        </div>
                    </div>
                 </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead><div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3"/>Effective date</div></TableHead>
                                        <TableHead>Journal entry ID</TableHead>
                                        <TableHead>Warning</TableHead>
                                        <TableHead>Product ID</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Record created user</TableHead>
                                        <TableHead>Record created</TableHead>
                                        <TableHead>Record last updated user</TableHead>
                                        <TableHead>Record last updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                   {loading ? (
                                     <TableRow><TableCell colSpan={11} className="h-24 text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                   ) : changes.length > 0 ? (
                                       changes.map((row) => (
                                       <TableRow key={row.id}>
                                           <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                                           <TableCell>{format(toDate(row.effectiveDate)!, 'MM/dd/yyyy')}</TableCell>
                                           <TableCell className="text-primary font-medium">{row.journalEntryId}</TableCell>
                                           <TableCell>{row.warning}</TableCell>
                                           <TableCell>{row.productId}</TableCell>
                                           <TableCell>{row.description}</TableCell>
                                           <TableCell>{row.notes}</TableCell>
                                           <TableCell>{row.recordCreatedUser}</TableCell>
                                           <TableCell>{format(toDate(row.recordCreated)!, 'PPp')}</TableCell>
                                           <TableCell>{row.recordLastUpdatedUser}</TableCell>
                                           <TableCell>{format(toDate(row.recordLastUpdated)!, 'PPp')}</TableCell>
                                       </TableRow>
                                   ))) : (
                                     <TableRow>
                                        <TableCell colSpan={11} className="h-24 text-center">
                                            No average cost changes found.
                                        </TableCell>
                                     </TableRow>
                                   )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </main>
        </AuthGuard>
    )
}
