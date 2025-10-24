
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type PurchaseOrder } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface CreateBillFromOrderDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function CreateBillFromOrderDialog({ isOpen, setIsOpen }: CreateBillFromOrderDialogProps) {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;

        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        const ordersCollectionRef = collection(db, 'users', user.uid, 'purchaseOrders');
        const q = query(ordersCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching purchase orders:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch purchase orders.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, isOpen, toast]);
    
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const lowercasedFilter = searchTerm.toLowerCase();
        return orders.filter(order =>
            order.orderId.toLowerCase().includes(lowercasedFilter) ||
            order.supplierName.toLowerCase().includes(lowercasedFilter)
        );
    }, [orders, searchTerm]);

    const handleSelectOrder = (orderId: string) => {
        router.push(`/purchases/${orderId}`);
        setIsOpen(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Create a new bill from order</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                     <div className="relative mb-4">
                        <label htmlFor="bill-search" className="block text-sm font-medium text-gray-700 mb-1">Create a new bill from order</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground mt-2.5" />
                        <Input 
                            id="bill-search"
                            className="pl-10 h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Order ID or Supplier"
                        />
                    </div>
                    <ScrollArea className="h-72 w-full rounded-md border">
                       <div className="p-4">
                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <div 
                                        key={order.id} 
                                        onClick={() => handleSelectOrder(order.orderId)}
                                        className="p-2 -mx-2 rounded-md hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                                    >
                                        <span className="font-mono text-primary">{order.orderId}</span>
                                        <span>{order.supplierName}</span>
                                        <span className="text-muted-foreground">{format(order.orderDate, 'M/d/yyyy')}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No purchase orders found.</p>
                            )}
                       </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
