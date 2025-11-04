
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';
import { type Location, locationSchema } from '@/types';
import { Skeleton } from '../ui/skeleton';


const sublocationsData = [
    { type: 'User', status: 'Active', name: 'Main', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-01-A', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-01-C', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-01-D', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-01-B', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-02-A', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-02-B', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-02-C', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-02-D', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
    { type: 'User', status: 'Active', name: 'A1-03-A', location: 'Tawakkal Warehouse', purchase: true, returns: true, sale: true },
];


export default function FacilitySettings() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const db = getFirestoreDb();
        if (!user || authLoading || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        const locationsCollectionRef = collection(db, 'users', user.uid, 'locations');
        const unsubscribe = onSnapshot(locationsCollectionRef, (snapshot) => {
            const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
            setLocations(locationsData);
            setLoading(false);
        }, (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: locationsCollectionRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            if (serverError.code !== 'permission-denied') {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch locations.'});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);
    
    const handleLocationChange = (id: string, field: keyof Location, value: string) => {
        const updatedLocations = locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc);
        setLocations(updatedLocations);
    };

    const handleLocationBlur = async (id: string, field: keyof Location) => {
        const db = getFirestoreDb();
        if (!user || !db) return;

        const location = locations.find(loc => loc.id === id);
        if (!location) return;

        const docRef = doc(db, 'users', user.uid, 'locations', id);
        try {
            await updateDoc(docRef, { [field]: location[field] });
        } catch (error) {
            console.error("Failed to update location:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save location change.' });
        }
    };

    const handleAddLocation = async () => {
        const db = getFirestoreDb();
        if (!user || !db) return;
        const newLocation: Omit<Location, 'id'> = { name: '', type: 'User', status: 'Active' };
        try {
            await addDoc(collection(db, 'users', user.uid, 'locations'), newLocation);
        } catch (error) {
            console.error("Failed to add location:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add new location.' });
        }
    };

    const handleDeactivateLocation = async (id: string) => {
         const db = getFirestoreDb();
        if (!user || !db) return;
        const docRef = doc(db, 'users', user.uid, 'locations', id);
        try {
            await updateDoc(docRef, { status: 'Inactive' });
            toast({ title: 'Success', description: 'Location deactivated.'});
        } catch (error) {
             console.error("Failed to deactivate location:", error);
             toast({ variant: 'destructive', title: 'Error', description: 'Could not deactivate location.' });
        }
    }


    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Locations</h2>
                    <div>
                        <Button variant="outline">Import locations</Button>
                        <Button variant="outline" className="ml-2">Export locations</Button>
                    </div>
                </div>
                <p className="text-muted-foreground mt-2">
                    Finale tracks stock quantities in two levels of hierarchy. Location is the higher level, usually corresponding to a facility with a physical address. System locations are managed automatically by integrations.
                </p>
            </div>
            
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <Select defaultValue="active">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Filter locations by status: Active</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select defaultValue="user">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Filter locations by type: User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>State/region</TableHead>
                                    <TableHead>Postal code</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={9} className="h-24 text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ) : (
                                    locations.map((loc, i) => (
                                        <TableRow key={loc.id}>
                                            <TableCell>{loc.type}</TableCell>
                                            <TableCell>{loc.status}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={loc.name} 
                                                    onChange={(e) => handleLocationChange(loc.id, 'name', e.target.value)}
                                                    onBlur={() => handleLocationBlur(loc.id, 'name')}
                                                    className="border-none focus-visible:ring-0" 
                                                />
                                            </TableCell>
                                            <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                            <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                            <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                            <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                            <TableCell><Input className="border-none focus-visible:ring-0" /></TableCell>
                                            <TableCell>
                                                {loc.status === 'Active' && (
                                                    <Button variant="link" className="text-destructive p-0 h-auto" onClick={() => handleDeactivateLocation(loc.id)}>deactivate</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Button variant="link" onClick={handleAddLocation} className="p-0 h-auto text-sm">
                                            Enter as many locations as required. Additional rows are automatically added.
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Location address presets for orders:</label>
                        <Select>
                            <SelectTrigger className="w-[400px]">
                                <SelectValue placeholder="Include locations as [Company name] - [Location address]" />
                            </SelectTrigger>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Sublocations</h2>
                     <div>
                        <Button variant="outline">Import sublocations</Button>
                        <Button variant="outline" className="ml-2">Export sublocations</Button>
                    </div>
                </div>
                <p className="text-muted-foreground mt-2">
                   Sublocations are the lower level of the stock keeping hierarchy, e.g. a bay, a room, a section, or any storage area within a location. By convention, sublocations names are uppercase and short (e.g., M0, M1). System sublocations are managed automatically by integrations.
                </p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                     <div className="flex items-center gap-4">
                        <Select defaultValue="active">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Filter sublocations by status: Active</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select defaultValue="user">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Filter locations by type: User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sublocation name</TableHead>
                                    <TableHead>Location name</TableHead>
                                    <TableHead>Purchase receiving</TableHead>
                                    <TableHead>Return receiving</TableHead>
                                    <TableHead>Sale shipping</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sublocationsData.map((sub, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{sub.type}</TableCell>
                                        <TableCell>{sub.status}</TableCell>
                                        <TableCell>{sub.name}</TableCell>
                                        <TableCell>{sub.location}</TableCell>
                                        <TableCell className="text-center"><Checkbox checked={sub.purchase} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={sub.returns} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={sub.sale} /></TableCell>
                                        <TableCell><Button variant="link" className="text-destructive p-0 h-auto">deactivate</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
