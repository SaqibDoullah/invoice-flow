'use client';

import { Edit, Printer, Trash2, ChevronDown, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
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
import { type Invoice } from '@/types';
import StatusBadge from './status-badge';
import GenerateReminderDialog from './generate-reminder-dialog';

interface InvoiceActionsProps {
  invoice: Invoice;
  onPrint: () => void;
  onStatusChange: (status: Invoice['status']) => void;
  onDelete: () => void;
}

export default function InvoiceActions({
  invoice,
  onPrint,
  onStatusChange,
  onDelete,
}: InvoiceActionsProps) {
  const statuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'void'];
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoice.status !== 'paid' && (
              <Button onClick={() => onStatusChange('paid')} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
              </Button>
          )}
           <Button onClick={() => setIsReminderDialogOpen(true)} variant="secondary" className="w-full">
              <Mail className="mr-2 h-4 w-4" /> Generate Reminder
            </Button>
          <Button asChild className="w-full">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Invoice
            </Link>
          </Button>
          <Button variant="outline" onClick={onPrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" /> Export as PDF
          </Button>

          <Separator />

          <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <StatusBadge status={invoice.status} />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {statuses.map(status => (
                    <DropdownMenuItem key={status} onSelect={() => onStatusChange(status)} className="cursor-pointer">
                      <StatusBadge status={status} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          
          <Separator />
          
          <Button variant="destructive" className="w-full" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
          </Button>

        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this invoice and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GenerateReminderDialog
        isOpen={isReminderDialogOpen}
        setIsOpen={setIsReminderDialogOpen}
        invoice={invoice}
      />
    </>
  );
}
