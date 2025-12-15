import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, PlusIcon, EditIcon, BriefcaseIcon, CalendarIcon, DownloadIcon, TrendingUpIcon, BarChart2Icon, BuildingIcon, LayersIcon, CircleDollarSignIcon, UsersIcon, Trash2Icon } from 'lucide-react';
import { PageLayout, PageSection, SectionHeader, SectionContent, Breadcrumbs, PrimaryButton } from './PageLayout';
import { StatusBadge } from './ui/StatusBadge';
import { SkeletonLoader } from './ui/SkeletonLoader';
import { EmptyState } from './ui/EmptyState';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useToast } from './ui/Toast';
import { useApp } from '../context/AppContext';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { GrowthArea } from '../types';
import { GrowthAreaDetailsDrawer } from './GrowthAreaDetailsDrawer';

// Mock data removed - using Supabase with RLS instead
/*
const mockGrowthAreas = [{
  id: '1',
  name: 'Renewable Energy',
  type: 'Emerging',
  category: 'Energy & Environment',
  status: 'Active',
  growthRate: 12.5,
  iconBgColor: 'bg-green-100',
  iconColor: 'text-green-600',
  icon: TrendingUpIcon,
  description: 'Renewable energy sector including solar, wind, and hydroelectric power generation and related technologies.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$4.2B'
  }, {
    label: 'Contribution to GDP',
    value: '3.2%'
  }, {
    label: 'Companies',
    value: '120+'
  }, {
    label: 'Employment',
    value: '25,000'
  }]
}, {
  id: '2',
  name: 'Financial Technology',
  type: 'Priority',
  category: 'Technology',
  status: 'Active',
  growthRate: 18.7,
  iconBgColor: 'bg-blue-100',
  iconColor: 'text-blue-600',
  icon: CircleDollarSignIcon,
  description: 'Financial technology services including digital payments, blockchain, and innovative banking solutions.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$2.8B'
  }, {
    label: 'Contribution to GDP',
    value: '2.1%'
  }, {
    label: 'Companies',
    value: '85+'
  }, {
    label: 'Employment',
    value: '12,000'
  }]
}, {
  id: '3',
  name: 'Advanced Manufacturing',
  type: 'Core',
  category: 'Industrial',
  status: 'Active',
  growthRate: 7.2,
  iconBgColor: 'bg-indigo-100',
  iconColor: 'text-indigo-600',
  icon: BuildingIcon,
  description: 'Advanced manufacturing including robotics, automation, and smart factories with high-tech production systems.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$6.5B'
  }, {
    label: 'Contribution to GDP',
    value: '8.4%'
  }, {
    label: 'Companies',
    value: '210+'
  }, {
    label: 'Employment',
    value: '45,000'
  }]
}, {
  id: '4',
  name: 'Life Sciences & Healthcare',
  type: 'Emerging',
  category: 'Healthcare',
  status: 'Active',
  growthRate: 9.8,
  iconBgColor: 'bg-red-100',
  iconColor: 'text-red-600',
  icon: UsersIcon,
  description: 'Life sciences and healthcare innovation including biotechnology, pharmaceuticals, and medical devices.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$3.1B'
  }, {
    label: 'Contribution to GDP',
    value: '2.8%'
  }, {
    label: 'Companies',
    value: '95+'
  }, {
    label: 'Employment',
    value: '18,000'
  }]
}, {
  id: '5',
  name: 'Tourism & Hospitality',
  type: 'Core',
  category: 'Services',
  status: 'Active',
  growthRate: 5.4,
  iconBgColor: 'bg-amber-100',
  iconColor: 'text-amber-600',
  icon: BuildingIcon,
  description: 'Tourism and hospitality sector including hotels, resorts, cultural attractions, and leisure services.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$5.7B'
  }, {
    label: 'Contribution to GDP',
    value: '7.2%'
  }, {
    label: 'Companies',
    value: '320+'
  }, {
    label: 'Employment',
    value: '62,000'
  }]
}, {
  id: '6',
  name: 'Aerospace & Defense',
  type: 'Priority',
  category: 'Industrial',
  status: 'Active',
  growthRate: 6.8,
  iconBgColor: 'bg-slate-100',
  iconColor: 'text-slate-600',
  icon: LayersIcon,
  description: 'Aerospace and defense sector including aircraft manufacturing, space technology, and defense systems.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$4.9B'
  }, {
    label: 'Contribution to GDP',
    value: '4.1%'
  }, {
    label: 'Companies',
    value: '75+'
  }, {
    label: 'Employment',
    value: '22,000'
  }]
}, {
  id: '7',
  name: 'Digital Media & Entertainment',
  type: 'Emerging',
  category: 'Technology',
  status: 'Planning',
  growthRate: 14.2,
  iconBgColor: 'bg-purple-100',
  iconColor: 'text-purple-600',
  icon: BarChart2Icon,
  description: 'Digital media and entertainment including gaming, streaming services, and content creation platforms.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$1.8B'
  }, {
    label: 'Contribution to GDP',
    value: '1.5%'
  }, {
    label: 'Companies',
    value: '110+'
  }, {
    label: 'Employment',
    value: '9,000'
  }]
}, {
  id: '8',
  name: 'Sustainable Agriculture',
  type: 'Emerging',
  category: 'Energy & Environment',
  status: 'Planning',
  growthRate: 8.3,
  iconBgColor: 'bg-emerald-100',
  iconColor: 'text-emerald-600',
  icon: LayersIcon,
  description: 'Sustainable agriculture including vertical farming, precision agriculture, and agricultural technology innovations.',
  keyStatistics: [{
    label: 'Market Size',
    value: '$1.2B'
  }, {
    label: 'Contribution to GDP',
    value: '0.9%'
  }, {
    label: 'Companies',
    value: '65+'
  }, {
    label: 'Employment',
    value: '7,000'
  }]
}];
*/
export const GrowthAreasPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const {
    userRole,
    hasPermission: hasAppPermission
  } = useApp();
  const { user, role } = useAuth();
  const { data: growthAreasData, loading, error, list, remove } = useCRUD<GrowthArea>('eco_growth_areas');

  // Use Supabase data directly - RLS will handle filtering
  const displayGrowthAreas = growthAreasData;

  // Permission checks
  const hasPermission = (roles: string[]) => {
    return roles.includes(role || '') || roles.includes(userRole || '');
  };
  const canCreate = hasPermission(['admin', 'editor', 'creator']);
  const canUpdate = hasPermission(['admin', 'editor', 'approver', 'creator']);
  const canDelete = hasPermission(['admin']);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Name A-Z');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<GrowthArea | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load growth areas from database
  useEffect(() => {
    const loadGrowthAreas = async () => {
      try {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' });
      } catch (err) {
        console.error('Failed to load growth areas from database:', err);
        showToast('Failed to load growth areas. Please try again.', 'error');
      }
    };

    loadGrowthAreas();
  }, [list]);

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('areaId');
    if (areaId) {
      const area = displayGrowthAreas.find(a => a.id === areaId);
      if (area) {
        setSelectedArea(area);
        setIsDrawerOpen(true);
      }
    }
  }, [displayGrowthAreas]);

  // Get unique categories and types for filters
  const uniqueCategories = Array.from(new Set(displayGrowthAreas.map(area => area.category).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(displayGrowthAreas.map(area => area.type).filter(Boolean)));
  // Filter and sort growth areas
  const filteredGrowthAreas = displayGrowthAreas.filter(area => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return area.name?.toLowerCase().includes(query) || area.category?.toLowerCase().includes(query) || area.type?.toLowerCase().includes(query);
    }
    return true;
  }).filter(area => {
    // Filter by type
    if (typeFilter !== 'All' && area.type !== typeFilter) return false;
    // Filter by category
    if (categoryFilter !== 'All' && area.category !== categoryFilter) return false;
    // Filter by status
    if (statusFilter !== 'All' && area.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    // Sort by selected order
    switch (sortOrder) {
      case 'Name A-Z':
        return a.name.localeCompare(b.name);
      case 'Name Z-A':
        return b.name.localeCompare(a.name);
      case 'Highest Growth':
        return (b.growthRate || 0) - (a.growthRate || 0);
      case 'Lowest Growth':
        return (a.growthRate || 0) - (b.growthRate || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredGrowthAreas.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredGrowthAreas.length);
  const paginatedGrowthAreas = filteredGrowthAreas.slice(startIndex, endIndex);
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
  // Handle add new growth area button click
  const handleAddNewGrowthArea = () => {
    navigate('/growth-area-form');
  };
  // Handle edit growth area
  const handleEditGrowthArea = (e: React.MouseEvent, areaId: string) => {
    e.stopPropagation(); // Prevent row click handler from firing
    navigate(`/growth-area-form/${areaId}`);
  };
  // Handle delete growth area
  const handleDeleteClick = (e: React.MouseEvent, areaId: string) => {
    e.stopPropagation(); // Prevent row click handler from firing
    setSelectedAreaId(areaId);
    setShowDeleteDialog(true);
  };
  const handleDeleteConfirm = async () => {
    if (selectedAreaId) {
      try {
        await remove(selectedAreaId);
        showToast('Growth area deleted successfully', 'success');
      } catch (err) {
        console.error('Failed to delete growth area:', err);
        showToast('Failed to delete growth area', 'error');
      }
    }
    setShowDeleteDialog(false);
    setSelectedAreaId(null);
  };
  // Handle row click to open drawer
  const handleRowClick = (areaId: string) => {
    const area = displayGrowthAreas.find(item => item.id === areaId);
    if (area) {
      setSelectedArea(area);
      setIsDrawerOpen(true);
      // Update URL with areaId parameter for deep linking
      const url = new URL(window.location.href);
      url.searchParams.set('areaId', areaId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    }
  };
  
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Clear URL parameters when drawer closes
    const url = new URL(window.location.href);
    url.searchParams.delete('areaId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
  };
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, areaId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(areaId);
    }
  };
  // Render type with appropriate styling
  const renderType = (type: string | undefined) => {
    return <StatusBadge status={type || 'N/A'} />;
  };
  // Render status with appropriate styling
  const renderStatus = (status: string | undefined) => {
    const variant = status === 'Active' ? 'published' : 'draft';
    return <StatusBadge status={status || 'N/A'} variant={variant} />;
  };
  // Format growth rate for display
  const formatGrowthRate = (rate: number | undefined) => {
    if (rate === undefined || rate === null) return 'N/A';
    return `+${rate.toFixed(1)}%`;
  };
  // Get icon component from icon name
  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      'TrendingUp': TrendingUpIcon,
      'BarChart2': BarChart2Icon,
      'Building': BuildingIcon,
      'Layers': LayersIcon,
      'CircleDollarSign': CircleDollarSignIcon,
      'Users': UsersIcon,
    };
    return iconMap[iconName || ''] || TrendingUpIcon; // Default to TrendingUpIcon
  };
  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setCategoryFilter('All');
    setStatusFilter('All');
    setSortOrder('Name A-Z');
    setCurrentPage(1);
  };
  // Summary data calculation based on current growth areas
  const summaryData = [{
    id: 'total',
    title: 'Total Growth Areas',
    count: displayGrowthAreas.length,
    icon: LayersIcon,
    color: 'bg-blue-100 text-blue-600'
  }, {
    id: 'active',
    title: 'Active Areas',
    count: displayGrowthAreas.filter(area => area.status === 'Active').length,
    icon: TrendingUpIcon,
    color: 'bg-green-100 text-green-600'
  }, {
    id: 'planning',
    title: 'Planning Stage',
    count: displayGrowthAreas.filter(area => area.status === 'Planning').length,
    icon: BarChart2Icon,
    color: 'bg-amber-100 text-amber-600'
  }, {
    id: 'employment',
    title: 'Total Employment',
    count: displayGrowthAreas.reduce((sum, area) => sum + parseInt(area.keyStatistics?.find(stat => stat.label === 'Employment')?.value.replace(/[^0-9]/g, '') || '0'), 0),
    icon: UsersIcon,
    color: 'bg-indigo-100 text-indigo-600',
    format: (value: number) => `${(value / 1000).toFixed(0)}K Jobs`
  }];
  const breadcrumbItems = [{
    label: 'Dashboard',
    href: '/'
  }, {
    label: 'Growth Areas',
    current: true
  }];

  // Show error state
  if (error && !loading) {
    return (
      <PageLayout title="Growth Areas" breadcrumbs={breadcrumbItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
            <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
              <InfoIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load growth areas</h2>
            <p className="text-sm text-gray-600 mb-4">
              {error.message || 'An error occurred while loading growth areas.'}
            </p>
            <button
              onClick={() => list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return <PageLayout title="Growth Areas" breadcrumbs={breadcrumbItems}>
    <SectionContent className="px-0 sm:px-6 pt-4 pb-12">
      {/* Summary Cards */}
      {loading ? <SkeletonLoader variant="metrics" className="mb-6" /> : <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 px-4 sm:px-0">
        {summaryData.map(item => <div key={item.id} className="rounded-2xl shadow-sm border border-gray-100 bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out">
          <div className="flex items-center">
            <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-[13px] text-gray-600 font-medium">
                {item.title}
              </h3>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">
                {item.format ? item.format(item.count) : item.count.toLocaleString()}
              </p>
            </div>
          </div>
        </div>)}
      </div>}
      {/* Toolbar */}
      <div className="sticky top-[3.5rem] bg-gray-50 z-20 pb-2 px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs" placeholder="Search growth areas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {/* Filter Chips */}
            <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  {uniqueTypes.map(type => <option key={type} value={type}>
                    {type}
                  </option>)}
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
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                  <option value="Name A-Z">Name A-Z</option>
                  <option value="Name Z-A">Name Z-A</option>
                  <option value="Highest Growth">Highest Growth</option>
                  <option value="Lowest Growth">Lowest Growth</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-shrink-0">
                <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
                  <DownloadIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
              {(typeFilter !== 'All' || categoryFilter !== 'All' || statusFilter !== 'All' || searchQuery) && <div className="flex-shrink-0">
                <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>}
            </div>
          </div>
        </div>
      </div>
      {/* Growth Areas Table - Desktop and Tablet View */}
      <PageSection className="hidden md:block mt-2">
        <SectionHeader title="Growth Areas" actions={canCreate ? <PrimaryButton onClick={handleAddNewGrowthArea}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Growth Area
        </PrimaryButton> : null} />
        <SectionContent className="p-0">
          {loading ? <SkeletonLoader variant="table" count={5} /> : filteredGrowthAreas.length === 0 ? <EmptyState onAction={canCreate ? handleAddNewGrowthArea : undefined} /> : <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Industry
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Growth Rate
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider hidden lg:table-cell">
                    GDP Contribution
                  </th>
                  <th scope="col" className="relative px-4 py-3 w-24">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedGrowthAreas.map(area => <tr key={area.id} onClick={() => handleRowClick(area.id)} onKeyDown={e => handleRowKeyDown(e, area.id)} tabIndex={0} role="button" className="cursor-pointer hover:bg-gray-50 transition-colors duration-150" aria-label={`View details for ${area.name}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-md ${area.iconBgColor || 'bg-gray-100'} mr-3`}>
                        {(() => {
                          const IconComponent = getIconComponent(area.icon?.name);
                          return <IconComponent className={`h-4 w-4 ${area.iconColor || 'text-gray-600'}`} />;
                        })()}
                      </div>
                      <span className="text-[13px] font-medium text-gray-900">
                        {area.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">
                    {renderType(area.type)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">
                    {area.category || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">
                    {renderStatus(area.status)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-green-600 font-medium">
                    {formatGrowthRate(area.growthRate)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700 hidden lg:table-cell">
                    {area.keyStatistics?.find(stat => stat.label === 'Contribution to GDP')?.value || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                    <div className="flex items-center justify-end space-x-2">
                      {canUpdate && <button onClick={e => handleEditGrowthArea(e, area.id)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" aria-label="Edit growth area">
                        <EditIcon className="h-4 w-4" />
                      </button>}
                      {canDelete && <button onClick={e => handleDeleteClick(e, area.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" aria-label="Delete growth area">
                        <Trash2Icon className="h-4 w-4" />
                      </button>}
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>}
        </SectionContent>
      </PageSection>
      {/* Growth Areas Mobile Card View */}
      <div className="md:hidden space-y-3 mt-2 px-4 sm:px-0">
        {loading ? <SkeletonLoader variant="card" count={3} /> : filteredGrowthAreas.length === 0 ? <EmptyState onAction={hasPermission(['admin', 'creator']) ? handleAddNewGrowthArea : undefined} /> : <>
          {/* Mobile header with action button */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Growth Areas
            </h2>
            {canCreate && <button onClick={handleAddNewGrowthArea} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </button>}
          </div>
          {paginatedGrowthAreas.map(area => <div key={area.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200" onClick={() => handleRowClick(area.id)} onKeyDown={e => handleRowKeyDown(e, area.id)} tabIndex={0} role="button" aria-label={`View details for ${area.name}`}>
            <div className="flex items-center mb-2">
              <div className={`p-1.5 rounded-md ${area.iconBgColor || 'bg-gray-100'} mr-2`}>
                {(() => {
                  const IconComponent = getIconComponent(area.icon?.name);
                  return <IconComponent className={`h-4 w-4 ${area.iconColor || 'text-gray-600'}`} />;
                })()}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mr-2">
                {area.name}
              </h3>
              {renderStatus(area.status)}
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
              <div>
                <span className="text-gray-500">Type:</span>{' '}
                <span className="font-medium">{area.type || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span className="font-medium">{area.category || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Growth Rate:</span>{' '}
                <span className="font-medium text-green-600">
                  {formatGrowthRate(area.growthRate)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">GDP:</span>{' '}
                <span className="font-medium">
                  {area.keyStatistics?.find(stat => stat.label === 'Contribution to GDP')?.value || 'N/A'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {area.description}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center">
                <BriefcaseIcon className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-[11px] text-gray-700">
                  {area.keyStatistics?.find(stat => stat.label === 'Employment')?.value || 'N/A'}{' '}
                  jobs
                </span>
              </div>
              <div className="flex space-x-3">
                {hasPermission(['admin', 'approver', 'creator']) && <button onClick={e => {
                  e.stopPropagation();
                  handleEditGrowthArea(e, area.id);
                }} className={`text-blue-600 text-[12px] font-medium flex items-center ${userRole === 'creator' && area.status === 'Active' ? 'text-gray-400 cursor-not-allowed' : ''}`} disabled={userRole === 'creator' && area.status === 'Active'}>
                  Edit
                </button>}
                {hasPermission(['admin']) && <button onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(e, area.id);
                }} className="text-red-600 text-[12px] font-medium flex items-center">
                  Delete
                </button>}
                <button className="text-blue-600 text-[12px] font-medium flex items-center">
                  View
                  <ChevronRightIcon className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>)}
        </>}
      </div>
      {/* Pagination Controls */}
      {!loading && filteredGrowthAreas.length > 0 && <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between mx-4 sm:mx-0">
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
            Showing {startIndex + 1}-{endIndex} of{' '}
            {filteredGrowthAreas.length}
          </div>
        </div>
      </div>}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteConfirm} title="Delete Growth Area" message="Are you sure you want to delete this growth area? This action cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
      {/* Growth Area Details Drawer */}
      {selectedArea && <GrowthAreaDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={handleDrawerClose} 
        growthArea={selectedArea}
      />}
    </SectionContent>
  </PageLayout>;
};