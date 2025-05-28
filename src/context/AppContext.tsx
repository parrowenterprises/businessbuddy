import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  preferredContact: 'email' | 'phone';
  user_id: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  user_id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
  hasCompletedOnboarding: boolean;
}

interface Profile {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  serviceArea?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  latitude?: number;
  longitude?: number;
}

interface AppContextType {
  customers: Customer[];
  services: Service[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profile: Profile | null;
  updateProfile: (profile: Profile) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'user_id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  updateService: (id: string, service: Omit<Service, 'id' | 'user_id'>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setIsLoading(true);
      if (session) {
        setIsAuthenticated(true);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          setError('Error loading user data');
        } else if (userData) {
          setUser(userData);
        }

        // Load user's customers
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', session.user.id);

        if (customerError) {
          setError('Error loading customers');
        } else {
          setCustomers(customerData || []);
        }

        // Load user's services
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', session.user.id);

        if (serviceError) {
          setError('Error loading services');
        } else {
          setServices(serviceData || []);
        }

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
        } else {
          setProfile(profileData);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCustomers([]);
        setServices([]);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error during login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (authData.user) {
        // Then create the user profile in our database
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: authData.user.id,
            email: authData.user.email,
            has_completed_onboarding: false
          }]);
        
        if (profileError) throw profileError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'user_id'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCustomers(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding customer');
    } finally {
      setIsLoading(false);
    }
  };

  const addService = async (service: Omit<Service, 'id' | 'user_id'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...service, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setServices(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding service');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCustomers(prev =>
          prev.map(customer =>
            customer.id === id ? { ...customer, ...data } : customer
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating customer');
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (id: string, service: Omit<Service, 'id' | 'user_id'>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setServices(prev =>
          prev.map(s =>
            s.id === id ? { ...s, ...data } : s
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating service');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting customer');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting service');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newProfile: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(newProfile)
        .eq('id', newProfile.id);

      if (error) throw error;
      setProfile(newProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider
      value={{
        customers,
        services,
        user,
        isAuthenticated,
        isLoading,
        error,
        profile,
        updateProfile,
        addCustomer,
        addService,
        updateCustomer,
        updateService,
        deleteCustomer,
        deleteService,
        login,
        signup,
        logout,
        resetPassword,
        updateUser,
        clearError
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 