export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }
  return null;
};

export const validateRequired = (value: string, field: string): ValidationError | null => {
  if (!value || value.trim() === '') {
    return { field, message: `${field} is required` };
  }
  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  if (!phone) {
    return null; // Phone is optional
  }
  if (!phoneRegex.test(phone)) {
    return { field: 'phone', message: 'Invalid phone number format' };
  }
  return null;
};

export const validateAmount = (amount: string): ValidationError | null => {
  if (!amount) {
    return { field: 'amount', message: 'Amount is required' };
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { field: 'amount', message: 'Amount must be a positive number' };
  }
  return null;
};

export const validateDate = (date: string, field: string): ValidationError | null => {
  if (!date) {
    return { field, message: `${field} is required` };
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { field, message: `Invalid ${field} format` };
  }
  return null;
};

export const validateForm = (validations: (ValidationError | null)[]): ValidationResult => {
  const errors = validations.filter((error): error is ValidationError => error !== null);
  return {
    isValid: errors.length === 0,
    errors
  };
}; 