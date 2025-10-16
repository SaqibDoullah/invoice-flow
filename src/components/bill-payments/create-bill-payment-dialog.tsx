
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateBillPaymentFromBillDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function CreateBillPaymentFromBillDialog({ isOpen, setIsOpen }: CreateBillPaymentFromBillDialogProps) {
    const [billId, setBillId] = useState('');
    const router = useRouter();

    const handleCreate = () => {
        if (!billId.trim()) return;
        // In a real app, you might want to validate the billId
        // For now, we just navigate.
        router.push('/bill-payments/new');
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Create a new bill payment from bill</DialogTitle>
                </DialogHeader>
                <div className="py-8">
                     <div className="relative">
                        <label htmlFor="bill-search" className="block text-sm font-medium text-gray-700 mb-1">Create a new bill payment from bill</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground mt-2.5" />
                        <Input 
                            id="bill-search"
                            className="pl-10 h-12"
                            value={billId}
                            onChange={(e) => setBillId(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!billId.trim()}>Create a new bill payment from bill</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
