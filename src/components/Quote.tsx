import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface LineItem {
  id: string;
  serviceId: string;
  quantity: number;
  price: string;
  total: number;
}

interface Quote {
  id: string;
  customerId: string;
  date: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export default function Quote() {
  const navigate = useNavigate();
  const { customers, services } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [tax, setTax] = useState(0);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      serviceId: '',
      quantity: 1,
      price: '',
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          // Recalculate total if price or quantity changed
          if ('price' in updates || 'quantity' in updates) {
            const price = parseFloat(updatedItem.price) || 0;
            updatedItem.total = price * updatedItem.quantity;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, tax: taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, tax: taxAmount, total } = calculateTotals();

    const quote: Quote = {
      id: Date.now().toString(),
      customerId: selectedCustomerId,
      date: new Date().toISOString(),
      lineItems,
      subtotal,
      tax: taxAmount,
      total,
      status: 'draft'
    };

    // TODO: Save quote to context/backend
    console.log('Quote created:', quote);
    navigate('/quotes');
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create New Quote</h1>

      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Customer Information</h2>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            required
            className="input"
            style={{ marginBottom: '1rem' }}
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
              <p>Email: {selectedCustomer.email}</p>
              <p>Phone: {selectedCustomer.phone}</p>
              <p>Address: {selectedCustomer.address}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Add Item
            </button>
          </div>

          {lineItems.length === 0 ? (
            <p style={{ color: 'var(--color-gray-500)' }}>
              No items added yet. Click "Add Item" to start building your quote.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {lineItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'var(--color-gray-50)',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <select
                      value={item.serviceId}
                      onChange={(e) => {
                        const service = services.find(s => s.id === e.target.value);
                        updateLineItem(item.id, {
                          serviceId: e.target.value,
                          price: service?.price || ''
                        });
                      }}
                      required
                      className="input"
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.price}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="btn"
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--color-error-light)',
                        color: 'var(--color-error)'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        Price
                      </label>
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => updateLineItem(item.id, { price: e.target.value })}
                        required
                        className="input"
                        placeholder="$0.00"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        Total
                      </label>
                      <div style={{ padding: '0.5rem', background: 'var(--color-gray-100)', borderRadius: '0.25rem' }}>
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quote Summary</h2>

          <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>${calculateTotals().subtotal.toFixed(2)}</span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label htmlFor="tax">Tax Rate (%):</label>
                <input
                  type="number"
                  id="tax"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  style={{ width: '80px' }}
                  className="input"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax Amount:</span>
                <span>${calculateTotals().tax.toFixed(2)}</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--color-gray-200)',
                paddingTop: '1rem',
                fontWeight: 'bold'
              }}
            >
              <span>Total:</span>
              <span>${calculateTotals().total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              Create Quote
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 