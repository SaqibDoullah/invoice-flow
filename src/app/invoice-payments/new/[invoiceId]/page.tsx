
import CreateInvoicePaymentPageContent from './create-invoice-payment-page-content';

export default function CreateInvoicePaymentPage({ params }: { params: { invoiceId: string } }) {
    return <CreateInvoicePaymentPageContent invoiceId={params.invoiceId} />;
}
