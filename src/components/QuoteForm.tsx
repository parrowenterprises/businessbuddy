import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { validateRequired, validateForm } from '../utils/validation';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

interface QuoteItem {
  service_id: string;
  description: string;
  quantity: number;
  price: number;
}

interface QuoteFormData {
  customer_id: string;
  items: QuoteItem[];
  notes: string;
  valid_until: string;
}

export default function QuoteForm() {
  const navigate = useNavigate();
  const { customers, services, user } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    customer_id: '',
    items: [],
    notes: '',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  });

  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState(1);

  const addQuoteItem = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          service_id: service.id,
          description: service.name,
          quantity: quantity,
          price: Number(service.price)
        }
      ]
    }));

    setSelectedService('');
    setQuantity(1);
  };

  const removeQuoteItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const validateQuoteForm = () => {
    const validations = [
      validateRequired(formData.customer_id, 'Customer'),
      formData.items.length === 0 ? { field: 'items', message: 'At least one service is required' } : null,
      validateRequired(formData.valid_until, 'Valid Until Date')
    ];

    const result = validateForm(validations);
    if (!result.isValid) {
      setError(result.errors[0].message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuoteForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create the quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          user_id: user?.id,
          customer_id: formData.customer_id,
          status: 'draft',
          total_amount: calculateTotal(),
          valid_until: formData.valid_until,
          notes: formData.notes
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Add quote items
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(
          formData.items.map(item => ({
            quote_id: quote.id,
            service_id: item.service_id,
            description: item.description,
            quantity: item.quantity,
            price: item.price
          }))
        );

      if (itemsError) throw itemsError;

      navigate('/quotes/' + quote.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating quote');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Quote</h1>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer
          </label>
          <select
            value={formData.customer_id}
            onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                className="block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
              <button
                type="button"
                onClick={addQuoteItem}
                disabled={!selectedService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Add Service
              </button>
            </div>
          </div>

          {/* Quote Items List */}
          <div className="mt-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="font-medium text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    ${item.price} x {item.quantity} = ${item.price * item.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuoteItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}

            {formData.items.length > 0 && (
              <div className="flex justify-end pt-4 border-t">
                <p className="text-lg font-bold">
                  Total: ${calculateTotal()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quote Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valid Until
            </label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={e => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              placeholder="Add any additional notes or terms..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Create Quote
          </button>
        </div>
      </form>
    </div>
  );
} 