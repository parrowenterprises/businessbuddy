import { Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import WorkingDashboard from './components/WorkingDashboard';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import CustomerView from './components/CustomerView';
import ServiceList from './components/ServiceList';
import QuoteForm from './components/QuoteForm';
import QuoteView from './components/QuoteView';
import JobScheduler from './components/JobScheduler';
import JobView from './components/JobView';
import InvoiceView from './components/InvoiceView';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import PrivateLayout from './components/layouts/PrivateLayout';

// Public layout with navigation
function PublicLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center text-lg sm:text-xl font-bold text-blue-600">
                  BusinessBuddy.online
                </Link>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link to="/login" className="text-sm sm:text-base text-gray-700 hover:text-gray-900 px-2 py-1">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}

// Landing page component
function LandingPage() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-6 sm:pb-8 md:pb-16 lg:max-w-2xl lg:w-full lg:pb-24 xl:pb-32">
          <main className="mt-6 sm:mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl tracking-tight font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
                <span className="block">Manage Your</span>
                <span className="block text-blue-600">Side Hustle Like a Pro</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-500 sm:mt-5 sm:max-w-xl mx-auto lg:mx-0">
                Simple tools to handle customers, quotes, scheduling, and invoicing.
                Perfect for home services and small businesses.
              </p>
              <div className="mt-5 sm:mt-8 flex justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border border-transparent text-base sm:text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Public Route wrapper (redirects to dashboard if authenticated)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route
          path="login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="signup"
          element={
            <PublicOnlyRoute>
              <SignUp />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={<WorkingDashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id" element={<CustomerView />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/quotes/new" element={<QuoteForm />} />
        <Route path="/quotes/:id" element={<QuoteView />} />
        <Route path="/schedule/:id" element={<JobScheduler />} />
        <Route path="/jobs/:id" element={<JobView />} />
        <Route path="/invoices/:id" element={<InvoiceView />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ErrorBoundary>
  );
}
