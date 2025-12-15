import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ArchiveIcon, CalendarIcon, UserIcon, StarIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, DownloadIcon, PlusIcon, BuildingIcon, GlobeIcon, MapPinIcon, BriefcaseIcon, UsersIcon, AlertCircleIcon } from 'lucide-react';
import { BusinessDetailsDrawer } from './BusinessDetailsDrawer';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Can } from './auth/Can';
import { Business } from '../types';
import { Toast } from './ui/Toast';

export const BusinessDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  const { data: businesses, loading, error, list } = useCRUD<Business>('eco_business_directory');
  
  // Use Supabase data directly - RLS will handle filtering
  const displayBusinesses = businesses;
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Use state to manage the businesses data
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [businessType, setBusinessType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Load businesses on mount - wait for auth to finish loading
  useEffect(() => {
    const loadBusinesses = async () => {
      // Don't fetch if auth is still loading
      if (authLoading) {
        console.log('⏳ Auth still loading, waiting before fetching businesses...');
        return;
      }
      
      try {
        console.log('📊 Fetching businesses from Supabase...');
        await list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' });
        console.log('✅ Businesses fetched successfully');
      } catch (err) {
        console.error('Failed to load businesses from database:', err);
        showToast('error', 'Failed to load businesses from database.');
      }
    };

    loadBusinesses();
  }, [list, authLoading]);

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('businessId');
    const view = urlParams.get('view');
    if (businessId) {
      const business = displayBusinesses.find(b => b.id === businessId);
      if (business) {
        setSelectedBusiness(business);
        setIsDrawerOpen(true);
      }
    }
  }, [displayBusinesses]);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Summary data calculation based on current businesses
  const summaryData = [{
    id: 'government',
    title: 'Government',
    count: displayBusinesses.filter(business => business.type === 'Government').length,
    icon: BuildingIcon,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  }, {
    id: 'private',
    title: 'Private',
    count: displayBusinesses.filter(business => business.type === 'Private').length,
    icon: BriefcaseIcon,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200'
  }, {
    id: 'semi-government',
    title: 'Semi-Government',
    count: displayBusinesses.filter(business => business.type === 'Semi-Government').length,
    icon: BuildingIcon,
    color: 'bg-emerald-100 text-emerald-600',
    borderColor: 'border-emerald-200'
  }, {
    id: 'featured',
    title: 'Featured',
    count: displayBusinesses.filter(business => business.status === 'Featured').length,
    icon: StarIcon,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200'
  }];
  // Filter and sort businesses
  const filteredBusinesses = displayBusinesses.filter(business => {
    // Filter by type
    if (businessType !== 'All' && business.type !== businessType) return false;
    // Filter by status
    if (statusFilter !== 'All' && business.status !== statusFilter) return false;
    // Filter by industry
    if (industryFilter !== 'All' && business.industry !== industryFilter) return false;
    // Filter by size
    if (sizeFilter !== 'All' && business.size !== sizeFilter) return false;
    // Filter by date range (using foundedYear)
    if (dateRange.startDate && dateRange.endDate) {
      const foundedYear = parseInt(business.foundedYear);
      const startYear = new Date(dateRange.startDate).getFullYear();
      const endYear = new Date(dateRange.endDate).getFullYear();
      if (foundedYear < startYear || foundedYear > endYear) return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return business.name.toLowerCase().includes(query) || business.industry.toLowerCase().includes(query) || business.description && business.description.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    // Sort by name
    if (sortOrder === 'A-Z') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'Z-A') {
      return b.name.localeCompare(a.name);
    }
    // Sort by founded year
    else if (sortOrder === 'Oldest First') {
      return parseInt(a.foundedYear) - parseInt(b.foundedYear);
    } else if (sortOrder === 'Newest First') {
      return parseInt(b.foundedYear) - parseInt(a.foundedYear);
    }
    return 0;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredBusinesses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredBusinesses.length);
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex);
  
  // Debug: Log businesses data when it changes
  useEffect(() => {
    console.log('📋 Businesses data updated:', {
      total: businesses.length,
      displayed: displayBusinesses.length,
      filtered: filteredBusinesses.length,
      paginated: paginatedBusinesses.length,
      sampleBusiness: businesses[0]
    });
  }, [businesses, displayBusinesses, filteredBusinesses, paginatedBusinesses]);
  
  // Render business type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Government: 'bg-blue-100 text-blue-800 border border-blue-200',
      Private: 'bg-purple-100 text-purple-800 border border-purple-200',
      'Semi-Government': 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>;
  };
  // Render business status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border border-green-200',
      Inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Featured: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Render size with appropriate styling
  const renderSize = (size: string) => {
    const sizeStyles: Record<string, string> = {
      Small: 'bg-blue-100 text-blue-800 border border-blue-200',
      Medium: 'bg-green-100 text-green-800 border border-green-200',
      Large: 'bg-purple-100 text-purple-800 border border-purple-200',
      Enterprise: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${sizeStyles[size] || 'bg-gray-100 text-gray-800'}`}>
        {size}
      </span>;
  };
  // Handle row click to open drawer
  const handleRowClick = (businessId: string) => {
    const business = displayBusinesses.find(item => item.id === businessId);
    if (business) {
      setSelectedBusiness(business);
      setIsDrawerOpen(true);
      // Update URL with businessId parameter for deep linking
      const url = new URL(window.location.href);
      url.searchParams.set('businessId', businessId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    }
  };
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, businessId: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/business-form/${businessId}`);
  };
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, businessId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(businessId);
    }
  };
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Clear URL parameters when drawer closes
    const url = new URL(window.location.href);
    url.searchParams.delete('businessId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
  };
  // Get unique industries and sizes for filters
  const uniqueIndustries = Array.from(new Set(displayBusinesses.map(business => business.industry)));
  const uniqueSizes = Array.from(new Set(displayBusinesses.map(business => business.size).filter(Boolean)));
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
    setBusinessType('All');
    setStatusFilter('All');
    setIndustryFilter('All');
    setSizeFilter('All');
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Business Directory
            </h1>
            <div className="relative group hidden sm:block">
              <InfoIcon className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute left-0 top-full mt-2 w-72 bg-white p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <p className="text-sm text-gray-700">
                  Explore businesses in Abu Dhabi to understand the local
                  business ecosystem.
                </p>
              </div>
            </div>
          </div>
          {/* Add button in the header */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center justify-center text-sm font-medium hidden sm:flex" onClick={() => navigate('/business-form')}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Business
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center sm:text-left">
          Browse and discover businesses across various industries in Abu Dhabi.
        </p>
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
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs" placeholder="Search businesses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {/* Filter Chips */}
            <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Semi-Government">Semi-Government</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Featured">Featured</option>
                  <option value="Pending">Pending</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}>
                  <option value="All">All Industries</option>
                  {uniqueIndustries.map(industry => <option key={industry} value={industry}>
                      {industry}
                    </option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
                  <option value="All">All Sizes</option>
                  {uniqueSizes.map(size => <option key={size} value={size}>
                      {size}
                    </option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                  <option value="A-Z">Name (A-Z)</option>
                  <option value="Z-A">Name (Z-A)</option>
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
                  <span className="hidden sm:inline">Founded Year</span>
                </button>
              </div>
              <div className="flex-shrink-0">
                <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <DownloadIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
              {(businessType !== 'All' || statusFilter !== 'All' || industryFilter !== 'All' || sizeFilter !== 'All' || dateRange.startDate || dateRange.endDate || searchQuery) && <div className="flex-shrink-0">
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
                    From Year
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
                    To Year
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
      {/* Businesses Table - Desktop and Tablet View */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Businesses</h2>
            {filteredBusinesses.length > 0 && <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                Showing {startIndex + 1}-{endIndex} of{' '}
                {filteredBusinesses.length} businesses
              </p>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Business Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider hidden lg:table-cell">
                  Founded
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Location
                </th>
                <th scope="col" className="relative px-4 py-3 w-10">
                  <span className="sr-only">View</span>
                </th>
                <th scope="col" className="relative px-4 py-3 w-10">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedBusinesses.length === 0 ? <tr>
                  <td colSpan={9} className="px-4 py-4 text-center text-sm text-gray-500">
                    No businesses found
                  </td>
                </tr> : paginatedBusinesses.map(business => <tr key={business.id} onClick={() => handleRowClick(business.id)} onKeyDown={e => handleRowKeyDown(e, business.id)} tabIndex={0} role="button" className="cursor-pointer hover:bg-gray-50 transition-colors duration-150" aria-label={`View details for ${business.name}`}>
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                      {business.name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderType(business.type)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {business.industry}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {business.size ? renderSize(business.size) : '-'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderStatus(business.status)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 text-right hidden lg:table-cell">
                      {business.foundedYear}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {business.address ? business.address.city : '-'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                      <EyeIcon className="h-4 w-4 inline-block" />
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                      <button onClick={e => handleEditClick(e, business.id)} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${business.name}`}>
                        <svg className="h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {/* Businesses Mobile Card View */}
      <div className="md:hidden space-y-3 mt-2">
        {paginatedBusinesses.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">No businesses found</p>
          </div> : paginatedBusinesses.map(business => <div key={business.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200" onClick={() => handleRowClick(business.id)} onKeyDown={e => handleRowKeyDown(e, business.id)} tabIndex={0} role="button" aria-label={`View details for ${business.name}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
                  {business.name}
                </h3>
                {renderStatus(business.status)}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
                <div>
                  <span className="text-gray-500">Type:</span>{' '}
                  <span className="font-medium">{business.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Industry:</span>{' '}
                  <span className="font-medium">{business.industry}</span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>{' '}
                  <span className="font-medium">{business.size || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Founded:</span>{' '}
                  <span className="font-medium">{business.foundedYear}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex items-center">
                  <MapPinIcon className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-[11px] text-gray-700">
                    {business.address ? business.address.city : 'No location'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 text-[12px] font-medium flex items-center" onClick={e => {
              e.stopPropagation();
              handleEditClick(e, business.id);
            }}>
                    Edit
                  </button>
                  <button className="text-blue-600 text-[12px] font-medium flex items-center">
                    View
                    <ChevronRightIcon className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>)}
      </div>
      {/* Pagination Controls */}
      {filteredBusinesses.length > 0 && <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
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
              Showing {startIndex + 1}-{endIndex} of {filteredBusinesses.length}
            </div>
          </div>
        </div>}
      {/* Empty State */}
      {filteredBusinesses.length === 0 && <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
          <div className="mx-auto max-w-md">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
              <FilterIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No businesses found for this filter
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
      <Can I="create" a="Business">
        <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200" aria-label="Add new business" onClick={() => navigate('/business-form')}>
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      </Can>
      {/* Business Details Drawer */}
      {selectedBusiness && <BusinessDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={handleDrawerClose} 
        business={selectedBusiness}
        onRefresh={async () => {
          await list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' });
        }}
        showToast={(message, type) => showToast(type, message)}
      />}

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
                <h3 className="text-sm font-medium text-red-800">Error loading businesses</h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
};