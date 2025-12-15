import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRUD } from '../hooks/useCRUD';
import { Service } from '../types';
import { Toast } from './ui/Toast';

type ServiceFormProps = {
  serviceId?: string; // Optional for editing existing services
};

type ServiceData = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  facetValues?: Array<{
    facet?: {
      id?: string;
      name?: string;
      code?: string;
    };
    id?: string;
    name?: string;
    code?: string;
  }>;
  customFields?: {
    ProcessingTime?: string;
    Cost?: number;
    RegistrationValidity?: string;
    KeyTermsOfService?: string;
    AdditionalTermsOfService?: string[];
    RequiredDocuments?: string[];
    Steps?: string[];
    ServiceMode?: string[];
    LegalStructure?: string[];
    EmpowermentandLeadership?: string[];
    Nationality?: string[];
    Industry?: string[];
    BusinessStage?: string[];
    Addtags?: string[];
    isApproved?: boolean;
    RelatedServices?: string[];
  };
};

export const ServiceForm: React.FC<ServiceFormProps> = ({
  serviceId
}) => {
  const navigate = useNavigate();
  const { getById, create, update, loading: serviceLoading, error: crudError } = useCRUD<Service>('mktplc_services');
  const [existingService, setExistingService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  console.log(existingService);

  // Helper function to convert Service from database to ServiceData format
  const convertServiceToServiceData = (service: any): ServiceData => {
    // Determine marketplace type
    const marketplace =
      service.type === 'Financial' ? 'Financial Services' : 'Non-Financial Services';

    // Extract cost from fee string
    let cost: number | undefined;
    if (service.fee) {
      const match = service.fee.match(/[\d.]+/);
      if (match) cost = parseFloat(match[0]);
    }

    // Handle eligibility breakdown
    const eligibility = service.eligibility || [];
    const legalStructure: string[] = [];
    const nationality: string[] = [];
    const businessStage: string[] = [];
    const empowermentAndLeadership: string[] = [];
    const industry: string[] = [];

    eligibility.forEach(item => {
      if (['GCC National', 'Resident', 'UAE National', 'Emirati'].includes(item)) {
        nationality.push(item);
      } else if (
        ['Startup', 'Grown Up', 'Enterprise', 'Scale Up', 'All'].includes(item)
      ) {
        businessStage.push(item);
      } else if (
        ['LLC', 'Sole Proprietorship', 'Partnership', 'Public Joint Stock', 'Private Joint Stock', 'All'].includes(item)
      ) {
        legalStructure.push(item);
      } else if (
        ['Technology', 'Retail', 'Manufacturing', 'Services', 'Healthcare', 'Education', 'All'].includes(item)
      ) {
        industry.push(item);
      } else {
        empowermentAndLeadership.push(item);
      }
    });

    return {
      id: service.id,
      name: service.title || '',
      slug: service.id,
      description: service.description || '',
      facetValues: [
        {
          facet: { name: 'Provided By', code: 'provided-by' },
          name: service.partner_name || service.partner_info?.name || '',
          code: (service.partner_name || '').toLowerCase().replace(/\s+/g, '-'),
        },
        {
          facet: { name: 'Marketplace', code: 'marketplace' },
          name: marketplace,
          code: marketplace.toLowerCase().replace(/\s+/g, '-'),
        },
      ],
      customFields: {
        ProcessingTime: service.processing_time || '',
        Cost: cost,
        RegistrationValidity: service.registration_validity || 'N/A',
        KeyTermsOfService: Array.isArray(service.key_terms_of_service)
          ? service.key_terms_of_service.join(' ')
          : (service.key_terms_of_service || service.partner_info?.complianceNotes || ''),
        AdditionalTermsOfService: service.additional_terms_of_service
          ? service.additional_terms_of_service.split('\n')
          : [],
        RequiredDocuments: service.documents_required || [],
        Steps: service.steps ? service.steps.split('\n') : [],
        ServiceMode: [service.service_mode || 'Online'],
        LegalStructure: legalStructure,
        EmpowermentandLeadership: Array.isArray(service.empowerment_and_leadership) && service.empowerment_and_leadership.length > 0
          ? service.empowerment_and_leadership
          : (empowermentAndLeadership.length > 0 ? empowermentAndLeadership : []),
        Nationality: nationality,
        Industry: industry,
        BusinessStage: businessStage,
        Addtags: service.category ? [service.category] : [],
        isApproved: service.status === 'Published',
        RelatedServices: service.related_services || [],
      },
    };
  };


  // Load service data when editing
  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        setExistingService(null);
        return;
      }

      setLoading(true);
      try {
        const service = await getById(serviceId);
        if (service) {
          const serviceData = convertServiceToServiceData(service);
          setExistingService(serviceData);
        } else {
          console.error('Service not found');
        }
      } catch (err) {
        console.error('Error loading service:', err);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId, getById]);

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Form state with controlled components
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    providedBy: '',
    marketplace: '', // Default to empty to require selection
    // Custom Fields
    processingTime: '',
    cost: '',
    registrationValidity: '',
    keyTermsOfService: '', // Textarea input (will be split into array on submit)
    additionalTermsOfService: '',
    requiredDocuments: '', // Textarea input (will be split into array on submit)
    steps: '', // Textarea input (will be split into array on submit)
    serviceMode: 'Online',
    legalStructure: [] as string[],
    empowermentAndLeadership: '', // Radio button (single value: 'Yes' or 'No')
    nationality: [] as string[],
    industry: [] as string[],
    businessStage: [] as string[],
    addTags: [] as string[],
    isApproved: false,
    relatedServices: [] as string[]
  });

  // Update form data when existing service is loaded
  useEffect(() => {
    if (existingService) {
      setFormData({
        name: existingService.name || '',
        description: existingService.description || '',
        providedBy: existingService.facetValues?.find((fv: any) => fv.facet?.code === 'provided-by')?.name || '',
        marketplace: existingService.facetValues?.find((fv: any) => fv.facet?.code === 'marketplace')?.name || '',
        processingTime: existingService.customFields?.ProcessingTime || '',
        cost: existingService.customFields?.Cost?.toString() || '',
        registrationValidity: existingService.customFields?.RegistrationValidity || '',
        keyTermsOfService: existingService.customFields?.KeyTermsOfService || '',
        additionalTermsOfService: existingService.customFields?.AdditionalTermsOfService?.join('\n') || '',
        requiredDocuments: existingService.customFields?.RequiredDocuments?.join('\n') || '',
        steps: existingService.customFields?.Steps?.join('\n') || '',
        serviceMode: existingService.customFields?.ServiceMode?.[0] || 'Online',
        legalStructure: existingService.customFields?.LegalStructure || [],
        empowermentAndLeadership: Array.isArray(existingService.customFields?.EmpowermentandLeadership) && existingService.customFields.EmpowermentandLeadership.length > 0
          ? existingService.customFields.EmpowermentandLeadership[0] || ''
          : '',
        nationality: existingService.customFields?.Nationality || [],
        industry: existingService.customFields?.Industry || [],
        businessStage: existingService.customFields?.BusinessStage || [],
        addTags: existingService.customFields?.Addtags || [],
        isApproved: existingService.customFields?.isApproved || false,
        relatedServices: existingService.customFields?.RelatedServices || []
      });
    }
  }, [existingService]);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [tagInput, setTagInput] = useState('');


  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);

  // Validation function
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Service name is required';
        }
        if (value.trim().length < 3) {
          return 'Service name must be at least 3 characters';
        }
        if (value.length > 200) {
          return 'Service name must be less than 200 characters';
        }
        return '';

      case 'description':
        if (!value || value.trim().length === 0) {
          return 'Description is required';
        }
        if (value.trim().length < 10) {
          return 'Description must be at least 10 characters';
        }
        if (value.length > 2000) {
          return 'Description must be less than 2000 characters';
        }
        return '';

      case 'providedBy':
        if (!value || value.trim().length === 0) {
          return 'Provided by is required';
        }
        if (value.trim().length < 2) {
          return 'Provided by must be at least 2 characters';
        }
        return '';

      case 'marketplace':
        if (!value || value.trim().length === 0) {
          return 'Marketplace is required';
        }
        if (value !== 'Financial Services' && value !== 'Non-Financial Services') {
          return 'Please select a valid marketplace option';
        }
        return '';

      case 'processingTime':
        if (!value || value.trim().length === 0) {
          return 'Processing time is required';
        }
        return '';

      case 'cost': {
        if (!value || value.toString().trim().length === 0) {
          return 'Cost is required';
        }
        const costNum = Number(value);
        if (Number.isNaN(costNum)) {
          return 'Cost must be a valid number';
        }
        if (costNum < 0) {
          return 'Cost cannot be negative';
        }
        if (costNum > 1000000000) {
          return 'Cost is too large';
        }
        return '';
      }

      case 'requiredDocuments': {
        if (!value || value.toString().trim().length === 0) {
          return 'At least one required document is needed';
        }
        const docs = value.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
        if (docs.length === 0) {
          return 'At least one required document is needed';
        }
        return '';
      }

      case 'steps': {
        if (!value || value.toString().trim().length === 0) {
          return 'At least one application step is required';
        }
        const steps = value.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
        if (steps.length === 0) {
          return 'At least one application step is required';
        }
        return '';
      }

      case 'keyTermsOfService': {
        if (!value || value.toString().trim().length === 0) {
          return 'Key terms of service is required';
        }
        if (value.toString().trim().length < 10) {
          return 'Key terms of service must be at least 10 characters';
        }
        return '';
      }

      case 'empowermentAndLeadership': {
        if (!value || value.toString().trim().length === 0) {
          return 'Empowerment and Leadership selection is required';
        }
        if (value !== 'Yes' && value !== 'No') {
          return 'Please select either Yes or No';
        }
        return '';
      }

      case 'serviceMode':
        if (!value) {
          return 'Service mode is required';
        }
        return '';

      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = (): { isValid: boolean; errorFields: string[]; } => {
    const newErrors: Record<string, string> = {};

    // Validate all required fields
    const fieldsToValidate = [
      'name', 'description', 'providedBy', 'marketplace', 'processingTime', 'cost',
      'requiredDocuments', 'steps', 'keyTermsOfService', 'empowermentAndLeadership', 'serviceMode'
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    const errorFields = Object.keys(newErrors);
    return { isValid: errorFields.length === 0, errorFields };
  };

  // Multi-select handlers with "All" logic
  const handleMultiSelectChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof typeof prev] as string[];

      // Define all available options for each field (excluding "All")
      const fieldOptions: Record<string, string[]> = {
        legalStructure: ['LLC', 'Sole Proprietorship', 'Partnership', 'Public Joint Stock', 'Private Joint Stock'],
        nationality: ['UAE National / Emirati', 'Resident', 'GCC National'],
        industry: ['Technology', 'Retail', 'Manufacturing', 'Services', 'Healthcare', 'Education'],
        businessStage: ['Startup', 'Grown Up', 'Enterprise', 'Scale Up'],
        empowermentAndLeadership: ['Yes', 'No'] // No "All" option
      };

      const allOptions = fieldOptions[name] || [];
      const hasAllOption = name !== 'empowermentAndLeadership';

      // Empowerment and Leadership is handled separately as radio button
      if (name === 'empowermentAndLeadership') {
        // This shouldn't be called for radio buttons, but handle it gracefully
        return prev;
      }

      let newArray: string[];

      if (value === 'All' && hasAllOption) {
        // If "All" is clicked
        if (checked) {
          // Select "All" and all other options
          newArray = ['All', ...allOptions];
        } else {
          // Uncheck "All" and all other options
          newArray = [];
        }
      } else {
        // Regular option clicked
        newArray = checked
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value);

        // Remove "All" if any option is unchecked
        if (!checked) {
          newArray = newArray.filter(item => item !== 'All');
        }

        // If all non-"All" options are selected, automatically select "All"
        if (hasAllOption && checked) {
          const allNonAllSelected = allOptions.every(opt => newArray.includes(opt));
          if (allNonAllSelected && !newArray.includes('All')) {
            // Put "All" first, then the rest
            newArray = ['All', ...allOptions];
          }
        }
      }

      // Clear error when field is modified
      if (errors[name]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }

      return {
        ...prev,
        [name]: newArray
      };
    });
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox' && name === 'isApproved') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error when field is modified
      if (errors[name]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Handle blur event for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate form before submission
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      // Wait for state update, then scroll to first error
      setTimeout(() => {
        if (validationResult.errorFields.length > 0) {
          const firstErrorField = validationResult.errorFields[0];
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }, 100);
      return;
    }

    // Transform form data to match database schema
    const serviceType = formData.marketplace === 'Financial Services' ? 'Financial' : 'Non-Financial';
    const category = formData.addTags?.[0] || 'Advisory'; // Use first tag as category, default to Advisory

    // Extract eligibility from custom fields structure
    const eligibilityArray = formData.legalStructure.length > 0
      ? [...formData.legalStructure, ...formData.nationality, ...formData.businessStage]
      : [];

    // Ensure status is valid for services table (map 'Pending Review' to 'Pending')
    let serviceStatus = formData.isApproved ? 'Published' : 'Pending';
    if (serviceStatus === 'Pending Review') {
      serviceStatus = 'Pending';
    }

    const serviceData: any = {
      title: formData.name,
      type: serviceType,
      partner_name: formData.providedBy,
      category,
      processing_time: formData.processingTime,
      status: serviceStatus,
      description: formData.description,
      applicants: existingService ? existingService.applicants : 0,
      feedback: existingService ? existingService.feedback : { rating: 0, count: 0 },
      submitted_on: existingService ? existingService.submitted_on : new Date().toISOString(),

      // Flatten eligibility
      eligibility: [
        ...(formData.legalStructure || []),
        ...(formData.nationality || []),
        ...(formData.businessStage || []),
      ],

      // Cost
      fee: formData.cost ? `$${formData.cost}` : undefined,

      // Map other fields - split line by line into arrays
      documents_required: formData.requiredDocuments
        ? formData.requiredDocuments.split('\n').map(line => line.trim()).filter(Boolean)
        : [],

      application_requirements: formData.steps
        ? formData.steps.split('\n').map(line => line.trim()).filter(Boolean)
        : [],

      // Key Terms of Service as string (not array)
      key_terms_of_service: formData.keyTermsOfService.trim() || '',
      regulatory_category: formData.keyTermsOfService.trim() || '',
      outcome: formData.additionalTermsOfService || '',
      service_mode: formData.serviceMode ? [formData.serviceMode] : ['Online'],

      // Optional metadata
      registration_validity: formData.registrationValidity || '',
      related_services: formData.relatedServices || [],
      empowerment_and_leadership: formData.empowermentAndLeadership ? [formData.empowermentAndLeadership] : [], // Array with single value
      industry: formData.industry || [],
      tags: formData.addTags || [],

      partner_info: existingService
        ? {
          ...existingService.partner_info,
          name: formData.providedBy || existingService.partner_name,
          complianceNotes: formData.keyTermsOfService || '',
        }
        : {
          name: formData.providedBy,
          email: '',
          tier: 'Silver',
          totalSubmissions: 1,
          approvalRate: 0,
          complianceNotes: formData.keyTermsOfService || '',
        },

      comments: existingService ? existingService.comments : [],
      activity_log: existingService ? existingService.activity_log : [],
      updated_at: new Date().toISOString(),
    };


    // Add financial-specific fields if applicable
    if (serviceType === 'Financial') {
      serviceData.application_requirements = formData.steps.split('\n').filter(Boolean);
      serviceData.regulatory_category = formData.keyTermsOfService || '';
    } else {
      serviceData.outcome = formData.keyTermsOfService || '';
    }

    console.log('serviceData', serviceData, 'formData', formData);

    // Save to database
    try {
      setSubmitting(true);
      if (existingService?.id) {
        const updatedService = await update(existingService.id, serviceData);
        if (updatedService) {
          setToast({ type: 'success', message: 'Service updated successfully!' });
          // Navigate back to service management page after a short delay
          setTimeout(() => {
            navigate('/service-management');
          }, 1500);
        } else {
          // Service update failed - check for error details
          let errorMessage = 'Failed to update service. Please check your permissions and try again.';
          if (crudError) {
            // Include specific error message if available
            const errorMsg = crudError.message || '';
            if (errorMsg.includes('row-level security') || errorMsg.includes('permission')) {
              errorMessage = 'You do not have permission to update this service. Please contact an administrator.';
            } else if (errorMsg) {
              errorMessage = `Failed to update service: ${errorMsg}`;
            }
          }
          setToast({ type: 'error', message: errorMessage });
        }
      } else {
        const createdService = await create(serviceData);
        if (createdService) {
          setToast({ type: 'success', message: 'Service created successfully!' });
          // Navigate back to service management page after a short delay
          setTimeout(() => {
            navigate('/service-management');
          }, 1500);
        } else {
          // Service creation failed - check for error details
          let errorMessage = 'Failed to create service. Please check your permissions and try again.';
          if (crudError) {
            // Include specific error message if available
            const errorMsg = crudError.message || '';
            if (errorMsg.includes('row-level security') || errorMsg.includes('permission') || errorMsg.includes('Unauthorized')) {
              errorMessage = 'You do not have permission to create services. Please check your permissions or contact an administrator.';
            } else if (errorMsg) {
              errorMessage = `Failed to create service: ${errorMsg}`;
            }
          }
          setToast({ type: 'error', message: errorMessage });
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error instanceof Error
        ? `Failed to save service: ${error.message}`
        : 'Failed to save service. Please try again.';
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching service data (only for initial load, not submission)
  if ((loading || serviceLoading) && !submitting) {
    return (
      <div className="bg-gray-50 py-4 px-3 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading service data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4 px-3 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingService ? 'Edit Service' : 'Add New Service'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {existingService ? 'Update the details of an existing service' : 'Create a new service to be reviewed and published'}
          </p>
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <p className="mt-1 text-sm text-gray-500">Provide the essential details about the service.</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Service Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.name && errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.description && errors.description
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.description && errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              <div>
                <label htmlFor="providedBy" className="block text-sm font-medium text-gray-700">
                  Provided By *
                </label>
                <input
                  type="text"
                  id="providedBy"
                  name="providedBy"
                  value={formData.providedBy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="E.g. Khalifa Fund"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.providedBy && errors.providedBy
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.providedBy && errors.providedBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.providedBy}</p>
                )}
              </div>
              <div>
                <label htmlFor="marketplace" className="block text-sm font-medium text-gray-700">
                  Marketplace *
                </label>
                <select
                  id="marketplace"
                  name="marketplace"
                  value={formData.marketplace}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.marketplace && errors.marketplace
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                >
                  <option value="">Select marketplace</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Non-Financial Services">Non-Financial Services</option>
                </select>
                {touched.marketplace && errors.marketplace && (
                  <p className="mt-1 text-sm text-red-600">{errors.marketplace}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Service Details</h2>
              <p className="mt-1 text-sm text-gray-500">Processing time, cost, and service mode.</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="processingTime" className="block text-sm font-medium text-gray-700">
                  Processing Time *
                </label>
                <input
                  type="text"
                  id="processingTime"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="E.g. 7 Working Days"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.processingTime && errors.processingTime
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.processingTime && errors.processingTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.processingTime}</p>
                )}
              </div>
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                  Cost *
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  step="0.01"
                  placeholder="E.g. 2000"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.cost && errors.cost
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.cost && errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>
              <div>
                <label htmlFor="registrationValidity" className="block text-sm font-medium text-gray-700">
                  Registration Validity
                </label>
                <input
                  type="text"
                  id="registrationValidity"
                  name="registrationValidity"
                  value={formData.registrationValidity}
                  onChange={handleChange}
                  placeholder="E.g. N/A or 1 year"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="serviceMode" className="block text-sm font-medium text-gray-700">
                  Service Mode *
                </label>
                <select
                  id="serviceMode"
                  name="serviceMode"
                  value={formData.serviceMode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.serviceMode && errors.serviceMode
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                {touched.serviceMode && errors.serviceMode && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceMode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Documents */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Terms and Documents</h2>
              <p className="mt-1 text-sm text-gray-500">Key terms, additional terms, and required documents.</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4">
              <div>
                <label htmlFor="keyTermsOfService" className="block text-sm font-medium text-gray-700">
                  Key Terms of Service *
                </label>
                <textarea
                  id="keyTermsOfService"
                  name="keyTermsOfService"
                  rows={4}
                  value={formData.keyTermsOfService}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter key terms of service"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.keyTermsOfService && errors.keyTermsOfService
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.keyTermsOfService && errors.keyTermsOfService && (
                  <p className="mt-1 text-sm text-red-600">{errors.keyTermsOfService}</p>
                )}
              </div>
              <div>
                <label htmlFor="additionalTermsOfService" className="block text-sm font-medium text-gray-700">
                  Additional Terms of Service
                </label>
                <textarea
                  id="additionalTermsOfService"
                  name="additionalTermsOfService"
                  rows={4}
                  value={formData.additionalTermsOfService}
                  onChange={handleChange}
                  placeholder="Enter additional terms, one per line"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Enter each term on a new line</p>
              </div>
              <div>
                <label htmlFor="requiredDocuments" className="block text-sm font-medium text-gray-700">
                  Required Documents *
                </label>
                <textarea
                  id="requiredDocuments"
                  name="requiredDocuments"
                  rows={4}
                  value={formData.requiredDocuments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter required documents, one per line"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.requiredDocuments && errors.requiredDocuments
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.requiredDocuments && errors.requiredDocuments && (
                  <p className="mt-1 text-sm text-red-600">{errors.requiredDocuments}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter each document on a new line</p>
              </div>
              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700">
                  Application Steps *
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  rows={4}
                  value={formData.steps}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter application steps, one per line"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.steps && errors.steps
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                    }`}
                />
                {touched.steps && errors.steps && (
                  <p className="mt-1 text-sm text-red-600">{errors.steps}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter each step on a new line</p>
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Eligibility Criteria</h2>
              <p className="mt-1 text-sm text-gray-500">Select eligibility criteria for this service.</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Legal Structure</div>
                <div className="space-y-2">
                  {['All', 'LLC', 'Sole Proprietorship', 'Partnership', 'Public Joint Stock', 'Private Joint Stock'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.legalStructure.includes(option)}
                        onChange={(e) => handleMultiSelectChange('legalStructure', option, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Empowerment and Leadership *</div>
                <div className="space-y-2">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="empowermentAndLeadership"
                        value={option}
                        checked={formData.empowermentAndLeadership === option}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            empowermentAndLeadership: e.target.value
                          }));
                          // Clear error when field is modified
                          if (errors.empowermentAndLeadership) {
                            setErrors(prevErrors => {
                              const newErrors = { ...prevErrors };
                              delete newErrors.empowermentAndLeadership;
                              return newErrors;
                            });
                          }
                        }}
                        onBlur={handleBlur}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {touched.empowermentAndLeadership && errors.empowermentAndLeadership && (
                  <p className="mt-1 text-sm text-red-600">{errors.empowermentAndLeadership}</p>
                )}
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Nationality</div>
                <div className="space-y-2">
                  {['UAE National / Emirati', 'Resident', 'GCC National', 'All'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nationality.includes(option)}
                        onChange={(e) => handleMultiSelectChange('nationality', option, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Industry</div>
                <div className="space-y-2">
                  {['All', 'Technology', 'Retail', 'Manufacturing', 'Services', 'Healthcare', 'Education'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.industry.includes(option)}
                        onChange={(e) => handleMultiSelectChange('industry', option, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="block text-sm font-medium text-gray-700 mb-2">Business Stage</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Startup', 'Grown Up', 'Enterprise', 'Scale Up', 'All'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.businessStage.includes(option)}
                        onChange={(e) => handleMultiSelectChange('businessStage', option, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
              <p className="mt-1 text-sm text-gray-500">Tags and approval status.</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4">
              <div>
                <label htmlFor="addTags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="addTags"
                  name="addTags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onBlur={() => {
                    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, addTags: tags }));
                  }}
                  placeholder="Enter tags separated by commas (e.g. Support Services, Funding)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
              </div>
              {/* <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Approved</span>
                </label>
              </div> */}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/service-management')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {existingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Loading Overlay during form submission */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 text-center">
                {existingService ? 'Updating service...' : 'Creating service...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapDbServiceToForm = (service: any): ServiceData => {
  const marketplace = service.type === 'Financial'
    ? 'Financial Services'
    : 'Non-Financial Services';

  const costMatch = service.fee?.match(/[\d.]+/);
  const cost = costMatch ? parseFloat(costMatch[0]) : undefined;

  // Parse eligibility into fields
  const eligibility = service.eligibility || [];
  const legalStructure: string[] = [];
  const nationality: string[] = [];
  const businessStage: string[] = [];

  eligibility.forEach((item: string) => {
    if (item.includes('National') || item.includes('Emirati')) {
      nationality.push(item);
    } else if (item.includes('year') || item.includes('revenue') || item.includes('Credit')) {
      businessStage.push(item);
    } else {
      legalStructure.push(item);
    }
  });

  return {
    id: service.id,
    name: service.title || '',
    slug: service.id,
    description: service.description || '',
    facetValues: [
      {
        facet: { name: 'Provided By', code: 'provided-by' },
        name: service.partner_name || '',
        code: (service.partner_name || '').toLowerCase().replace(/\s+/g, '-'),
      },
      {
        facet: { name: 'Marketplace', code: 'marketplace' },
        name: marketplace,
        code: marketplace.toLowerCase().replace(/\s+/g, '-'),
      }
    ],
    customFields: {
      ProcessingTime: service.processing_time || '',
      Cost: cost,
      RegistrationValidity: 'N/A',
      KeyTermsOfService: service.regulatory_category || '',
      AdditionalTermsOfService: [],
      RequiredDocuments: service.documents_required || [],
      Steps: service.application_requirements || [],
      ServiceMode: ['Online'],
      LegalStructure: legalStructure,
      EmpowermentandLeadership: [],
      Nationality: nationality,
      Industry: [],
      BusinessStage: businessStage,
      Addtags: service.category ? [service.category] : [],
      isApproved: service.status === 'Published',
      RelatedServices: []
    }
  };
};
