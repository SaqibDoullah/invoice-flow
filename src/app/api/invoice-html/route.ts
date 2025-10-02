import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import ReactDOMServer from 'react-dom/server';
import InvoicePDF from '@/components/invoices/invoice-pdf';
import { type Invoice } from '@/types';
import { adminDb } from '@/lib/firebase-server'; // Using admin SDK
import { headers } from 'next/headers';

export async function POST(request: Request) {
  // Rudimentary security check - replace with something more robust
  const headerList = headers();
  const internalSecret = headerList.get('X-Internal-Secret');
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { invoiceId, ownerId } = await request.json();
    if (!invoiceId || !ownerId) {
      return new NextResponse('Missing invoiceId or ownerId', { status: 400 });
    }

    const docRef = doc(adminDb, 'users', ownerId, 'invoices', invoiceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const invoice = { id: docSnap.id, ...docSnap.data() } as Invoice;

    const invoiceHtml = ReactDOMServer.renderToString(
      <InvoicePDF invoice={invoice} />
    );

    return new NextResponse(invoiceHtml, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error generating invoice HTML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
