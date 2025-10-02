'use client';
import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Printer } from 'lucide-react';

export function ExportButton() {
  const handlePrint = useCallback(() => {
    const printContent = document.getElementById('invoice-print');
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
        } catch (e) {
          console.warn('Cannot read some CSS rules:', e);
          return '';
        }
      })
      .join('\n');

    if (!printContent) {
      console.error('Printable content with id="invoice-print" not found.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the invoice.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            ${styles}

            @page {
                size: 210mm 297mm; /* A4 */
                margin: 16mm;
            }

            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
          </style>
        </head>
        <body class="bg-white">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 250);

  }, []);

  return (
    <Button onClick={handlePrint} variant="outline" className="w-full">
      <Printer className="mr-2 h-4 w-4" />
      Export as PDF
    </Button>
  );
}
