import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AddCustomer() {
  const navigate = useNavigate();
  const { addCustomer } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    preferredContact: 'email' as 'email' | 'phone'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(formData);
    navigate('/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Add New Customer</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Full Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>

            <div>
              <label htmlFor="preferredContact" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Preferred Contact Method*
              </label>
              <select
                id="preferredContact"
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input"
                rows={4}
                placeholder="Any additional notes about the customer..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn"
              style={{ background: 'var(--color-gray-200)' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 