'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const permissionsData = [
  { id: 'create_any', permission: 'Create any type of object in the system', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
  { id: 'update_any', permission: 'Update any object in the system', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_any', permission: 'Change any status on any object in the system', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
  { id: 'manage_users', permission: 'Manage users and permissions', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'update_settings', permission: 'Update any application settings and integrations', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'update_views', permission: 'Update custom views', owner: true, admin: false, staff: true, staff2: true, staff3: false, level: 0 },
  { id: 'customize_reports', permission: 'Customize reports', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 0 },
  { id: 'create_po', permission: 'Create purchase order', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 0 },
  { id: 'update_po_all', permission: 'Update any purchase order: all fields', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'update_po_primary', permission: 'Update any purchase order: primary, address, custom, and notes...', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_po', permission: 'Change any status on any purchase order', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_po_editable_committed', permission: 'Change status: Mark editable purchase order committed', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 1 },
  { id: 'change_status_po_editable_completed', permission: 'Change status: Mark editable purchase order completed', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 1 },
  { id: 'change_status_po_committed_editable', permission: 'Change status: Mark committed purchase order editable', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 1 },
  { id: 'change_status_po_committed_completed', permission: 'Change status: Mark committed purchase order completed', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 1 },
  { id: 'change_status_po_completed_editable', permission: 'Change status: Mark completed purchase order editable', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_po_canceled_editable', permission: 'Change status: Mark canceled purchase order editable', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_po_cancel_editable', permission: 'Change status: Cancel editable purchase order', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_po_cancel_committed', permission: 'Change status: Cancel committed purchase order', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_po_cancel_completed', permission: 'Change status: Cancel completed purchase order', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'create_shipment', permission: 'Create purchase shipment', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 0 },
  { id: 'update_shipment', permission: 'Update any purchase shipment', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_shipment', permission: 'Change any status on any purchase shipment', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_receive_shipment', permission: 'Change status: receive purchase shipment', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_cancel_editable_shipment', permission: 'Change status: cancel editable purchase shipment', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'change_status_cancel_any_shipment', permission: 'Change status: cancel any purchase shipment', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 1 },
  { id: 'create_bill', permission: 'Create bill', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 0 },
  { id: 'update_bill', permission: 'Update bill', owner: true, admin: false, staff: false, staff2: false, staff3: false, level: 0 },
  { id: 'change_status_bill', permission: 'Change any status on any bill', owner: true, admin: false, staff: false, staff2: true, staff3: false, level: 0 },
];

type PermissionState = typeof permissionsData;

export default function SecurityGroups() {
    const [permissions, setPermissions] = useState<PermissionState>(permissionsData);

    const handleCheckboxChange = (permissionId: string, role: keyof Omit<typeof permissionsData[0], 'id' | 'permission' | 'level'>) => {
        setPermissions(prev =>
            prev.map(p =>
                p.id === permissionId ? { ...p, [role]: !p[role] } : p
            )
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Security groups</h2>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Permission</TableHead>
                                    <TableHead className="text-center">Owner</TableHead>
                                    <TableHead className="text-center">Admin</TableHead>
                                    <TableHead className="text-center">Staff</TableHead>
                                    <TableHead className="text-center">Staff 2</TableHead>
                                    <TableHead className="text-center">Staff 3</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell style={{ paddingLeft: `${p.level * 2}rem` }}>{p.permission}</TableCell>
                                        <TableCell className="text-center"><Checkbox checked={p.owner} onCheckedChange={() => handleCheckboxChange(p.id, 'owner')} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={p.admin} onCheckedChange={() => handleCheckboxChange(p.id, 'admin')} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={p.staff} onCheckedChange={() => handleCheckboxChange(p.id, 'staff')} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={p.staff2} onCheckedChange={() => handleCheckboxChange(p.id, 'staff2')} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={p.staff3} onCheckedChange={() => handleCheckboxChange(p.id, 'staff3')} /></TableCell>
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