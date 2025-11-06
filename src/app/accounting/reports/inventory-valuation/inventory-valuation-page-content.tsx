
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  FileText,
  ChevronDown,
  Printer,
  Download,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import { collection, onSnapshot, query } from 'firebase/firestore';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type InventoryItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';


export default function InventoryValuationPageContent() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
    const inventoryCollectionRef = collection(db, 'users', user.uid, 'inventory');
    const q = query(inventoryCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventory(inventoryData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: inventoryCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch inventory data.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const totalValue = inventory.reduce((acc, curr) => acc + ((curr.averageCost || 0) * (curr.quantity || 0)), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <AuthGuard>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/accounting" className="hover:text-foreground">
                Accounting
            </Link>
             <ChevronRight className="w-4 h-4" />
             <Link href="/reports" className="hover:text-foreground">
                Reports
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Inventory Valuation</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <FileText className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inventory Valuation</h1>
                <p className="text-muted-foreground">As of {format(new Date(), 'PPP')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        Export <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">Customize</Button>
          </div>
        </div>

        <Card className="mb-6">
            <CardContent className="p-4 flex gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-sm font-medium">As of date</label>
                    <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-48"/>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity on Hand</TableHead>
                    <TableHead className="text-right">Average Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || authLoading ? (
                      <TableRow><TableCell colSpan={5} className="h-24"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ) : inventory.length > 0 ? (
                    inventory.map((item) => {
                      const itemTotalValue = (item.averageCost || 0) * (item.quantity || 0);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.sku || item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right font-mono">{item.quantity || 0}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(item.averageCost || 0)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(itemTotalValue)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No inventory items found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>Total Inventory Value</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalValue)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
    </AuthGuard>
  );
}
