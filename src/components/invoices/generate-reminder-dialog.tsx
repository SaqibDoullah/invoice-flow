'use client';

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type Invoice } from '@/types';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface GenerateReminderDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  invoice: Invoice;
}

export default function GenerateReminderDialog({
  isOpen,
  setIsOpen,
  invoice,
}: GenerateReminderDialogProps) {
  const [emailContent, setEmailContent] = useState({ subject: '', body: ''});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        const subject = `Reminder: Invoice ${invoice.invoiceNumber}`;
        const body = `Hi ${invoice.customerName},\n\nThis is a friendly reminder that invoice #${invoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)} is due on ${format(invoice.dueDate.toDate(), 'PPP')}.\n\nThank you,\n${invoice.companyName || 'Your Company'}`;
        setEmailContent({ subject, body });
    }
  }, [isOpen, invoice]);
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${fieldName} has been copied.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Reminder</DialogTitle>
          <DialogDescription>
            A polite reminder email has been generated for invoice {invoice.invoiceNumber}. You can copy and send it to your client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor='email-subject'>Subject</Label>
                <div className="flex items-center gap-2">
                    <Input id="email-subject" readOnly value={emailContent.subject} />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.subject, 'Subject')}>
                        <Copy />
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor='email-body'>Body</Label>
                <div className="flex items-center gap-2">
                    <Textarea id="email-body" readOnly value={emailContent.body} className="h-64" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.body, 'Email body')}>
                        <Copy />
                    </Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
