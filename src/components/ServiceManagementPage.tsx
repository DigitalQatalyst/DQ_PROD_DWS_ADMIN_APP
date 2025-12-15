import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ArchiveIcon, CalendarIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, DownloadIcon, PlusIcon, EditIcon, AlertCircleIcon } from 'lucide-react';
import { ServiceDetailsDrawer } from './ServiceDetailsDrawer';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SendBackModal } from './SendBackModal';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
// import { usePermissions } from '../hooks/usePermissions'; // DEPRECATED: Use CASL Can component instead
import { Service } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';

export const ServiceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  // const { canCreate, canUpdate, canDelete, canApprove } = usePermissions('services'); // DEPRECATED: Use CASL Can component instead
  const { data: services, loading, error, list, update } = useCRUD<Service>('mktplc_services');

  // State management
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [serviceType, setServiceType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);
  // Use Supabase data directly - RLS will handle filtering
  const displayServices = services;

  // Helper function to get submitted date from either property name
  const getSubmittedDate = (service: any) => {
    return service.submitted_on || service.submittedOn;
  };

  // Helper function to convert mock data to Service type
  const convertToServiceType = (service: any): Service => {
    return {
      ...service,
      submitted_on: service.submitted_on || service.submittedOn,
      type: service.type as 'Financial' | 'Non-Financial',
      status: service.status as Service['status']
    };
  };

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
      } catch (err) {
        console.error('Failed to load services from database:', err);
      }
    };

    // Only load if auth is ready
    if (!authLoading) {
      loadServices();
    }
  }, [list, authLoading]);

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('serviceId');
    if (serviceId) {
      const service = displayServices.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(convertToServiceType(service));
        setIsDrawerOpen(true);
      }
    }
  }, [displayServices]);

  // Show loading state while auth is initializing (after all hooks)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if data fetch is forbidden or failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
          <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load services</h2>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || 'You may not have permission to view this page.'}
          </p>
          <p className="text-xs text-gray-500">
            If you just signed in, please refresh the page. If the issue persists, contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Summary data calculation based on current services
  const summaryData = [{
    id: 'pending',
    title: 'Pending Approvals',
    count: displayServices.filter(service => service.status === 'Pending').length,
    icon: ClockIcon,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200'
  }, {
    id: 'published',
    title: 'Published Services',
    count: displayServices.filter(service => service.status === 'Published').length,
    icon: CheckCircleIcon,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-200'
  }, {
    id: 'unpublished',
    title: 'Unpublished',
    count: displayServices.filter(service => service.status === 'Unpublished').length,
    icon: InfoIcon,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  }, {
    id: 'archived',
    title: 'Archived',
    count: displayServices.filter(service => service.status === 'Archived').length,
    icon: ArchiveIcon,
    color: 'bg-gray-100 text-gray-600',
    borderColor: 'border-gray-200'
  }];

  // Filter and sort services
  const filteredServices = displayServices.filter(service => {
    // Filter by type
    if (serviceType !== 'All' && service.type !== serviceType) return false;
    // Filter by status
    if (statusFilter !== 'All' && service.status !== statusFilter) return false;
    // Filter by category
    if (categoryFilter !== 'All' && service.category !== categoryFilter) return false;
    // Filter by partner
    if (partnerFilter !== 'All' && service.partner !== partnerFilter) return false;
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const submittedDate = new Date(getSubmittedDate(service));
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      if (submittedDate < startDate || submittedDate > endDate) return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return service.title.toLowerCase().includes(query) || service.partner.toLowerCase().includes(query) || service.category.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    // Sort by submission date
    const dateA = new Date(getSubmittedDate(a)).getTime();
    const dateB = new Date(getSubmittedDate(b)).getTime();
    return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredServices.length);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);
  // Render service type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Financial: 'bg-blue-100 text-blue-800 border border-blue-200',
      'Non-Financial': 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>;
  };
  // Render service status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Published: 'bg-green-100 text-green-800 border border-green-200',
      Unpublished: 'bg-blue-100 text-blue-800 border border-blue-200',
      Archived: 'bg-gray-100 text-gray-800 border border-gray-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      'Sent Back': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>;
  };
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Handle row click to open drawer
  const handleRowClick = (serviceId: string) => {
    const service = displayServices.find(item => item.id === serviceId);
    if (service) {
      setSelectedService(convertToServiceType(service));
      setIsDrawerOpen(true);
      // Update URL with serviceId parameter for deep linking
      const url = new URL(window.location.href);
      url.searchParams.set('serviceId', serviceId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    }
  };
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, serviceId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(serviceId);
    }
  };
  // Handle add new service button click
  const handleAddNewService = () => {
    navigate('/service-form');
  };
  // Handle edit service
  const handleEditService = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation(); // Prevent row click handler from firing
    navigate(`/service-form/${serviceId}`);
  };
  // Handle service actions
  const handleApproveService = async () => {
    if (!selectedService) return;

    // Permission check is now handled by CASL Can component in the UI
    // No need for manual permission checking here

    try {
      let newStatus: Service['status'];

      // Final approval - publish the service
      newStatus = 'Published';
      showToast('success', `Service "${selectedService.title}" approved and published!`);

      // Update in database
      await update(selectedService.id, { status: newStatus });

      setShowApproveModal(false);
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('error', 'Failed to approve service');
      console.error('Error approving service:', err);
    }
  };

  const handleRejectService = async (reason: string) => {
    if (!selectedService) return;

    // Permission check is now handled by CASL Can component in the UI
    // No need for manual permission checking here

    try {
      // Update in database
      await update(selectedService.id, {
        status: 'Rejected',
        comments: [
          ...(selectedService.comments || []),
          {
            id: Date.now().toString(),
            author: user?.name || 'Unknown',
            role: role,
            text: `Rejected: ${reason}`,
            timestamp: new Date().toISOString()
          }
        ]
      });

      showToast('success', `Service "${selectedService.title}" rejected`);
      setShowRejectModal(false);
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('error', 'Failed to reject service');
      console.error('Error rejecting service:', err);
    }
  };

  const handleSendBackService = async (reason: string, comments: string) => {
    if (!selectedService) return;

    // Permission check is now handled by CASL Can component in the UI
    // No need for manual permission checking here

    try {
      // Update in database
      await update(selectedService.id, {
        status: 'Sent Back',
        comments: [
          ...(selectedService.comments || []),
          {
            id: Date.now().toString(),
            author: user?.name || 'Unknown',
            role: role,
            text: `Sent back: ${reason} - ${comments}`,
            timestamp: new Date().toISOString()
          }
        ]
      });

      showToast('success', `Service "${selectedService.title}" sent back to partner`);
      setShowSendBackModal(false);
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('error', 'Failed to send back service');
      console.error('Error sending back service:', err);
    }
  };
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Clear URL parameters when drawer closes
    const url = new URL(window.location.href);
    url.searchParams.delete('serviceId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
  };
  // Get unique categories for filters
  const uniqueCategories = Array.from(new Set(displayServices.map(service => service.category)));
  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };
  // Handle date filter toggle
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };
  // Handle clear all filters
  const handleClearFilters = () => {
    setServiceType('All');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPartnerFilter('All');
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };
  return <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
    {/* Page Header */}
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
            Service Management
          </h1>
          <p className="text-sm text-gray-500 text-center sm:text-left">
            View, approve, and manage all partner-submitted services across
            their lifecycle.
          </p>
        </div>
        <Can I="create" a="Service">
          <button onClick={handleAddNewService} className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add New Service
          </button>
        </Can>
      </div>
    </div>
    {/* Summary Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {summaryData.map(item => <div key={item.id} className="rounded-xl shadow-sm border border-gray-100 bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out">
        <div className="flex items-center">
          <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-[13px] text-gray-600 font-medium">
              {item.title}
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              {item.count}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="text-green-500">+5%</span> from last week
            </p>
          </div>
        </div>
      </div>)}
    </div>
    {/* Toolbar */}
    <div className="sticky top-[3.5rem] bg-gray-50 z-20 pb-2">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs" placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {/* Filter Chips */}
          <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Financial">Financial</option>
                <option value="Non-Financial">Non-Financial</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All States</option>
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Archived">Archived</option>
                <option value="Rejected">Rejected</option>
                <option value="Sent Back">Sent Back</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                {uniqueCategories.map(category => <option key={category} value={category}>
                  {category}
                </option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={toggleDateFilter}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Date Range</span>
              </button>
            </div>
            <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <DownloadIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
            {(serviceType !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || partnerFilter !== 'All' || dateRange.startDate || dateRange.endDate || searchQuery) && <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>}
          </div>
        </div>
        {/* Date Range Filter */}
        {showDateFilter && <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input type="date" id="start-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.startDate} onChange={e => setDateRange({
                  ...dateRange,
                  startDate: e.target.value
                })} />
              </div>
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input type="date" id="end-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.endDate} onChange={e => setDateRange({
                  ...dateRange,
                  endDate: e.target.value
                })} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-3">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={() => {
              setDateRange({
                startDate: '',
                endDate: ''
              });
            }}>
              Clear Dates
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors duration-150" onClick={toggleDateFilter}>
              Apply
            </button>
          </div>
        </div>}
      </div>
    </div>
    {/* Services Table - Desktop and Tablet View */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Services</h2>
          {filteredServices.length > 0 && <p className="text-sm text-gray-500 mt-1 sm:mt-0">
            Showing {startIndex + 1}-{endIndex} of {filteredServices.length}{' '}
            services
          </p>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Service Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Service Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Partner
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                State
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider hidden lg:table-cell">
                Applicants
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Submitted On
              </th>
              <th scope="col" className="relative px-4 py-3 w-16">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedServices.length === 0 ? <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                No services found
              </td>
            </tr> : paginatedServices.map(service => <tr key={service.id} onClick={() => handleRowClick(service.id)} onKeyDown={e => handleRowKeyDown(e, service.id)} tabIndex={0} role="button" className="cursor-pointer hover:bg-gray-50 transition-colors duration-150" aria-label={`View details for ${service.title}`}>
              <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                {service.title}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {renderType(service.type)}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {service.partner}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {service.category}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {renderStatus(service.status)}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700 text-right hidden lg:table-cell">
                {service.applicants}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {formatDate(getSubmittedDate(service))}
              </td>
              <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                <div className="flex items-center justify-end space-x-2">
                  <Can I="update" a="Service">
                    <button onClick={e => handleEditService(e, service.id)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" aria-label="Edit service">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </Can>
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {/* Services Mobile Card View */}
    <div className="md:hidden space-y-3 mt-2">
      {paginatedServices.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">No services found</p>
      </div> : paginatedServices.map(service => <div key={service.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200" onClick={() => handleRowClick(service.id)} onKeyDown={e => handleRowKeyDown(e, service.id)} tabIndex={0} role="button" aria-label={`View details for ${service.title}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
            {service.title}
          </h3>
          {renderStatus(service.status)}
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">{service.type}</span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>{' '}
            <span className="font-medium">{service.category}</span>
          </div>
          <div>
            <span className="text-gray-500">Partner:</span>{' '}
            <span className="font-medium text-gray-700 truncate max-w-[120px] inline-block align-bottom">
              {service.partner}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Submitted:</span>{' '}
            <span className="font-medium">
              {formatDate(getSubmittedDate(service))}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <UserIcon className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-[11px] text-gray-700">
              {service.applicants}
            </span>
          </div>
          <div className="flex space-x-3">
            <Can I="update" a="Service">
              <button onClick={e => {
                e.stopPropagation();
                handleEditService(e, service.id);
              }} className="text-blue-600 text-[12px] font-medium flex items-center">
                Edit
              </button>
            </Can>
            <button className="text-blue-600 text-[12px] font-medium flex items-center">
              View
              <ChevronRightIcon className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>)}
    </div>
    {/* Pagination Controls */}
    {filteredServices.length > 0 && <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-4 sm:mb-0">
        <label htmlFor="rows-per-page" className="text-[12px] sm:text-sm text-gray-600 mr-2">
          Rows per page:
        </label>
        <select id="rows-per-page" className="border border-gray-300 rounded-md text-[12px] sm:text-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center justify-center">
          <button onClick={handlePreviousPage} disabled={currentPage === 1} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex">
            {/* Show limited page numbers with ellipsis for large page counts */}
            {Array.from({
              length: totalPages
            }, (_, i) => i + 1).filter(page => {
              // Show current page, first and last pages, and pages around current
              return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
            }).map((page, i, arr) => <Fragment key={page}>
              {i > 0 && arr[i - 1] !== page - 1 && <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm text-gray-500 border-t border-b border-gray-300">
                ...
              </span>}
              <button onClick={() => handlePageChange(page)} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border-t border-b border-gray-300 ${currentPage === page ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'} ${i === 0 && page !== 1 ? 'border-l border-gray-300' : ''}`}>
                {page}
              </button>
            </Fragment>)}
          </div>
          {/* Simple mobile pagination */}
          <div className="flex sm:hidden items-center border-t border-b border-gray-300 px-3 py-1">
            <span className="text-[12px] text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-[12px] sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {startIndex + 1}-{endIndex} of {filteredServices.length}
        </div>
      </div>
    </div>}
    {/* Empty State */}
    {filteredServices.length === 0 && <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
      <div className="mx-auto max-w-md">
        <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
          <FilterIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          No services found for this filter
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search or filter criteria to find what you're
          looking for.
        </p>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      </div>
    </div>}
    {/* Floating Action Button */}
    <Can I="create" a="Service">
      <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200" aria-label="Add new service" onClick={handleAddNewService}>
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    </Can>
    {/* Service Details Drawer */}
    {selectedService && <ServiceDetailsDrawer
      isOpen={isDrawerOpen}
      onClose={handleDrawerClose}
      service={selectedService}
      onApprove={() => setShowApproveModal(true)}
      onReject={() => setShowRejectModal(true)}
      onSendBack={() => setShowSendBackModal(true)}
      // canApprove={canApprove}
      // canUpdate={canUpdate}
      // canDelete={canDelete}
      onRefresh={async () => {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
      }}
      showToast={(message, type) => showToast(type, message)}
    />}
    {/* Action Modals */}
    {selectedService && <>
      <ApproveModal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} onConfirm={handleApproveService} listing={selectedService} />
      <RejectModal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={handleRejectService} listing={selectedService} />
      <SendBackModal isOpen={showSendBackModal} onClose={() => setShowSendBackModal(false)} onConfirm={handleSendBackService} listing={selectedService} />
    </>}

    {/* Toast Notifications */}
    {toast && (
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(null)}
      />
    )}

    {/* Loading Overlay */}
    {loading && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    )}

    {/* Error Banner */}
    {error && (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-lg">
          <div className="flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
              <p className="mt-1 text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>;
};