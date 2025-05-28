import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

interface QuoteDetails {
  id: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  total_amount: number;
  valid_until: string;
  notes: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
}

export default function QuoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const { data, error: quoteError } = await supabase
          .from('quotes')
          .select(`
            *,
            customer:customers (
              id,
              name,
              email
            ),
            items:quote_items (
              id,
              description,
              quantity,
              price
            )
          `)
          .eq('id', id)
          .single();

        if (quoteError) throw quoteError;
        setQuote(data as QuoteDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading quote');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchQuote();
    }
  }, [id]);

  const handleSendQuote = async () => {
    if (!quote) return;
    setIsSending(true);
    setError(null);

    try {
      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'sent' })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // In a real app, we would send an email here
      // For now, just update the UI
      setQuote(prev => prev ? { ...prev, status: 'sent' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending quote');
    } finally {
      setIsSending(false);
    }
  };

  const handleConvertToJob = async () => {
    if (!quote) return;
    setIsConverting(true);
    setError(null);

    try {
      // Create a new job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert([{
          user_id: user?.id,
          customer_id: quote.customer.id,
          quote_id: quote.id,
          service_name: quote.items[0].description, // Use first service as job name
          status: 'scheduled',
          scheduled_start: new Date().toISOString(), // Default to now, will be updated in scheduler
          scheduled_end: new Date().toISOString(),
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'approved' })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // Navigate to job scheduler
      navigate(`/schedule/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error converting to job');
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Quote not found" />
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
        {/* Quote Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quote for {quote.customer.name}
              </h1>
              <p className="text-sm text-gray-500">
                Created on {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {quote.status === 'draft' && (
                <button
                  onClick={handleSendQuote}
                  disabled={isSending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Quote'}
                </button>
              )}
              {quote.status === 'sent' && (
                <button
                  onClick={handleConvertToJob}
                  disabled={isConverting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isConverting ? 'Converting...' : 'Convert to Job'}
                </button>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                  quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Services</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
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
                  {quote.items.map(item => (
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
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ${quote.total_amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {quote.customer.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {quote.customer.email}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Quote Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Valid Until:</strong> {new Date(quote.valid_until).toLocaleDateString()}
                </p>
                {quote.notes && (
                  <div className="mt-2">
                    <strong className="text-sm text-gray-600">Notes:</strong>
                    <p className="text-sm text-gray-600 mt-1">{quote.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 