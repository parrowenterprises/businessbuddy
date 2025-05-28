import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  customerId: string;
  serviceId: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export default function Schedule() {
  const { customers, services } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    start: '',
    end: '',
    customerId: '',
    serviceId: ''
  });

  const handleAddEvent = () => {
    const customer = customers.find((c: Customer) => c.id === newEvent.customerId);
    const service = services.find((s: Service) => s.id === newEvent.serviceId);
    
    if (customer && service) {
      const event = {
        ...newEvent,
        id: Date.now().toString(),
        title: `${customer.name} - ${service.name}`
      };
      setEvents([...events, event]);
      setNewEvent({
        id: '',
        title: '',
        start: '',
        end: '',
        customerId: '',
        serviceId: ''
      });
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
      </div>

      {/* Add Event Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={newEvent.customerId}
            onChange={(e) => setNewEvent({ ...newEvent, customerId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Customer</option>
            {customers.map((customer: Customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <select
            value={newEvent.serviceId}
            onChange={(e) => setNewEvent({ ...newEvent, serviceId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Service</option>
            {services.map((service: Service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

          <input
            type="datetime-local"
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />

          <button
            onClick={handleAddEvent}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200">
          {/* Time slots */}
          <div className="divide-y divide-gray-200">
            {timeSlots.map((time) => (
              <div key={time} className="h-20 p-2 text-sm text-gray-500">
                {time}
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="relative">
            {events.map((event) => (
              <div
                key={event.id}
                className="absolute bg-blue-100 border border-blue-200 rounded p-2 text-sm"
                style={{
                  top: `${new Date(event.start).getHours() * 80}px`,
                  height: `${(new Date(event.end).getHours() - new Date(event.start).getHours()) * 80}px`,
                  left: '8px',
                  right: '8px'
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 