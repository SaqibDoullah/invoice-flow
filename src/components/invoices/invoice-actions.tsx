
'use client';

import { Edit, Trash2, ChevronDown, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { type Invoice } from '@/types';
import StatusBadge from './status-badge';

interface InvoiceActionsProps {
  invoice: Invoice;
  onStatusChange: (status: Invoice['status']) => void;
  onDelete: () => void;
  onGenerateReminder: () => void;
  children?: React.ReactNode;
}

export default function InvoiceActions({
  invoice,
  onStatusChange,
  onDelete,
  onGenerateReminder,
  children,
}: InvoiceActionsProps) {
  const statuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'void'];

  return (
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
        <Button onClick={onGenerateReminder} variant="secondary" className="w-full">
          <Mail className="mr-2 h-4 w-4" /> Generate Reminder
        </Button>
        <Button asChild className="w-full">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Invoice
          </Link>
        </Button>
        {children}

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
        
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
        </Button>

      </CardContent>
    </Card>
  );
}
