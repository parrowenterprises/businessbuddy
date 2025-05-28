import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

interface JobDetails {
  id: string;
  customer_id: string;
  service_name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  quote_id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  quote: {
    id: string;
    total_amount: number;
    items: {
      id: string;
      description: string;
      quantity: number;
      price: number;
    }[];
  };
}

export default function JobView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            customer:customers (
              id,
              name,
              email,
              phone,
              address
            ),
            quote:quotes (
              id,
              total_amount,
              items:quote_items (
                id,
                description,
                quantity,
                price
              )
            )
          `)
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        setJob(data as JobDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading job');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleMarkComplete = async () => {
    if (!job) return;
    setIsProcessing(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', job.id);

      if (updateError) throw updateError;

      setJob(prev => prev ? { ...prev, status: 'completed' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating job status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!job) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user?.id,
          customer_id: job.customer_id,
          job_id: job.id,
          quote_id: job.quote_id,
          amount: job.quote.total_amount,
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          job.quote.items.map(item => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            price: item.price
          }))
        );

      if (itemsError) throw itemsError;

      // Update job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: 'invoiced' })
        .eq('id', job.id);

      if (updateError) throw updateError;

      // Navigate to invoice
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Job not found" />
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
                {job.service_name}
              </h1>
              <p className="text-sm text-gray-500">
                for {job.customer.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {job.status === 'scheduled' && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Mark Complete'}
                </button>
              )}
              {job.status === 'completed' && (
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Generating...' : 'Generate Invoice'}
                </button>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'invoiced' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'}`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(job.scheduled_start).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {new Date(job.scheduled_start).toLocaleTimeString()} - {new Date(job.scheduled_end).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {Math.round((new Date(job.scheduled_end).getTime() - new Date(job.scheduled_start).getTime()) / (1000 * 60 * 60))} hours
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <strong>Address:</strong><br />
                {job.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {job.customer.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {job.customer.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {job.customer.phone}
              </p>
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
                {job.quote.items.map(item => (
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
                    ${job.quote.total_amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 