
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, where, addDoc } from 'firebase/firestore';
import { Plus, MoreHorizontal, Edit, Trash2, Home, ChevronRight, Upload, Download, Settings2, ShieldAlert, ChevronDown } from 'lucide-react';
import Link from 'next/link';

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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { getFirestoreDb } from '@/lib/firebase-client';
import { type Supplier, SupplierFormData, supplierSchema } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import AddSupplierDialog from '@/components/suppliers/add-supplier-dialog';
import EditSupplierDialog from '@/components/suppliers/edit-supplier-dialog';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const importInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
    
    const conditions = [];
    if (statusFilter !== 'all') {
        conditions.push(where('status', '==', statusFilter));
    }
    
    const q = query(supplierCollectionRef, ...conditions);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let suppliersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        
        if (searchTerm) {
            suppliersList = suppliersList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setSuppliers(suppliersList);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: supplierCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        if (serverError.code !== 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Error Fetching Suppliers",
                description: `Code: ${serverError.code}. ${serverError.message}`,
            });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, toast, searchTerm, statusFilter]);

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditSupplierOpen(true);
  };
  
  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    const db = getFirestoreDb();
    if (!selectedSupplier || !user || !db) return;

    const docRef = doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id);
    deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success',
                description: 'Supplier deleted successfully.',
            });
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);

            if (serverError.code !== 'permission-denied') {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete supplier.',
                });
            }
        })
        .finally(() => {
            setIsDeleteDialogOpen(false);
            setSelectedSupplier(null);
        })
  }

    const handleExportCSV = () => {
        if (!suppliers.length) {
            toast({
                variant: 'destructive',
                title: 'No Suppliers',
                description: 'There are no suppliers to export.',
            });
            return;
        }

        const headers = ['Status', 'Name', 'Contact Name', 'Primary Phone Number', 'Primary Email Addresses', 'Primary Address'];
        const csvContent = [
            headers.join(','),
            ...suppliers.map(s => [
                s.status,
                `"${s.name.replace(/"/g, '""')}"`,
                `"${(s.contactName || '').replace(/"/g, '""')}"`,
                `"${(s.phoneNumber || '').replace(/"/g, '""')}"`,
                `"${(s.email || '').replace(/"/g, '""')}"`,
                `"${(s.address || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'suppliers.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        
        const db = getFirestoreDb();
        if (!user || !db) return;

        const lines = text.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['Status', 'Name', 'Contact Name', 'Primary Phone Number', 'Primary Email Addresses', 'Primary Address'];
        
        const supplierCollectionRef = collection(db, 'users', user.uid, 'suppliers');
        
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const supplierData: Partial<SupplierFormData> = {
                status: 'active'
            };

            headers.forEach((header, index) => {
                const value = values[index]?.trim().replace(/^"|"$/g, '');
                if (header === 'Status') supplierData.status = (value === 'active' || value === 'inactive') ? value : 'active';
                if (header === 'Name') supplierData.name = value;
                if (header === 'Contact Name') supplierData.contactName = value;
                if (header === 'Primary Phone Number') supplierData.phoneNumber = value;
                if (header === 'Primary Email Addresses') supplierData.email = value;
                if (header === 'Primary Address') supplierData.address = value;
            });

            try {
                // Validate before adding
                const validatedData = supplierSchema.parse(supplierData);
                await addDoc(supplierCollectionRef, validatedData);
                importedCount++;
            } catch (err) {
                 console.error(`Skipping row ${i+1} due to validation/import error:`, err);
            }
        }
        
        toast({
            title: 'Import Complete',
            description: `Successfully imported ${importedCount} out of ${lines.length - 1} records.`,
        });
    };
    reader.readAsText(file);

    // Reset file input
    if(importInputRef.current) {
        importInputRef.current.value = '';
    }
  };


  return (
    <AuthGuard>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Suppliers</span>
            </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Suppliers:</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-3xl font-bold p-0 -ml-1">
                        Default
                        <ChevronDown className="w-6 h-6 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>SAVED VIEWS</DropdownMenuLabel>
                        <DropdownMenuItem>Default</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Save filter values to Default</DropdownMenuItem>
                        <DropdownMenuItem>Customize columns in Default</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate current view</DropdownMenuItem>
                        <DropdownMenuItem>Restore deleted view</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddSupplierOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Supplier
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => importInputRef.current?.click()}>
                           Import CSV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <input
                    type="file"
                    ref={importInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleImportCSV}
                />
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                         <DropdownMenuItem onSelect={handleExportCSV}>
                            Export CSV
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Settings2 className="mr-2 h-4 w-4" /> Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Action 1</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </div>
          
          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                 <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Created date" />
                    </SelectTrigger>
                 </Select>
                 <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Last updated date" />
                    </SelectTrigger>
                 </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span>Filtered: You do not have authorization to view this summary.</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading || authLoading ? (
                <div className="p-6 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Primary Phone Number</TableHead>
                      <TableHead>Primary Email Addresses</TableHead>
                      <TableHead>Primary Address</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'} className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                                {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contactName}</TableCell>
                          <TableCell>{supplier.phoneNumber}</TableCell>
                          <TableCell>{supplier.email}</TableCell>
                          <TableCell>{supplier.address}</TableCell>
                           <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditClick(supplier)} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-destructive focus:text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                           </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
        <AddSupplierDialog
          isOpen={isAddSupplierOpen}
          setIsOpen={setIsAddSupplierOpen}
          onSupplierAdded={() => { /* Real-time listener handles updates */ }}
        />
        {selectedSupplier && (
            <EditSupplierDialog
                isOpen={isEditSupplierOpen}
                setIsOpen={setIsEditSupplierOpen}
                supplier={selectedSupplier}
                onSupplierUpdated={() => { /* Real-time listener handles updates */ }}
            />
        )}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this supplier.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                Continue
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
