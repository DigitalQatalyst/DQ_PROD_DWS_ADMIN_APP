import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightbulbIcon, CoinsIcon, LayersIcon, GlobeIcon, UserIcon, ShieldIcon, LineChartIcon, ScissorsIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { GrowthArea } from '../types';

type GrowthAreaFormProps = {
  areaId?: string; // Optional for editing existing growth areas
};

export const GrowthAreaForm: React.FC<GrowthAreaFormProps> = ({
  areaId
}) => {
  const navigate = useNavigate();
  const { create, update, getById } = useCRUD<GrowthArea>('eco_growth_areas');
  const [existingArea, setExistingArea] = useState<GrowthArea | null>(null);
  const [loadingArea, setLoadingArea] = useState(false);

  // Fetch existing growth area data when editing
  useEffect(() => {
    const fetchGrowthArea = async () => {
      if (areaId) {
        setLoadingArea(true);
        try {
          const area = await getById(areaId);
          if (area) {
            setExistingArea(area);
          }
        } catch (error) {
          console.error('Error fetching growth area:', error);
          alert('Failed to load growth area data');
        } finally {
          setLoadingArea(false);
        }
      }
    };
    fetchGrowthArea();
  }, [areaId, getById]);

  // Get available icons
  const availableIcons = [{
    name: 'Lightbulb',
    component: LightbulbIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }, {
    name: 'Coins',
    component: CoinsIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }, {
    name: 'Layers',
    component: LayersIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }, {
    name: 'Globe',
    component: GlobeIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  }, {
    name: 'User',
    component: UserIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }, {
    name: 'Shield',
    component: ShieldIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }, {
    name: 'LineChart',
    component: LineChartIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }, {
    name: 'Scissors',
    component: ScissorsIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Emerging',
    category: '',
    status: 'Active',
    growthRate: '',
    description: '',
    iconName: 'Lightbulb',
    gdpContribution: '',
    marketSize: '',
    employment: '',
    investment: '',
    growthProjectionRate: '',
    growthProjectionPeriod: 'CAGR (2023-2028)',
    growthProjectionDescription: ''
  });

  // Update form data when existing area is loaded
  useEffect(() => {
    if (existingArea) {
      setFormData({
        name: existingArea.name || '',
        type: existingArea.type || 'Emerging',
        category: existingArea.category || '',
        status: existingArea.status || 'Active',
        growthRate: existingArea.growthRate?.toString() || '',
        description: existingArea.description || '',
        iconName: existingArea.icon?.name || 'Lightbulb',
        gdpContribution: existingArea.keyStatistics?.find(stat => stat.label === 'Contribution to GDP')?.value || '',
        marketSize: existingArea.keyStatistics?.find(stat => stat.label === 'Market Size')?.value || '',
        employment: existingArea.keyStatistics?.find(stat => stat.label === 'Employment')?.value || '',
        investment: existingArea.keyStatistics?.find(stat => stat.label === 'Investment (2023)')?.value || '',
        growthProjectionRate: existingArea.growthProjection?.rate?.toString() || '',
        growthProjectionPeriod: existingArea.growthProjection?.period || 'CAGR (2023-2028)',
        growthProjectionDescription: existingArea.growthProjection?.description || ''
      });
    }
  }, [existingArea]);

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

    // Find the selected icon config
    const selectedIcon = availableIcons.find(icon => icon.name === formData.iconName);

    // Process form data to match database schema (snake_case columns)
    const dataToSave: any = {
      name: formData.name,
      growth_type: formData.type,
      category: formData.category,
      status: formData.status,
      growth_rate: parseFloat(formData.growthRate) || 0,
      description: formData.description,
      icon: {
        name: formData.iconName
      },
      icon_color: selectedIcon?.color || 'text-green-600',
      icon_bg_color: selectedIcon?.bgColor || 'bg-green-100',
      key_statistics: [
        {
          label: 'Market Size',
          value: formData.marketSize,
          change: parseFloat(formData.growthRate) || 0
        },
        {
          label: 'Employment',
          value: formData.employment,
          change: Math.round((parseFloat(formData.growthRate) || 0) * 0.7 * 10) / 10
        },
        {
          label: 'Investment (2023)',
          value: formData.investment,
          change: Math.round((parseFloat(formData.growthRate) || 0) * 1.2 * 10) / 10
        },
        {
          label: 'Contribution to GDP',
          value: formData.gdpContribution,
          change: Math.round((parseFloat(formData.growthRate) || 0) * 0.3 * 10) / 10
        }
      ],
      growth_projection: {
        rate: parseFloat(formData.growthProjectionRate) || 0,
        period: formData.growthProjectionPeriod,
        description: formData.growthProjectionDescription
      },
      associated_zones: [],
      key_players: [],
      associated_businesses: [],
      economic_impact: [],
      employment: [],
      market_trends: [],
      comparative_analysis: {
        description: '',
        regionalComparison: [],
        advantages: []
      },
      industry_breakdown: [],
      investment_opportunities: [],
      support_programs: [],
      contact_information: {}
    };

    // Add submitted_on only for new growth areas
    if (!existingArea) {
      dataToSave.submitted_on = new Date().toISOString();
    }

    try {
      console.log('Saving growth area data:', dataToSave);
      
      let result;
      if (existingArea && areaId) {
        // Update existing growth area
        result = await update(areaId, dataToSave);
        if (result) {
          alert(`Growth area updated successfully!`);
          navigate('/growth-areas');
        } else {
          alert('Failed to update growth area. Please check the console for errors.');
        }
      } else {
        // Create new growth area
        result = await create(dataToSave as any);
        if (result) {
          alert(`Growth area created successfully!`);
          navigate('/growth-areas');
        } else {
          alert('Failed to create growth area. Please check the console for errors.');
        }
      }
    } catch (error) {
      console.error('Error saving growth area:', error);
      alert('An error occurred while saving the growth area.');
    }
  };

  // Show loading state while fetching growth area data
  if (loadingArea) {
    return <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading growth area data...</p>
          </div>
        </div>
      </div>
    </div>;
  }

  return <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingArea ? 'Edit Growth Area' : 'Add New Growth Area'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {existingArea ? 'Update the details of an existing growth area' : 'Create a new growth area profile'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide the essential details about the growth area.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Growth Area Name *
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type *
                </label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Emerging">Emerging</option>
                  <option value="Established">Established</option>
                  <option value="Strategic">Strategic</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g. Technology, Finance, Energy" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="growthRate" className="block text-sm font-medium text-gray-700">
                  Growth Rate (%) *
                </label>
                <input type="number" id="growthRate" name="growthRate" value={formData.growthRate} onChange={handleChange} required step="0.1" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="iconName" className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <select id="iconName" name="iconName" value={formData.iconName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {availableIcons.map(icon => <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>)}
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
                Key Statistics
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide statistical information about the growth area.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="marketSize" className="block text-sm font-medium text-gray-700">
                  Market Size *
                </label>
                <input type="text" id="marketSize" name="marketSize" value={formData.marketSize} onChange={handleChange} required placeholder="e.g. $10.5 Billion" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="employment" className="block text-sm font-medium text-gray-700">
                  Employment *
                </label>
                <input type="text" id="employment" name="employment" value={formData.employment} onChange={handleChange} required placeholder="e.g. 25,000+" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="investment" className="block text-sm font-medium text-gray-700">
                  Investment (2023) *
                </label>
                <input type="text" id="investment" name="investment" value={formData.investment} onChange={handleChange} required placeholder="e.g. $2.5 Billion" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="gdpContribution" className="block text-sm font-medium text-gray-700">
                  Contribution to GDP *
                </label>
                <input type="text" id="gdpContribution" name="gdpContribution" value={formData.gdpContribution} onChange={handleChange} required placeholder="e.g. 5.2%" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Growth Projection
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Future growth expectations for this area.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="growthProjectionRate" className="block text-sm font-medium text-gray-700">
                  Projected Growth Rate (%) *
                </label>
                <input type="number" id="growthProjectionRate" name="growthProjectionRate" value={formData.growthProjectionRate} onChange={handleChange} required step="0.1" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="growthProjectionPeriod" className="block text-sm font-medium text-gray-700">
                  Period *
                </label>
                <input type="text" id="growthProjectionPeriod" name="growthProjectionPeriod" value={formData.growthProjectionPeriod} onChange={handleChange} required placeholder="e.g. CAGR (2023-2028)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="growthProjectionDescription" className="block text-sm font-medium text-gray-700">
                  Growth Drivers Description *
                </label>
                <textarea id="growthProjectionDescription" name="growthProjectionDescription" rows={3} value={formData.growthProjectionDescription} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/growth-areas')} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {existingArea ? 'Update Growth Area' : 'Create Growth Area'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};