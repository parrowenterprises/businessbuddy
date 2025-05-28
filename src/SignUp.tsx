import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { validateEmail, validatePassword, validateRequired, validateForm, type ValidationError } from './utils/validation';

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError, updateUser } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    setValidationErrors([]);
  };

  const validateSignupForm = () => {
    const validations = [
      validateEmail(formData.email),
      validatePassword(formData.password),
      validateRequired(formData.businessName, 'Business Name'),
      formData.password !== formData.confirmPassword
        ? { field: 'confirmPassword', message: 'Passwords do not match' }
        : null
    ];

    const result = validateForm(validations);
    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    try {
      await signup(formData.email, formData.password);
      await updateUser({ businessName: formData.businessName });
      navigate('/onboarding');
    } catch (err) {
      // Error is handled by the context
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {getFieldError('email') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="mt-1">
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    getFieldError('businessName') ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
                {getFieldError('businessName') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('businessName')}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    getFieldError('password') ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {getFieldError('password') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('password')}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    getFieldError('confirmPassword') ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {getFieldError('confirmPassword') && (
                  <p className="mt-2 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 