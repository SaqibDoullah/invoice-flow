
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  Search,
  ChevronDown,
  History,
  ShieldAlert,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { type StockHistoryEntry } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

type Column = {
  id: keyof StockHistoryEntry | 'id'; // allow 'id' for key prop
  label: string;
};

const initialColumns: Column[] = [
    { id: 'warning', label: 'Warning' },
    { id: 'recordDate', label: 'Record date' },
    { id: 'user', label: 'Transaction user' },
    { id: 'timestamp', label: 'Transaction timestamp' },
    { id: 'productId', label: 'Product ID' },
    { id: 'description', label: 'Description' },
    { id: 'sublocation', label: 'Sublocation' },
    { id: 'packing', label: 'Packing' },
    { id: 'lotId', label: 'Lot ID' },
    { id: 'transaction', label: 'Transaction' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'onHand', label: 'Quantity on hand units' },
    { id: 'avgCost', label: 'Transaction average cost' },
    { id: 'amount', label: 'Amount' },
    { id: 'balance', label: 'Valuation balance' },
    { id: 'details', label: 'Transaction details' },
];


export default function StockHistoryPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [historyData, setHistoryData] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);
    const historyCollectionRef = collection(db, 'users', user.uid, 'stockHistory');
    const q = query(historyCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHistoryEntry));
        setHistoryData(data);
        setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        
        if (serverError.code !== 'permission-denied') {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch stock history.' });
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
  
  const renderCell = (item: any, columnId: keyof StockHistoryEntry | 'id') => {
      if (columnId === 'id') return null;
      const value = item[columnId];
      switch (columnId) {
          case 'productId':
              return <span className="font-medium text-primary">{value}</span>;
          case 'transaction':
              return <span className="text-primary">{value}</span>;
          case 'onHand':
              return value?.toLocaleString();
          case 'avgCost':
              return value?.toFixed(6);
          case 'amount':
          case 'balance':
              return formatCurrency(value);
          case 'recordDate':
          case 'timestamp':
              return value?.toDate ? value.toDate().toLocaleDateString() : value;
          default:
              return value;
      }
  };


  return (
    <AuthGuard>
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>Stock history</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <History className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Stock history:</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-3xl font-bold p-0">
                  Default
                  <ChevronDown className="w-6 h-6 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Default</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Export</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions <ChevronDown className="ml-2 w-4 h-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize columns</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="stock-history" onValueChange={(value) => router.push(`/inventory/${value}`)}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-lookup">Product lookups</TabsTrigger>
            <TabsTrigger value="reordering-summary">Reordering summary</TabsTrigger>
            <TabsTrigger value="stock-history">Stock history</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select defaultValue="30-days">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30-days">From 30 days ago</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative"><Input placeholder="Transaction user" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Product" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Warning" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <div className="relative"><Input placeholder="Location" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div>
                <Button variant="outline">More: 1</Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <ShieldAlert className='w-4 h-4 text-orange-500' />
                <span>Filtered: You do not have authorization to view this summary.</span>
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    {columns.map(col => (
                        <TableHead key={col.id} className={['quantity', 'onHand', 'avgCost', 'amount', 'balance'].includes(col.id) ? 'text-right' : ''}>
                            {col.label}
                        </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                  ) : historyData.length > 0 ? (
                    historyData.map((item) => (
                      <TableRow key={item.id} className="text-xs">
                          {columns.map(col => (
                              <TableCell key={col.id} className={['quantity', 'onHand', 'avgCost', 'amount', 'balance'].includes(col.id) ? 'text-right' : ''}>
                                  {renderCell(item, col.id)}
                              </TableCell>
                          ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
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
    setLocalColumns(columns);
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
        <div className="py-4 space-y-2 max-h-[400px] overflow-y-auto">
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
