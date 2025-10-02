'use client';

import { useState, useEffect } from 'react';
import { Copy, Loader2 } from 'lucide-react';
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

const placeholderContent = {
    subject: "Reminder: Invoice [Invoice Number]",
    body: "This is a friendly reminder that invoice [Invoice Number] is due on [Due Date]."
}

export default function GenerateReminderDialog({
  isOpen,
  setIsOpen,
  invoice,
}: GenerateReminderDialogProps) {
  const [emailContent, setEmailContent] = useState(placeholderContent);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog is closed
      setIsLoading(false);
      return;
    }

    const generateEmail = async () => {
      setIsLoading(true);
      try {
        const subject = `Reminder: Invoice ${invoice.invoiceNumber}`;
        const body = `Hi ${invoice.customerName},\n\nThis is a friendly reminder that invoice #${invoice.invoiceNumber} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)} is due on ${format(invoice.dueDate.toDate(), 'PPP')}.\n\nThank you,\n${invoice.companyName || 'Your Company'}`;
        setEmailContent({ subject, body });
      } catch (error) {
        console.error('Error generating reminder:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate reminder email. Please try again.',
        });
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    generateEmail();
  }, [isOpen, invoice, toast, setIsOpen]);
  
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
          <DialogTitle>AI-Generated Reminder</DialogTitle>
          <DialogDescription>
            A polite reminder email has been generated for invoice {invoice.invoiceNumber}. You can copy and send it to your client.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating email...</p>
          </div>
        ) : emailContent ? (
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
        ) : null}
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
