import React, { useEffect, useState, Fragment, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ArchiveIcon, CalendarIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, DownloadIcon, PlusIcon, EditIcon, AlertCircleIcon } from 'lucide-react';
import { ServiceDetailsDrawer } from './ServiceDetailsDrawer';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SendBackModal } from './SendBackModal';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
// import { usePermissions } from '../hooks/usePermissions'; // DEPRECATED: Use CASL Can component instead
import { Service, ExperienceCenterRequest, TechSupportRequest, LeaveRequest, WFHRequest } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';
import { supabase2 } from '../lib/supabase2';

export const ServiceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
  // Experience Center Requests state
  const [activeTab, setActiveTab] = useState<'marketplace' | 'experience'>('marketplace');
  const [experienceRequests, setExperienceRequests] = useState<ExperienceCenterRequest[]>([]);
  const [experienceLoading, setExperienceLoading] = useState(false);

  // Use Supabase data directly - RLS will handle filtering
  const displayServices = services || [];

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

  const fetchMarketplaceServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase2
        .from('marketplace_services')
        .select('*');

      // Apply organization filter for non-internal users
      const organizationId = user?.organization_id || localStorage.getItem('user_organization_id');
      const userSegment = role === 'admin' && !organizationId ? 'internal' : (user?.user_segment || localStorage.getItem('user_segment'));

      if (organizationId && userSegment !== 'internal') {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err) {
      console.error('Failed to load marketplace services:', err);
      setError(err instanceof Error ? err : new Error('Failed to load marketplace services'));
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  // Load marketplace services on mount
  useEffect(() => {
    if (!authLoading) {
      fetchMarketplaceServices();
    }
  }, [fetchMarketplaceServices, authLoading]);

  // Load Experience Center requests
  useEffect(() => {
    const fetchExperienceRequests = async () => {
      setExperienceLoading(true);
      try {
        const [techRes, leaveRes, wfhRes] = await Promise.all([
          supabase2.from('tech_support_requests').select('*'),
          supabase2.from('leave_requests').select('*'),
          supabase2.from('wfh_requests').select('*')
        ]);

        const techData = (techRes.data || []).map(r => ({ ...r, request_type: 'Tech Support' as const }));
        const leaveData = (leaveRes.data || []).map(r => ({ ...r, request_type: 'Leave' as const }));
        const wfhData = (wfhRes.data || []).map(r => ({ ...r, request_type: 'WFH' as const }));

        setExperienceRequests([...techData, ...leaveData, ...wfhData] as ExperienceCenterRequest[]);
      } catch (err) {
        console.error('Failed to fetch requests from Supabase 2:', err);
      } finally {
        setExperienceLoading(false);
      }
    };

    if (!authLoading && activeTab === 'experience') {
      fetchExperienceRequests();
    }
  }, [authLoading, activeTab]);

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('serviceId');
    if (serviceId && displayServices.length > 0) {
      const service = displayServices.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(convertToServiceType(service));
        setIsDrawerOpen(true);
      }
    }
  }, [displayServices]);

  // Show loading state while auth is initializing
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

  // Summary data calculation
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
    if (serviceType !== 'All' && service.type !== serviceType) return false;
    if (statusFilter !== 'All' && service.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && service.category !== categoryFilter) return false;
    if (partnerFilter !== 'All' && service.partner !== partnerFilter) return false;
    if (dateRange.startDate && dateRange.endDate) {
      const submittedDate = new Date(getSubmittedDate(service));
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (submittedDate < startDate || submittedDate > endDate) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return service.title.toLowerCase().includes(query) || service.partner.toLowerCase().includes(query) || service.category.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(getSubmittedDate(a)).getTime();
    const dateB = new Date(getSubmittedDate(b)).getTime();
    return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredServices.length);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Render helpers
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Financial: 'bg-blue-100 text-blue-800 border border-blue-200',
      'Non-Financial': 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>;
  };

  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Published: 'bg-green-100 text-green-800 border border-green-200',
      Unpublished: 'bg-blue-100 text-blue-800 border border-blue-200',
      Archived: 'bg-gray-100 text-gray-800 border border-gray-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      'Sent Back': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Event handlers
  const handleRowClick = (serviceId: string) => {
    const service = displayServices.find(item => item.id === serviceId);
    if (service) {
      setSelectedService(convertToServiceType(service));
      setIsDrawerOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.set('serviceId', serviceId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, serviceId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(serviceId);
    }
  };

  const handleAddNewService = () => navigate('/service-form');
  const handleEditService = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    navigate(`/service-form/${serviceId}`);
  };

  const handleApproveService = async () => {
    if (!selectedService) return;
    try {
      setLoading(true);
      const { error: updateError } = await supabase2
        .from('marketplace_services')
        .update({ status: 'Published', updated_at: new Date().toISOString() })
        .eq('id', selectedService.id);

      if (updateError) throw updateError;

      showToast('success', `Service "${selectedService.title}" approved and published!`);
      setShowApproveModal(false);
      setIsDrawerOpen(false);
      await fetchMarketplaceServices();
    } catch (err) {
      showToast('error', 'Failed to approve service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectService = async (reason: string) => {
    if (!selectedService) return;
    try {
      setLoading(true);
      const { error: updateError } = await supabase2
        .from('marketplace_services')
        .update({
          status: 'Rejected',
          updated_at: new Date().toISOString(),
          comments: [...(selectedService.comments || []), {
            id: Date.now().toString(),
            author: user?.name || 'Unknown',
            role: role,
            text: `Rejected: ${reason}`,
            timestamp: new Date().toISOString()
          }]
        })
        .eq('id', selectedService.id);

      if (updateError) throw updateError;

      showToast('success', `Service "${selectedService.title}" rejected`);
      setShowRejectModal(false);
      setIsDrawerOpen(false);
      await fetchMarketplaceServices();
    } catch (err) {
      showToast('error', 'Failed to reject service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBackService = async (reason: string, comments: string) => {
    if (!selectedService) return;
    try {
      setLoading(true);
      const { error: updateError } = await supabase2
        .from('marketplace_services')
        .update({
          status: 'Sent Back',
          updated_at: new Date().toISOString(),
          comments: [...(selectedService.comments || []), {
            id: Date.now().toString(),
            author: user?.name || 'Unknown',
            role: role,
            text: `Sent back: ${reason} - ${comments}`,
            timestamp: new Date().toISOString()
          }]
        })
        .eq('id', selectedService.id);

      if (updateError) throw updateError;

      showToast('success', `Service "${selectedService.title}" sent back to partner`);
      setShowSendBackModal(false);
      setIsDrawerOpen(false);
      await fetchMarketplaceServices();
    } catch (err) {
      showToast('error', 'Failed to send back service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('serviceId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
  };

  const uniqueCategories = Array.from(new Set(displayServices.map(service => service.category)));
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const toggleDateFilter = () => setShowDateFilter(!showDateFilter);
  const handleClearFilters = () => {
    setServiceType('All');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPartnerFilter('All');
    setDateRange({ startDate: '', endDate: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Service Management</h1>
            <p className="text-sm text-gray-500">View, approve, and manage all services.</p>
          </div>
          <Can I="create" a="Service">
            <button onClick={handleAddNewService} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add New Service
            </button>
          </Can>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'marketplace' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Marketplace Services
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'experience' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Experience Center Requests
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {summaryData.map(item => (
          <div key={item.id} className="rounded-xl shadow-sm border border-gray-100 bg-white px-3 py-4 hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-[13px] text-gray-600 font-medium">{item.title}</h3>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{item.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide">
            <select
              className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Financial">Financial</option>
              <option value="Non-Financial">Non-Financial</option>
            </select>

            <select
              className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Published">Published</option>
              <option value="Unpublished">Unpublished</option>
              <option value="Archived">Archived</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={toggleDateFilter}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Date</span>
            </button>

            {(serviceType !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {showDateFilter && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg text-sm"
                value={dateRange.startDate}
                onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg text-sm"
                value={dateRange.endDate}
                onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {activeTab === 'marketplace' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedServices.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No services found</td></tr>
                ) : (
                  paginatedServices.map(service => (
                    <tr key={service.id} onClick={() => handleRowClick(service.id)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{service.title}</td>
                      <td className="px-4 py-4 text-sm">{renderType(service.type)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{service.partner}</td>
                      <td className="px-4 py-4 text-sm">{renderStatus(service.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(getSubmittedDate(service))}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Can I="update" a="Service">
                            <button onClick={e => handleEditService(e, service.id)} className="p-1 text-gray-400 hover:text-blue-600">
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </Can>
                          <ChevronRightIcon className="h-4 w-4 text-gray-300" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {experienceRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {experienceLoading ? 'Loading...' : 'No requests found'}
                  </td></tr>
                ) : (
                  experienceRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-mono text-gray-500">{request.id.slice(0, 8)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${request.request_type === 'Tech Support' ? 'bg-blue-100 text-blue-700' :
                          request.request_type === 'Leave' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                          {request.request_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {request.request_type === 'Tech Support' ? (request as TechSupportRequest).subject :
                          request.request_type === 'Leave' ? (request as LeaveRequest).leave_type : 'WFH Request'}
                      </td>
                      <td className="px-4 py-4 text-sm">{renderStatus(request.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(request.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination (Marketplace only) */}
      {activeTab === 'marketplace' && filteredServices.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {filteredServices.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded border ${currentPage === 1 ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded border ${currentPage === totalPages ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {activeTab === 'marketplace' && (
        <Can I="create" a="Service">
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={handleAddNewService}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        </Can>
      )}

      {/* Modals & Drawer */}
      {selectedService && (
        <>
          <ServiceDetailsDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            service={selectedService}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
            onSendBack={() => setShowSendBackModal(true)}
            onRefresh={fetchMarketplaceServices}
            showToast={showToast}
          />
          <ApproveModal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} onConfirm={handleApproveService} listing={selectedService} />
          <RejectModal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={handleRejectService} listing={selectedService} />
          <SendBackModal isOpen={showSendBackModal} onClose={() => setShowSendBackModal(false)} onConfirm={handleSendBackService} listing={selectedService} />
        </>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Updating services...</p>
          </div>
        </div>
      )}
    </div>
  );
};