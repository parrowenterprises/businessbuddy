import { useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

export default function WorkingDashboard() {
  const { isLoading: isContextLoading } = useApp();
  const [error, setError] = useState<string | null>(null);

  if (isContextLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content will go here */}
      </div>
    </div>
  );
} 