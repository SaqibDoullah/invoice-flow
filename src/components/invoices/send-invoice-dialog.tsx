'use client';

import { useState, useEffect, useTransition } from 'react';
import { Copy, Loader2, Send } from 'lucide-react';
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
import { sendInvoiceWithAttachment } from '@/app/actions/send-invoice';

interface SendInvoiceDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  invoice: Invoice;
  onEmailSent: () => void;
}

export default function SendInvoiceDialog({
  isOpen,
  setIsOpen,
  invoice,
  onEmailSent,
}: SendInvoiceDialogProps) {
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setIsGenerating(false);
      return;
    }

    const generateEmailBody = () => {
      setIsGenerating(true);
      try {
        const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.companyName || 'Your Company'}`;
        const body = `Hi ${invoice.customerName},\n\nPlease find your invoice #${invoice.invoiceNumber} attached.\n\nThe total amount of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total)} is due on ${format(invoice.dueDate.toDate(), 'PPP')}.\n\nThank you for your business!\n${invoice.companyName || 'Your Company'}`;
        setEmailContent({ subject, body });
      } catch (error) {
        console.error('Error generating invoice email body:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate email content.',
        });
        setIsOpen(false);
      } finally {
        setIsGenerating(false);
      }
    };

    generateEmailBody();
  }, [isOpen, invoice, toast, setIsOpen]);
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${fieldName} has been copied.`,
    });
  };

  const handleSend = async () => {
    startTransition(async () => {
        const formData = new FormData();
        // FormData can't handle complex objects, so we stringify it
        formData.append('invoice', JSON.stringify(invoice));
        formData.append('subject', emailContent.subject);
        formData.append('body', emailContent.body);

        const result = await sendInvoiceWithAttachment(formData);

        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
            onEmailSent();
            setIsOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to Send Email',
                description: result.message || 'An unexpected error occurred.',
            });
        }
    });
  };

  const isSending = isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Invoice #{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            An email has been drafted for you. This will be sent with a PDF attachment of the invoice.
          </DialogDescription>
        </DialogHeader>
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating email...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor='email-recipient'>Recipient</Label>
                 <Input id="email-recipient" readOnly value={invoice.customerEmail} />
            </div>
            <div className="space-y-2">
                <Label htmlFor='email-subject'>Subject</Label>
                <div className="flex items-center gap-2">
                    <Input id="email-subject" value={emailContent.subject} onChange={(e) => setEmailContent({...emailContent, subject: e.target.value })} />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.subject, 'Subject')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor='email-body'>Body</Label>
                <div className="flex items-center gap-2">
                    <Textarea id="email-body" value={emailContent.body} onChange={(e) => setEmailContent({...emailContent, body: e.target.value })} className="h-64" />
                     <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.body, 'Email body')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>Cancel</Button>
          <Button onClick={handleSend} disabled={isGenerating || isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
