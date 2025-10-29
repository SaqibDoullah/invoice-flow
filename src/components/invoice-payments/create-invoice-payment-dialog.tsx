
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Search } from 'lucide-react';
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
import { type Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface CreateInvoicePaymentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};

export default function CreateInvoicePaymentDialog({ isOpen, setIsOpen }: CreateInvoicePaymentDialogProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
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
        // We only care about invoices that have a balance, i.e., not paid or void
        const invoicesCollectionRef = collection(db, 'users', user.uid, 'invoices');
        const q = query(invoicesCollectionRef, where('status', 'in', ['sent', 'draft']));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
            setInvoices(invoicesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching invoices:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch invoices.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, isOpen, toast]);
    
    const filteredInvoices = useMemo(() => {
        if (!searchTerm) return invoices;
        const lowercasedFilter = searchTerm.toLowerCase();
        return invoices.filter(invoice =>
            invoice.invoiceNumber.toLowerCase().includes(lowercasedFilter) ||
            invoice.customerName.toLowerCase().includes(lowercasedFilter)
        );
    }, [invoices, searchTerm]);
    
    const handleSelectInvoice = (invoiceId: string) => {
        router.push(`/invoice-payments/new/${invoiceId}`);
        setIsOpen(false);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Create a new invoice payment from invoice</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                     <div className="relative mb-4">
                        <label htmlFor="invoice-search" className="block text-sm font-medium text-gray-700 mb-1">Create a new invoice payment from invoice</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground mt-2.5" />
                        <Input 
                            id="invoice-search"
                            className="pl-10 h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Invoice # or Customer"
                        />
                    </div>
                    <ScrollArea className="h-72 w-full rounded-md border">
                       <div className="p-4">
                            {loading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                                </div>
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map(invoice => (
                                    <div 
                                        key={invoice.id} 
                                        onClick={() => handleSelectInvoice(invoice.id)}
                                        className="p-2 -mx-2 rounded-md hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                                    >
                                        <div className="font-mono text-primary">
                                            {invoice.invoiceNumber}: {invoice.customerName}
                                        </div>
                                        <div className="text-muted-foreground">
                                            (balance: {formatCurrency(invoice.total)})
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No outstanding invoices found.</p>
                            )}
                       </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
