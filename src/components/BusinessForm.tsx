import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRUD } from '../hooks/useCRUD';
import { Business } from '../types';
import { Toast } from './ui/Toast';
type BusinessFormProps = {
  businessId?: string; // Optional for editing existing businesses
};
export const BusinessForm: React.FC<BusinessFormProps> = ({
  businessId
}) => {
  const navigate = useNavigate();
  const { data: businesses, create, update, getById } = useCRUD<Business>('eco_business_directory');
  const [existingBusiness, setExistingBusiness] = useState<Business | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load business data if editing
  useEffect(() => {
    const loadBusiness = async () => {
      if (businessId) {
        setIsLoading(true);
        try {
          const business = await getById(businessId);
          setExistingBusiness(business);
        } catch (error) {
          console.error('Failed to load business:', error);
          setToast({ type: 'error', message: 'Failed to load business data' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadBusiness();
  }, [businessId, getById]);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Private',
    industry: '',
    size: 'Small',
    status: 'Active',
    founded_year: new Date().getFullYear(),
    description: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    address: {
      city: '',
      street: '',
      postalCode: ''
    }
  });

  // Update form data when existing business is loaded
  useEffect(() => {
    if (existingBusiness) {
      setFormData({
        name: existingBusiness.name || '',
        type: existingBusiness.type || 'Private',
        industry: existingBusiness.industry || '',
        size: existingBusiness.size || 'Small',
        status: existingBusiness.status || 'Active',
        founded_year: existingBusiness.founded_year || new Date().getFullYear(),
        description: existingBusiness.description || '',
        website: existingBusiness.website || '',
        contact_email: existingBusiness.contact_email || '',
        contact_phone: existingBusiness.contact_phone || '',
        location: existingBusiness.location || '',
        address: existingBusiness.address || { city: '', street: '', postalCode: '' }
      });
    }
  }, [existingBusiness]);
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Process form data to match database schema
      const businessData = {
        name: formData.name,
        type: formData.type,
        industry: formData.industry,
        size: formData.size,
        status: formData.status,
        founded_year: formData.founded_year,
        description: formData.description,
        website: formData.website,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        location: formData.location,
        address: formData.address
      };

      if (businessId && existingBusiness) {
        // Update existing business
        const result = await update(businessId, businessData);
        if (result) {
          setToast({ type: 'success', message: 'Business updated successfully!' });
          setTimeout(() => navigate('/business-directory'), 1500);
        } else {
          setToast({ type: 'error', message: 'Failed to update business' });
        }
      } else {
        // Create new business
        const result = await create(businessData);
        if (result) {
          setToast({ type: 'success', message: 'Business created successfully!' });
          setTimeout(() => navigate('/business-directory'), 1500);
        } else {
          setToast({ type: 'error', message: 'Failed to create business' });
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setToast({ type: 'error', message: 'An error occurred while saving the business' });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingBusiness ? 'Edit Business' : 'Add New Business'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {existingBusiness ? 'Update the details of an existing business' : 'Create a new business listing in the directory'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide the essential details about the business.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Business Type *
                </label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Semi-Government">Semi-Government</option>
                </select>
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <select id="size" name="size" value={formData.size} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                  Founded Year
                </label>
                <input type="number" id="founded_year" name="founded_year" value={formData.founded_year} onChange={handleChange} placeholder="YYYY" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Contact Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                How to reach the business.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input type="email" id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="contact@business.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+971 2 123 4567" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Abu Dhabi, Dubai" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Address</h2>
              <p className="mt-1 text-sm text-gray-500">
                Location information for the business.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input type="text" id="address.city" name="address.city" value={formData.address.city} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input type="text" id="address.street" name="address.street" value={formData.address.street} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input type="text" id="address.postalCode" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/business-directory')} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : (existingBusiness ? 'Update Business' : 'Create Business')}
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>;
};
