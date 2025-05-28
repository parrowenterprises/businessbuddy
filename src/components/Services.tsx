import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Services() {
  const { services, addService, updateService, deleteService } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateService(editingId, formData);
    } else {
      addService(formData);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: ''
    });
    setEditingId(null);
  };

  const handleEdit = (service: typeof services[0]) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: ''
    });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Services</h1>

      {/* Add/Edit Service Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          {editingId ? 'Edit Service' : 'Add New Service'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Service Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="e.g., Basic House Cleaning"
              />
            </div>

            <div>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input"
                rows={3}
                placeholder="Describe what's included in this service..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Price*
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="$0.00"
                />
              </div>

              <div>
                <label htmlFor="duration" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Duration*
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Category*
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="e.g., Cleaning"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn"
                style={{ background: 'var(--color-gray-200)' }}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your Services</h2>
        {services.length === 0 ? (
          <p style={{ color: 'var(--color-gray-500)' }}>
            No services added yet. Add your first service above.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {services.map(service => (
              <div
                key={service.id}
                className="card"
                style={{
                  display: 'grid',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'var(--color-gray-50)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{service.name}</h3>
                    <span style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--color-gray-500)',
                      background: 'var(--color-gray-200)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem'
                    }}>
                      {service.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(service)}
                      className="btn"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="btn"
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.875rem',
                        background: 'var(--color-error-light)',
                        color: 'var(--color-error)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  {service.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.875rem',
                  color: 'var(--color-gray-600)'
                }}>
                  <span>Price: {service.price}</span>
                  <span>Duration: {service.duration}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 