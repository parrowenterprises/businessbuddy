import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: [] as string[],
  });

  const businessTypes = [
    { id: 'cleaning', label: '🏠 House Cleaning' },
    { id: 'yard', label: '🌱 Yard Work' },
    { id: 'handyman', label: '🔧 Handyman Services' },
    { id: 'laundry', label: '👕 Laundry Services' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBusinessTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      businessType: prev.businessType.includes(typeId)
        ? prev.businessType.filter(t => t !== typeId)
        : [...prev.businessType, typeId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Here we would normally submit to an API
      console.log('Form submitted:', formData);
      // Log the user in after registration
      login(formData.email, formData.password);
      navigate('/dashboard');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {step === 1 && 'Create Your Account'}
          {step === 2 && 'Select Your Business Type'}
          {step === 3 && 'Name Your Business'}
        </h2>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="form-group">
              <label className="label">What type of business do you run?</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: '1rem' }}>
                Select all that apply
              </p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {businessTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleBusinessTypeToggle(type.id)}
                    className={`btn ${
                      formData.businessType.includes(type.id)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-group">
              <label className="label">Business Name</label>
              <input
                type="text"
                name="businessName"
                className="input"
                value={formData.businessName}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn"
                style={{ flex: 1 }}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={step === 2 && formData.businessType.length === 0}
            >
              {step === 3 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 