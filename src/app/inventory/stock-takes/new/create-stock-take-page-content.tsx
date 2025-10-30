
'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList,
  ArrowDown,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';

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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type InventoryItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function CreateStockTakePageContent() {
    const [isSublocationDialogOpen, setIsSublocationDialogOpen] = useState(true);
    const [sublocation, setSublocation] = useState('Main');
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    
    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if(!authLoading) setLoading(false);
            return;
        }

        const unsub = onSnapshot(collection(db, "users", user.uid, "inventory"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setInventory(items.map(item => ({...item, qoh: item.quantity, count: null, variance: null, uom: 'ea' })));
            setLoading(false);
        });

        return () => unsub();
    }, [user, authLoading]);

    const handleSublocationSelect = () => {
        setIsSublocationDialogOpen(false);
    }
    
    const handleCountChange = (id: string, value: string) => {
        const newInventory = inventory.map(item => {
            if (item.id === id) {
                const count = value === '' ? null : parseInt(value, 10);
                const variance = count !== null ? count - item.qoh : null;
                return {...item, count, variance};
            }
            return item;
        });
        setInventory(newInventory);
    }

    if (!isSublocationDialogOpen && (loading || authLoading)) {
        return (
            <div className="p-8">
                <Skeleton className="h-16 w-1/3 mb-4" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

  return (
    <AuthGuard>
        <Dialog open={isSublocationDialogOpen} onOpenChange={setIsSublocationDialogOpen}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select sublocation for stock take</DialogTitle>
                </DialogHeader>
                <Alert variant="destructive" className="bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200">
                    <AlertTitle className="font-bold">Stock counts have already been entered.</AlertTitle>
                    <AlertDescription>
                       If the sublocation is changed, then the existing stock counts will be applied to the newly selected sublocation.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2 py-4">
                    <label htmlFor="sublocation-select" className="text-sm font-medium">Sublocation:</label>
                    <Select value={sublocation} onValueChange={setSublocation}>
                        <SelectTrigger id="sublocation-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Main">Main</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSublocationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSublocationSelect}>Select sublocation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {!isSublocationDialogOpen && (
             <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                            <ClipboardList className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-semibold">Stock takes</p>
                            <h1 className="text-xl font-bold">Stock take: {sublocation} {format(new Date(), 'MM/dd/yyyy')}</h1>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4"/></Button>
                        <Button>Save changes</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4 mb-6 text-sm">
                    <div>
                        <strong>Status:</strong> <Badge variant="secondary">Never saved</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Commit stock take</Button>
                        <Button variant="outline" size="sm" disabled>Cancel stock take</Button>
                    </div>
                    <div>
                        <strong>Sublocation:</strong> {sublocation} <Button variant="link" className="p-1 h-auto" onClick={() => setIsSublocationDialogOpen(true)}>Change sublocation</Button>
                    </div>
                </div>
                 
                 <div className="flex items-center gap-4 mb-4">
                     <Input placeholder="Search:" className="max-w-xs" />
                     <span className="text-sm">Filters:</span>
                     <Select defaultValue="all-locations"><SelectTrigger className="w-auto"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all-locations">All locations</SelectItem></SelectContent></Select>
                     <Select defaultValue="all-categories"><SelectTrigger className="w-auto"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all-categories">All categories</SelectItem></SelectContent></Select>
                     <Select defaultValue="all-manufacturers"><SelectTrigger className="w-auto"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all-manufacturers">All manufacturers</SelectItem></SelectContent></Select>
                     <Select defaultValue="count-gt-0"><SelectTrigger className="w-auto"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="count-gt-0">QoH or Count > 0</SelectItem></SelectContent></Select>
                     <Input placeholder="All lot ids" className="w-auto" />
                 </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead colSpan={7} className="text-center font-bold">Open Stock</TableHead>
                                <TableHead colSpan={5} className="text-center font-bold border-l">Case Stock</TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-10 p-2 text-center"></TableHead>
                                <TableHead className="p-2 min-w-[150px]"><div className="flex items-center gap-1"><ArrowDown className="w-3 h-3"/>Product ID</div></TableHead>
                                <TableHead className="p-2 min-w-[250px]">Description</TableHead>
                                <TableHead className="p-2 text-right">QoH</TableHead>
                                <TableHead className="p-2 text-right">Count</TableHead>
                                <TableHead className="p-2 text-right">Variance</TableHead>
                                <TableHead className="p-2">UOM</TableHead>
                                <TableHead className="p-2 text-right border-l">QoH</TableHead>
                                <TableHead className="p-2 text-right">Count</TableHead>
                                <TableHead className="p-2 text-right">Variance</TableHead>
                                <TableHead className="p-2">Packing</TableHead>
                                <TableHead className="p-2">Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell></TableCell>
                                    <TableCell className="font-medium text-primary">{item.sku || item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.qoh}</TableCell>
                                    <TableCell className="p-1">
                                        <Input 
                                            type="number" 
                                            className="w-20 text-right h-8"
                                            value={item.count ?? ''}
                                            onChange={(e) => handleCountChange(item.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className={`text-right ${item.variance < 0 ? 'text-red-500' : ''}`}>{item.variance}</TableCell>
                                    <TableCell>{item.uom}</TableCell>
                                    <TableCell className="border-l text-right">0</TableCell>
                                    <TableCell className="p-1"><Input type="number" className="w-20 text-right h-8"/></TableCell>
                                    <TableCell className="text-right">0</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <ChevronDown className="w-4 h-4" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
             </main>
        )}
    </AuthGuard>
  );
}
