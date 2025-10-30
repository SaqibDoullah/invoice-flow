
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Triangle, Check, ChevronDown } from 'lucide-react';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CustomizeColumnsDialog from '@/components/inventory/stock-takes/customize-columns-dialog';
import { useToast } from '@/hooks/use-toast';

type Column = {
  id: string;
  label: string;
};

const initialColumns: Column[] = [
    { id: 'productId', label: 'Product ID' },
    { id: 'description', label: 'Description' },
    { id: 'lotId', label: 'Lot ID' },
    { id: 'qoh', label: 'QoH' },
    { id: 'qtyChange', label: 'Qty change' },
    { id: 'newQty', label: 'New qty' },
    { id: 'reason', label: 'Reason' },
    { id: 'comments', label: 'Comments' },
];

export default function CreateBatchStockChangePageContent() {
    const today = new Date();
    const { toast } = useToast();
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

    const showComingSoon = () => {
        toast({
            title: 'Coming Soon',
            description: 'This feature is not yet implemented.',
        });
    };
    
    return (
        <AuthGuard>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                            <Triangle className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                             <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">Stock changes</p>
                             <h1 className="text-xl font-bold tracking-tight">Batch stock change: {format(today, 'MM/dd/yyyy')}</h1>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions <ChevronDown className="ml-2 h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent>
                                <DropdownMenuItem onSelect={showComingSoon}>Stock change to PDF</DropdownMenuItem>
                                <DropdownMenuItem onSelect={showComingSoon}>Stock change to Excel</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setIsCustomizeOpen(true)}>Customize this screen</DropdownMenuItem>
                                <DropdownMenuItem onSelect={showComingSoon}>Customize stock variance reasons</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button><Check className="mr-2 h-4 w-4" /> Save changes</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4 mb-6 text-sm">
                    <div>
                        <strong>Status:</strong> <Badge variant="secondary">Never saved</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Commit batch stock change</Button>
                        <Button variant="outline" size="sm" disabled>Cancel batch stock change</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div className="flex items-center gap-2">
                         <label className="text-sm font-medium">Reason:</label>
                         <Button variant="link" className="p-0 h-auto">Batch update reason</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-1">
                             <label className="text-sm font-medium">Sublocation:</label>
                              <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Unspecified --" />
                                </SelectTrigger>
                            </Select>
                         </div>
                         <div className="space-y-1">
                             <label className="text-sm font-medium">Date of change:</label>
                             <Input type="date" defaultValue={format(today, 'yyyy-MM-dd')} />
                         </div>
                         <div className="space-y-1">
                              <label className="text-sm font-medium">Note:</label>
                              <Input />
                         </div>
                    </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                {columns.map(col => (
                                    <TableHead key={col.id} className="p-2">
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={columns.length} className="p-4 text-center text-muted-foreground">
                                    Type on the last line to add an item. Additional lines are automatically added.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
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

