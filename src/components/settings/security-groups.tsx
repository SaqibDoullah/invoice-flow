
'use client';

import React, 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const permissionsData = [
    { id: 'create_any', permission: 'Create any type of object in the system', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_any', permission: 'Update any object in the system', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any', permission: 'Change any status on any object in the system', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'manage_users', permission: 'Manage users and permissions', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_settings', permission: 'Update any application settings and integrations', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_views', permission: 'Update custom views', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'customize_reports', permission: 'Customize reports', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_po', permission: 'Create purchase order', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_po_all', permission: 'Update any purchase order: all fields', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_po_primary', permission: 'Update any purchase order: primary, address, custom, and notes...', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_po', permission: 'Change any status on any purchase order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_po_editable_committed', permission: 'Change status: Mark editable purchase order committed', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_po_editable_completed', permission: 'Change status: Mark editable purchase order completed', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_po_committed_editable', permission: 'Change status: Mark committed purchase order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_po_committed_completed', permission: 'Change status: Mark committed purchase order completed', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_po_completed_editable', permission: 'Change status: Mark completed purchase order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_po_canceled_editable', permission: 'Change status: Mark canceled purchase order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_po_cancel_editable', permission: 'Change status: Cancel editable purchase order', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_po_cancel_committed', permission: 'Change status: Cancel committed purchase order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_po_cancel_completed', permission: 'Change status: Cancel completed purchase order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'create_shipment', permission: 'Create purchase shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
    { id: 'update_shipment', permission: 'Update any purchase shipment', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_shipment', permission: 'Change any status on any purchase shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_receive_shipment', permission: 'Change status: receive purchase shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_cancel_editable_shipment', permission: 'Change status: cancel editable purchase shipment', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_cancel_any_shipment', permission: 'Change status: cancel any purchase shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'create_bill', permission: 'Create bill', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_bill', permission: 'Update bill', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_bill', permission: 'Change any status on any bill', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_bill_payment', permission: 'Create bill payment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_bill_payment', permission: 'Update bill payment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_bill_payment', permission: 'Change any status on any bill payment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_supplier_credit', permission: 'Create supplier credit', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_supplier_credit', permission: 'Update any supplier credit', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_supplier_credit', permission: 'Change any status on any supplier credit', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_sales_order', permission: 'Create sales order or quote', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_sales_order_all', permission: 'Update any sales order or quote: all fields', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_sales_order_primary', permission: 'Update any sales order or quote: primary, address, custom, and ...', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_sales_order', permission: 'Change any status on any sales order or quote', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_so_editable_committed', permission: 'Change status: Mark editable sales order committed', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_so_editable_completed', permission: 'Change status: Mark editable sales order completed', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_so_committed_editable', permission: 'Change status: Mark committed sales order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_so_committed_completed', permission: 'Change status: Mark committed sales order completed', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_so_completed_editable', permission: 'Change status: Mark completed sales order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_so_canceled_editable', permission: 'Change status: Mark canceled sales order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_so_cancel_editable', permission: 'Change status: Cancel editable sales order', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_so_cancel_committed', permission: 'Change status: Cancel committed sales order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_so_cancel_completed', permission: 'Change status: Cancel completed sales order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'view_pii', permission: 'View PII', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'create_sales_shipment', permission: 'Create sales shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
    { id: 'update_sales_shipment', permission: 'Update any sales shipment', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_sales_shipment', permission: 'Change any status on any sales shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_pack_editable_sales_shipment', permission: 'Change status: pack editable sales shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_ship_editable_sales_shipment', permission: 'Change status: ship editable sales shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_transfer_packed_sales_shipment', permission: 'Change status: transfer packed sales shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_ship_packed_sales_shipment', permission: 'Change status: ship packed sales shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_cancel_editable_sales_shipment', permission: 'Change status: cancel editable sales shipment', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_cancel_any_sales_shipment', permission: 'Change status: cancel any sales shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'create_sales_invoice', permission: 'Create sales invoice', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_sales_invoice', permission: 'Update sales invoice', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_sales_invoice', permission: 'Change any status on any sales invoice', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_sales_invoice_payment', permission: 'Create sales invoice payment', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_sales_invoice_payment', permission: 'Update sales invoice payment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_sales_invoice_payment', permission: 'Change any status on any sales invoice payment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_sales_return', permission: 'Create sales return', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_sales_return', permission: 'Update any sales return', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_sales_return', permission: 'Change any status on any sales return', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_transfer_shipment', permission: 'Create transfer shipment', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_transfer_shipment', permission: 'Update any transfer shipment', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_transfer_shipment', permission: 'Change any status on any transfer shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_ship_editable_transfer_shipment', permission: 'Change status: ship editable transfer shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_receive_shipped_transfer_shipment', permission: 'Change status: receive shipped transfer shipment', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 1 },
    { id: 'change_status_cancel_editable_transfer_shipment', permission: 'Change status: cancel editable transfer shipment', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_cancel_any_transfer_shipment', permission: 'Change status: cancel any transfer shipment', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'create_quick_stock_transfer', permission: 'Create quick stock transfer', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
    { id: 'create_transfer_order', permission: 'Create transfer order', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_transfer_order_all', permission: 'Update any transfer order: all fields', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_transfer_order', permission: 'Change any status on any transfer order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_mark_editable_to_committed_transfer', permission: 'Change status: Mark editable transfer order committed', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_mark_editable_to_completed_transfer', permission: 'Change status: Mark editable transfer order completed', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_mark_committed_to_editable_transfer', permission: 'Change status: Mark committed transfer order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_mark_committed_to_completed_transfer', permission: 'Change status: Mark committed transfer order completed', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_mark_completed_to_editable_transfer', permission: 'Change status: Mark completed transfer order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_mark_canceled_to_editable_transfer', permission: 'Change status: Mark canceled transfer order editable', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_cancel_editable_transfer', permission: 'Change status: Cancel editable transfer order', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 1 },
    { id: 'change_status_cancel_committed_transfer', permission: 'Change status: Cancel committed transfer order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'change_status_cancel_completed_transfer', permission: 'Change status: Cancel completed transfer order', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 1 },
    { id: 'create_stock_take', permission: 'Create stock take', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
    { id: 'update_stock_take', permission: 'Update any stock take', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_stock_take', permission: 'Change any status on any stock take', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_batch_stock_change', permission: 'Create batch stock change', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_batch_stock_change', permission: 'Update any batch stock change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_batch_stock_change', permission: 'Change any status on any batch stock change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_quick_stock_change', permission: 'Create quick stock change', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
    { id: 'change_status_quick_stock_change', permission: 'Change any status on any quick stock change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_supplier', permission: 'Create supplier', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_any_supplier', permission: 'Update any supplier', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_supplier', permission: 'Change any status on any supplier', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_customer', permission: 'Create customer', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 0 },
    { id: 'update_any_customer', permission: 'Update any customer', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_customer', permission: 'Change any status on any customer', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_product', permission: 'Create product', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_product_reorder_tawakkal', permission: 'Update any product, only reorder fields for Tawakkal Warehouse', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'update_product_reorder_marhaba', permission: 'Update any product, only reorder fields for Marhaba', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'update_product_reorder_dropship', permission: 'Update any product, only reorder fields for Drop Ship', owner: true, admin: true, staff: true, staff2: true, staff3: false, level: 1 },
    { id: 'update_product_any_field', permission: 'Update any product, any field', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'change_status_any_product', permission: 'Change any status on any product', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_build', permission: 'Create build', owner: true, admin: true, staff: false, staff2: true, staff3: false, level: 0 },
    { id: 'update_any_build', permission: 'Update any build', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_build', permission: 'Change any status on any build', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_journal_entry', permission: 'Create journal entry', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_journal_entry', permission: 'Update journal entry', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_journal_entry', permission: 'Change any status on any journal entry', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'create_avg_cost_change', permission: 'Create average cost change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_avg_cost_change', permission: 'Update average cost change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_avg_cost_change', permission: 'Change any status on any average cost change', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'update_consolidation', permission: 'Update consolidation', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'change_status_any_consolidation', permission: 'Change any status on any consolidation', owner: true, admin: true, staff: false, staff2: false, staff3: false, level: 0 },
    { id: 'view_dashboard_summary', permission: 'View summary of any field on any object in dashboard', owner: true, admin: true, staff: true, staff2: true, staff3: true, level: 0 },
];


type PermissionState = typeof permissionsData;

export default function SecurityGroups() {
    const [permissions, setPermissions] = React.useState<PermissionState>(permissionsData);

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
                                        <TableCell style={{ paddingLeft: `${p.level * 2 + 1}rem` }}>{p.permission}</TableCell>
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
