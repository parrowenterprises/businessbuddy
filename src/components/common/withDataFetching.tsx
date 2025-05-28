import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface WithDataFetchingProps {
  isLoading?: boolean;
  error?: string | null;
}

export default function withDataFetching<P extends WithDataFetchingProps>(
  WrappedComponent: React.ComponentType<P>,
  fetchData: () => Promise<Partial<P>>
) {
  return function WithDataFetchingComponent(props: Omit<P, keyof WithDataFetchingProps>) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Partial<P>>({});

    useEffect(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const result = await fetchData();
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred while loading data');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, []);

    if (isLoading) {
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

    return <WrappedComponent {...(props as P)} {...data} isLoading={isLoading} error={error} />;
  };
} 