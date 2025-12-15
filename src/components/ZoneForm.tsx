import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRUD } from '../hooks/useCRUD';
import { Zone } from '../types';
import { Toast } from './ui/Toast';
type ZoneFormProps = {
  zoneId?: string; // Optional for editing existing zones
};
export const ZoneForm: React.FC<ZoneFormProps> = ({
  zoneId
}) => {
  const navigate = useNavigate();
  const { data: zones, create, update, getById } = useCRUD<Zone>('eco_zones');
  const [existingZone, setExistingZone] = useState<Zone | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load zone data if editing
  useEffect(() => {
    const loadZone = async () => {
      if (zoneId) {
        setIsLoading(true);
        try {
          const zone = await getById(zoneId);
          setExistingZone(zone);
        } catch (error) {
          console.error('Failed to load zone:', error);
          setToast({ type: 'error', message: 'Failed to load zone data' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadZone();
  }, [zoneId, getById]);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    zone_type: 'Industrial Zone',
    status: 'Active',
    description: '',
    area_km2: 0,
    capacity: 0,
    current_occupancy: 0
  });

  // Update form data when existing zone is loaded
  useEffect(() => {
    if (existingZone) {
      setFormData({
        name: existingZone.name || '',
        zone_type: existingZone.zone_type || 'Industrial Zone',
        status: existingZone.status || 'Active',
        description: existingZone.description || '',
        area_km2: existingZone.area_km2 || 0,
        capacity: existingZone.capacity || 0,
        current_occupancy: existingZone.current_occupancy || 0
      });
    }
  }, [existingZone]);
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Process form data to match database schema
      const zoneData = {
        name: formData.name,
        zone_type: formData.zone_type,
        status: formData.status,
        description: formData.description,
        area_km2: formData.area_km2,
        capacity: formData.capacity,
        current_occupancy: formData.current_occupancy
      };

      if (zoneId && existingZone) {
        // Update existing zone
        const result = await update(zoneId, zoneData);
        if (result) {
          setToast({ type: 'success', message: 'Zone updated successfully!' });
          setTimeout(() => navigate('/zones-clusters'), 1500);
        } else {
          setToast({ type: 'error', message: 'Failed to update zone' });
        }
      } else {
        // Create new zone
        const result = await create(zoneData);
        if (result) {
          setToast({ type: 'success', message: 'Zone created successfully!' });
          setTimeout(() => navigate('/zones-clusters'), 1500);
        } else {
          setToast({ type: 'error', message: 'Failed to create zone' });
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setToast({ type: 'error', message: 'An error occurred while saving the zone' });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingZone ? 'Edit Zone' : 'Add New Zone'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {existingZone ? 'Update the details of an existing zone' : 'Create a new zone or cluster in the directory'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide the essential details about the zone.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Zone Name *
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Zone Type *
                </label>
                <select id="zone_type" name="zone_type" value={formData.zone_type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Industrial Zone">Industrial Zone</option>
                  <option value="Free Zone">Free Zone</option>
                  <option value="Economic Zone">Economic Zone</option>
                  <option value="Technology Hub">Technology Hub</option>
                  <option value="Business Park">Business Park</option>
                  <option value="Special Economic Zone">
                    Special Economic Zone
                  </option>
                </select>
              </div>
              <div>
                <label htmlFor="area_km2" className="block text-sm font-medium text-gray-700">
                  Area (km²) *
                </label>
                <input type="number" id="area_km2" name="area_km2" value={formData.area_km2} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Active">Active</option>
                  <option value="Under Development">Under Development</option>
                  <option value="Planned">Planned</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Zone Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide specific information about the zone.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="current_occupancy" className="block text-sm font-medium text-gray-700">
                  Current Occupancy
                </label>
                <input type="number" id="current_occupancy" name="current_occupancy" value={formData.current_occupancy} onChange={handleChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="occupancyRate" className="block text-sm font-medium text-gray-700">
                  Occupancy Rate
                </label>
                <input type="text" id="occupancyRate" name="occupancyRate" value={formData.occupancyRate} onChange={handleChange} placeholder="e.g. 85%" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="companies" className="block text-sm font-medium text-gray-700">
                  Number of Companies
                </label>
                <input type="number" id="companies" name="companies" value={formData.companies} onChange={handleChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="industries" className="block text-sm font-medium text-gray-700">
                  Industries (comma-separated)
                </label>
                <input type="text" id="industries" name="industries" value={formData.industries} onChange={handleChange} placeholder="e.g. Manufacturing, Logistics, Warehousing" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="facilities" className="block text-sm font-medium text-gray-700">
                  Facilities (comma-separated)
                </label>
                <input type="text" id="facilities" name="facilities" value={formData.facilities} onChange={handleChange} placeholder="e.g. Warehouses, Offices, Worker Accommodation" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="incentives" className="block text-sm font-medium text-gray-700">
                  Incentives (comma-separated)
                </label>
                <input type="text" id="incentives" name="incentives" value={formData.incentives} onChange={handleChange} placeholder="e.g. 100% Foreign Ownership, Zero Import/Export Duties" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Contact Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                How to reach the zone management.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="info@example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+971 2 123 4567" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/zones-clusters')} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : (existingZone ? 'Update Zone' : 'Create Zone')}
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>;
};