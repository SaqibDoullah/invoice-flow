
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  MessageCircle,
  ImageIcon,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot } from 'firebase/firestore';

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
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type InventoryItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';


type ReorderSummaryItem = {
    id: string;
    desc: string;
    salesVel: string;
    stockout: string;
    onOrder: number;
    sublocations: string;
    stdBuyPrice: number;
    reservations: number;
    remaining: number;
    loc1Avail: number | null;
    loc2Avail: number | null;
    loc3Avail: number | null;
}

type Column = {
  id: string;
  label: string;
  subColumns?: { id: string; label: string }[];
};

const initialColumns: Column[] = [
    { id: 'img', label: 'Img' },
    { id: 'productId', label: 'Product ID' },
    { id: 'description', label: 'Description' },
    { id: 'salesVelocity', label: 'Sales velocity' },
    { id: 'stockout', label: 'Stockout + BOM' },
    { id: 'onOrder', label: 'On order units' },
    { id: 'sublocations', label: 'Sublocations' },
    { id: 'stdBuyPrice', label: 'Std buy price' },
    { id: 'reservations', label: 'Reservations units' },
    { id: 'remaining', label: 'Remaining + BOM units' },
    { id: 'loc1', label: 'Location: Drop Ship', subColumns: [{id: 'loc1Avail', label: 'Avail'}, {id: 'loc1Reorder', label: 'Reorder level'}, {id: 'loc1Variance', label: 'Variance'}] },
    { id: 'loc2', label: 'Location: Marhaba', subColumns: [{id: 'loc2Avail', label: 'Avail'}, {id: 'loc2Reorder', label: 'Reorder level'}, {id: 'loc2Variance', label: 'Variance'}] },
    { id: 'loc3', label: 'Location: Tawakkal Warehouse', subColumns: [{id: 'loc3Avail', label: 'Avail'}, {id: 'loc3Reorder', label: 'Reorder level'}, {id: 'loc3Variance', label: 'Variance'}] },
];

export default function ReorderingSummaryPageContent() {
  const [data, setData] = useState<ReorderSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);
    const itemCollectionRef = collection(db, 'users', user.uid, 'inventory');
    const q = query(itemCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        
        const summaryData: ReorderSummaryItem[] = inventoryData.map(item => ({
            id: item.sku || item.id,
            desc: item.name,
            salesVel: '0.00', // Placeholder
            stockout: '', // Placeholder
            onOrder: item.quantityOnOrder || 0,
            sublocations: item.sublocation || '',
            stdBuyPrice: item.stdBuyPrice || 0,
            reservations: item.quantityReserved || 0,
            remaining: item.quantity || 0,
            loc1Avail: null, // Placeholder for different locations
            loc2Avail: null, // Placeholder for different locations
            loc3Avail: item.quantityAvailable,
        }));

        setData(summaryData);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch reordering summary data.' });
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const renderCell = (item: any, columnId: string) => {
    switch (columnId) {
        case 'img': return <ImageIcon className="w-4 h-4 text-muted-foreground"/>;
        case 'productId': return <span className="font-medium text-primary">{item.id}</span>;
        case 'description': return item.desc;
        case 'salesVelocity': return item.salesVel;
        case 'stockout': return item.stockout;
        case 'onOrder': return item.onOrder;
        case 'sublocations': return item.sublocations;
        case 'stdBuyPrice': return formatCurrency(item.stdBuyPrice);
        case 'reservations': return item.reservations;
        case 'remaining': return item.remaining;
        case 'loc1Avail': return item.loc1Avail;
        case 'loc2Avail': return item.loc2Avail;
        case 'loc3Avail': return item.loc3Avail;
        default: return null;
    }
  }


  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Reordering summary</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Reordering summary</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='outline'>Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize columns</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="reordering-summary" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <p className="text-sm text-muted-foreground my-4">This screen shows quantity on hand and reorder points for each location and product. Use the <Link href="/purchases/reorder" className="text-primary hover:underline">reorder screen</Link> to create a purchase order based on reorder points.</p>

        <div className="mt-4 mb-4 flex flex-wrap items-center gap-4">
            <div className='relative w-48'>
                <Input placeholder="Search..." />
            </div>
            <div className="relative w-48"><Input placeholder="Category" /></div>
            <div className="relative w-48"><Input placeholder="Manufacturer" /></div>
            <div className="relative w-48"><Input placeholder="Status" /></div>
            <div className="relative w-48"><Input placeholder="Supplier" /></div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More filters...</Button>
            <Button variant="ghost" size="icon"><ArrowUpDown className="w-4 h-4" /></Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    {columns.map(col => (
                        <TableHead key={col.id} className="p-2" colSpan={col.subColumns ? col.subColumns.length : 1} >
                            {col.subColumns ? <div className="text-center border-l">{col.label}</div> : col.label}
                        </TableHead>
                    ))}
                  </TableRow>
                  <TableRow className="bg-muted/50 text-xs">
                    {columns.map(col => {
                        if(col.subColumns) {
                           return col.subColumns.map(subCol => (
                               <TableHead key={subCol.id} className="p-2 text-right border-l">{subCol.label}</TableHead>
                           ))
                        }
                        return <TableHead key={col.id} className="p-2"></TableHead>
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow><TableCell colSpan={19} className="h-96"><Skeleton className="h-full w-full" /></TableCell></TableRow>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <TableRow key={item.id} className="text-xs">
                          {columns.map(col => {
                            if (col.subColumns) {
                                return col.subColumns.map(subCol => (
                                    <TableCell key={subCol.id} className="p-2 border-l">{renderCell(item, subCol.id)}</TableCell>
                                ));
                            }
                            return (
                                <TableCell key={col.id} className="p-2">
                                    {renderCell(item, col.id)}
                                </TableCell>
                            );
                          })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={19} className="h-24 text-center">
                        No data found.
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
          
          <CustomizeColumnsDialog 
            isOpen={isCustomizeOpen}
            setIsOpen={setIsCustomizeOpen}
            columns={columns}
            setColumns={setColumns}
          />
      </div>
    </AuthGuard>
  );
}

const CustomizeColumnsDialog = ({
  isOpen,
  setIsOpen,
  columns,
  setColumns,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  columns: Column[];
  setColumns: (columns: Column[]) => void;
}) => {
  const [localColumns, setLocalColumns] = useState(columns);
  const draggingItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Update local state if columns prop changes
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    draggingItem.current = position;
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    const newList = [...localColumns];
    const draggingItemContent = newList[draggingItem.current!];
    newList.splice(draggingItem.current!, 1);
    newList.splice(dragOverItem.current!, 0, draggingItemContent);
    draggingItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setLocalColumns(newList);
  };

  const handleDragEnd = () => {
    draggingItem.current = null;
    dragOverItem.current = null;
  };
  
  const handleSave = () => {
    setColumns(localColumns);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalColumns(columns); // Reset to original order from props
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Drag and drop the columns to reorder them.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            {localColumns.map((col, index) => (
                <div
                    key={col.id}
                    className="flex items-center p-2 border rounded-md bg-muted/50 cursor-grab"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <GripVertical className="mr-2 text-muted-foreground"/>
                    <span>{col.label}</span>
                </div>
            ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
