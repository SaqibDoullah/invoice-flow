'use client';

import { useState, useEffect } from 'react';
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
import {
  generateInvoiceEmail,
  type GenerateInvoiceEmailOutput,
} from '@/ai/flows/generate-invoice-email-flow';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
  const [emailContent, setEmailContent] = useState<GenerateInvoiceEmailOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setEmailContent(null);
      setIsLoading(false);
      return;
    }

    const generateEmail = async () => {
      setIsLoading(true);
      try {
        const invoiceLink = `${window.location.origin}/invoices/${invoice.id}`;
        const input = {
          customerName: invoice.customerName,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: format(invoice.dueDate.toDate(), 'PPP'),
          totalAmount: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(invoice.total),
          invoiceLink,
        };
        const response = await generateInvoiceEmail(input);
        setEmailContent(response);
      } catch (error) {
        console.error('Error generating invoice email:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate invoice email. Please try again.',
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

  const handleSend = () => {
      if (!emailContent) return;

      const subject = encodeURIComponent(emailContent.subject);
      const body = encodeURIComponent(emailContent.body);
      const mailtoLink = `mailto:${invoice.customerEmail}?subject=${subject}&body=${body}`;
      
      window.open(mailtoLink, '_blank');
      onEmailSent();
      setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draft Invoice Email for Invoice #{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            An email has been drafted for you. Click "Send with Email Client" to open it in your default mail app.
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
                <Label htmlFor='email-recipient'>Recipient</Label>
                 <Input id="email-recipient" readOnly value={invoice.customerEmail} />
            </div>
            <div className="space-y-2">
                <Label htmlFor='email-subject'>Subject</Label>
                <div className="flex items-center gap-2">
                    <Input id="email-subject" readOnly value={emailContent.subject} />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.subject, 'Subject')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor='email-body'>Body</Label>
                <div className="flex items-center gap-2">
                    <Textarea id="email-body" readOnly value={emailContent.body} className="h-64" />
                     <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailContent.body, 'Email body')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={isLoading || !emailContent}>
              <Send className="mr-2 h-4 w-4" />
              Send with Email Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
