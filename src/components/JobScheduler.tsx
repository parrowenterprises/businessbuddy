import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

interface JobDetails {
  id: string;
  customer_id: string;
  service_name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function JobScheduler() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(2); // hours

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            customer:customers (
              id,
              name,
              email,
              phone,
              address
            )
          `)
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        setJob(data as JobDetails);

        // Set initial form values if job is already scheduled
        if (data.scheduled_start) {
          const start = new Date(data.scheduled_start);
          setDate(start.toISOString().split('T')[0]);
          setStartTime(start.toTimeString().slice(0, 5));
          
          const end = new Date(data.scheduled_end);
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          setDuration(durationHours);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading job');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSaving(true);
    setError(null);

    try {
      // Calculate start and end times
      const [hours, minutes] = startTime.split(':').map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);

      const end = new Date(start);
      end.setHours(end.getHours() + duration);

      // Update job
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          scheduled_start: start.toISOString(),
          scheduled_end: end.toISOString(),
          status: 'scheduled'
        })
        .eq('id', job.id);

      if (updateError) throw updateError;

      // Navigate to job view
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error scheduling job');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert type="error" message="Job not found" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Job: {job.service_name}
          </h1>
          <p className="text-sm text-gray-500">
            for {job.customer.name}
          </p>
        </div>

        {/* Customer Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {job.customer.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {job.customer.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {job.customer.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <strong>Address:</strong><br />
                {job.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Scheduling Form */}
        <form onSubmit={handleSchedule} className="px-6 py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={duration}
                  onChange={e => setDuration(parseFloat(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Scheduling...' : 'Schedule Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 