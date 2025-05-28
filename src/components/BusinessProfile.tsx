import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City

interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

const defaultOperatingHours: OperatingHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: true },
  sunday: { open: '09:00', close: '17:00', closed: true }
};

export default function BusinessProfile() {
  const { profile, updateProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: profile?.id || '',
    businessName: profile?.businessName || '',
    address: profile?.address || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    description: profile?.description || '',
    serviceArea: profile?.serviceArea || '',
    operatingHours: profile?.operatingHours || defaultOperatingHours,
    latitude: profile?.latitude || defaultCenter.lat,
    longitude: profile?.longitude || defaultCenter.lng
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Business Profile</h3>
          <p className="mt-1 text-sm text-gray-600">
            This information will be displayed to your customers.
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    id="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700">
                    Service Area
                  </label>
                  <input
                    type="text"
                    name="serviceArea"
                    id="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: formData.latitude, lng: formData.longitude }}
                        zoom={13}
                      >
                        <Marker
                          position={{ lat: formData.latitude, lng: formData.longitude }}
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setFormData(prev => ({
                                ...prev,
                                latitude: e.latLng?.lat() || prev.latitude,
                                longitude: e.latLng?.lng() || prev.longitude
                              }));
                            }
                          }}
                        />
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <div className="space-y-4">
                    {Object.entries(formData.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Closed</span>
                        </div>
                        {!hours.closed && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 