
'use client';

import { Edit, Trash2, ChevronDown, CheckCircle, Send, FileCheck, FileX, Printer } from 'lucide-react';
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
import { type Quote } from '@/types';
import StatusBadge from './status-badge';

interface QuoteActionsProps {
  quote: Quote;
  onStatusChange: (status: Quote['status']) => void;
  onDelete: () => void;
}

export default function QuoteActions({
  quote,
  onStatusChange,
  onDelete,
}: QuoteActionsProps) {
  const statuses: Quote['status'][] = ['draft', 'sent', 'accepted', 'declined'];

  const handlePrint = () => {
    const printContent = document.getElementById('quote-print');
    const styles = Array.from(document.styleSheets).map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
        } catch (e) {
          console.warn("Cannot read some CSS rules:", e);
          return "";
        }
      }).join('\\n');

    if (!printContent) return;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;
    
    printWindow.document.write(`<html><head><title>Quote</title><style>${styles}</style></head><body>${printContent.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };


  return (
    <Card className="shadow-sm print:hidden">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full">
            <Send className="mr-2 h-4 w-4" /> Send Quote
        </Button>
        {quote.status !== 'accepted' && (
          <Button onClick={() => onStatusChange('accepted')} className="w-full" variant="secondary">
            <FileCheck className="mr-2 h-4 w-4" /> Mark as Accepted
          </Button>
        )}
         {quote.status !== 'declined' && (
          <Button onClick={() => onStatusChange('declined')} className="w-full" variant="secondary">
            <FileX className="mr-2 h-4 w-4" /> Mark as Declined
          </Button>
        )}
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/quotes/${quote.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Quote
          </Link>
        </Button>
        
        <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" /> Export as PDF
        </Button>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <StatusBadge status={quote.status} />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
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
          <Trash2 className="mr-2 h-4 w-4" /> Delete Quote
        </Button>

      </CardContent>
    </Card>
  );
}
