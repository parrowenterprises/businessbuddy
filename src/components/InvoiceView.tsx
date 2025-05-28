import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

interface InvoiceDetails {
  id: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  amount: number;
  due_date: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  job: {
    id: string;
    service_name: string;
    scheduled_start: string;
    scheduled_end: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
}

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data, error: invoiceError } = await supabase
          .from('invoices')
          .select(`
            *,
            customer:customers (
              id,
              name,
              email,
              phone,
              address
            ),
            job:jobs (
              id,
              service_name,
              scheduled_start,
              scheduled_end
            ),
            items:invoice_items (
              id,
              description,
              quantity,
              price
            )
          `)
          .eq('id', id)
          .single();

        if (invoiceError) throw invoiceError;
        setInvoice(data as InvoiceDetails);

        // If invoice is pending, create or fetch Stripe payment link
        if (data.status === 'pending') {
          await createPaymentLink(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading invoice');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const createPaymentLink = async (invoiceData: InvoiceDetails) => {
    try {
      // Check if we already have a payment link
      const { data: existingLink } = await supabase
        .from('payment_links')
        .select('url')
        .eq('invoice_id', invoiceData.id)
        .single();

      if (existingLink?.url) {
        setPaymentUrl(existingLink.url);
        return;
      }

      // For development/testing, create a mock payment link if the API is not available
      if (!process.env.STRIPE_SECRET_KEY) {
        const mockUrl = `https://checkout.stripe.com/mock-payment/${invoiceData.id}`;
        await supabase
          .from('payment_links')
          .insert([{
            invoice_id: invoiceData.id,
            url: mockUrl
          }]);
        setPaymentUrl(mockUrl);
        return;
      }

      // Try to create a real payment link
      try {
        const response = await fetch('/api/create-payment-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice_id: invoiceData.id,
            amount: invoiceData.amount,
            customer_email: invoiceData.customer.email,
            description: `Invoice for ${invoiceData.job.service_name}`
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment link');
        }

        const { url } = await response.json();

        // Save the payment link
        await supabase
          .from('payment_links')
          .insert([{
            invoice_id: invoiceData.id,
            url: url
          }]);

        setPaymentUrl(url);
      } catch (apiError) {
        console.error('Error creating real payment link:', apiError);
        throw new Error('Unable to create payment link. Please try again later.');
      }
    } catch (err) {
      console.error('Error in createPaymentLink:', err);
      setError('Unable to create payment link. Please try again later.');
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice || !paymentUrl) return;
    setIsProcessing(true);
    setError(null);

    try {
      // In a real app, we would send an email here with the payment link
      // For now, just update the UI
      await supabase
        .from('invoices')
        .update({ status: 'pending' })
        .eq('id', invoice.id);

      setInvoice(prev => prev ? { ...prev, status: 'pending' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Invoice not found" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Invoice for {invoice.job.service_name}
              </h1>
              <p className="text-sm text-gray-500">
                Created on {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {invoice.status === 'pending' && paymentUrl && (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Pay Now
                </a>
              )}
              {invoice.status === 'draft' && (
                <button
                  onClick={handleSendInvoice}
                  disabled={isProcessing || !paymentUrl}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Sending...' : 'Send Invoice'}
                </button>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Bill To</h2>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{invoice.customer.name}</p>
                <p>{invoice.customer.address}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.phone}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Invoice Details</h2>
              <div className="text-sm text-gray-600">
                <p><strong>Invoice Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                <p><strong>Service Date:</strong> {new Date(invoice.job.scheduled_start).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Services</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.quantity * item.price}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    Total Due
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    ${invoice.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Instructions */}
        {invoice.status === 'pending' && paymentUrl && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Click the button below to pay this invoice securely via Stripe
              </p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Pay Invoice Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 