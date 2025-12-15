import React, { useState } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { EnhancedTableSection } from './EnhancedTableSection';
import { ServiceDetailsDrawer } from './ServiceDetailsDrawer';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SendBackModal } from './SendBackModal';
// Mock data for services
// Mock services data - TODO: Replace with actual data from database
const mockServices = [{
  id: '1',
  title: 'Small Business Loan Program',
  type: 'Financial',
  partner: 'Capital Finance Group',
  category: 'Funding',
  processingTime: '10 Business Days',
  status: 'Pending',
  submittedOn: '2023-06-14 09:30:45',
  description: 'Low-interest loans for small businesses with flexible repayment terms. Designed to support business growth and operational expenses.',
  eligibility: ['Business must be operating for at least 1 year', 'Annual revenue between $50,000 and $2 million', 'Credit score of 650 or higher'],
  applicationRequirements: ['Business financial statements', 'Tax returns for last 2 years', 'Business plan'],
  fee: '$250 application fee',
  regulatoryCategory: 'Lending',
  documentsRequired: ['Business License', 'Financial Statements', 'Tax Returns'],
  partnerInfo: {
    name: 'Capital Finance Group',
    email: 'partner@capitalfinance.example.com',
    tier: 'Gold',
    totalSubmissions: 15,
    approvalRate: 85,
    complianceNotes: 'All licenses verified and current.'
  },
  comments: [{
    id: '1',
    author: 'Sarah Johnson',
    role: 'Moderator',
    text: 'Interest rates need to be clearly disclosed in the description.',
    timestamp: '2023-06-14 10:15:22'
  }, {
    id: '2',
    author: 'David Wilson',
    role: 'Compliance',
    text: 'Need to verify lending license is up-to-date before approval.',
    timestamp: '2023-06-14 11:30:45'
  }]
}, {
  id: '2',
  title: 'Business Advisory Services',
  type: 'Non-Financial',
  partner: 'Business Growth Consultants',
  category: 'Advisory',
  processingTime: '5 Business Days',
  status: 'Approved',
  submittedOn: '2023-06-13 14:22:18',
  description: 'Expert business advisory services to help optimize operations, improve profitability, and develop growth strategies.',
  eligibility: ['Small to medium-sized businesses', 'Any industry sector'],
  fee: '$150/hour',
  outcome: 'Detailed business analysis report and action plan',
  partnerInfo: {
    name: 'Business Growth Consultants',
    email: 'services@bgconsultants.example.com',
    tier: 'Silver',
    totalSubmissions: 8,
    approvalRate: 90,
    complianceNotes: 'Verified service provider.'
  },
  comments: [{
    id: '1',
    author: 'Jessica Lee',
    role: 'Moderator',
    text: 'Service description is clear and comprehensive. Approved.',
    timestamp: '2023-06-13 16:45:30'
  }]
}, {
  id: '3',
  title: 'Investment Advisory Services',
  type: 'Financial',
  partner: 'Wealth Partners Ltd',
  category: 'Investment',
  processingTime: '15 Business Days',
  status: 'Pending',
  submittedOn: '2023-06-12 11:05:33',
  description: 'Professional investment advisory services for high-net-worth individuals and businesses looking to optimize their investment portfolios.',
  eligibility: ['Minimum investment of $100,000', 'Long-term investment horizon (3+ years)'],
  applicationRequirements: ['Proof of funds', 'Risk assessment questionnaire', 'Identity verification'],
  fee: '1.5% annual management fee',
  regulatoryCategory: 'Investment Advisory',
  documentsRequired: ['Investment Policy Statement', 'Risk Disclosure Forms', 'Advisory Agreement'],
  partnerInfo: {
    name: 'Wealth Partners Ltd',
    email: 'info@wealthpartners.example.com',
    tier: 'Gold',
    totalSubmissions: 6,
    approvalRate: 80,
    complianceNotes: 'SEC registered investment advisor. All certifications current.'
  },
  comments: [{
    id: '1',
    author: 'Michael Brown',
    role: 'Moderator',
    text: 'Initial review complete. Forwarding to compliance for final approval.',
    timestamp: '2023-06-12 13:20:15'
  }, {
    id: '2',
    author: 'Amanda Chen',
    role: 'Compliance',
    text: 'Reviewing regulatory disclosures and fee structure.',
    timestamp: '2023-06-13 09:45:30'
  }]
}, {
  id: '4',
  title: 'Business Plan Development',
  type: 'Non-Financial',
  partner: 'StartUp Strategists',
  category: 'Advisory',
  processingTime: '7 Business Days',
  status: 'Rejected',
  submittedOn: '2023-06-11 15:40:22',
  description: 'Professional business plan development service for startups and small businesses seeking funding or strategic direction.',
  eligibility: ['Any business stage', 'All industries'],
  fee: '$1,200 per business plan',
  outcome: 'Comprehensive business plan with financial projections',
  partnerInfo: {
    name: 'StartUp Strategists',
    email: 'plans@startupstrategists.example.com',
    tier: 'Bronze',
    totalSubmissions: 4,
    approvalRate: 50,
    complianceNotes: 'New partner, limited track record.'
  },
  comments: [{
    id: '1',
    author: 'John Smith',
    role: 'Moderator',
    text: 'Rejected due to quality concerns with sample plans. Too generic and lacks financial depth.',
    timestamp: '2023-06-11 16:55:10'
  }]
}, {
  id: '5',
  title: 'Merchant Cash Advance',
  type: 'Financial',
  partner: 'Quick Capital',
  category: 'Funding',
  processingTime: '3 Business Days',
  status: 'Sent Back',
  submittedOn: '2023-06-10 09:15:40',
  description: 'Fast access to capital based on future credit card sales. Flexible repayment based on daily sales volume.',
  eligibility: ['Minimum 6 months in business', 'At least $10,000 in monthly credit card sales'],
  applicationRequirements: ['Last 4 months of credit card processing statements', 'Bank statements', 'Business ID'],
  fee: 'Factor rate starting at 1.2',
  regulatoryCategory: 'Alternative Financing',
  documentsRequired: ['Processing Statements', 'Bank Statements', 'Business License'],
  partnerInfo: {
    name: 'Quick Capital',
    email: 'funding@quickcapital.example.com',
    tier: 'Silver',
    totalSubmissions: 9,
    approvalRate: 70,
    complianceNotes: 'Licensed in 42 states. Pending in others.'
  },
  comments: [{
    id: '1',
    author: 'Sarah Johnson',
    role: 'Moderator',
    text: 'Please provide clearer disclosure of effective APR and all fees in the description.',
    timestamp: '2023-06-10 11:30:25'
  }]
}, {
  id: '6',
  title: 'Digital Marketing Workshop',
  type: 'Non-Financial',
  partner: 'MarketBoost Agency',
  category: 'Training',
  processingTime: '5 Business Days',
  status: 'Pending',
  submittedOn: '2023-06-09 13:45:30',
  description: 'Comprehensive digital marketing workshop covering social media, SEO, content marketing, and paid advertising strategies.',
  eligibility: ['All business sizes', 'Basic marketing knowledge recommended'],
  fee: '$499 per participant',
  outcome: 'Digital marketing strategy and implementation plan',
  partnerInfo: {
    name: 'MarketBoost Agency',
    email: 'workshops@marketboost.example.com',
    tier: 'Silver',
    totalSubmissions: 5,
    approvalRate: 80,
    complianceNotes: 'Verified training provider.'
  },
  comments: [{
    id: '1',
    author: 'David Wilson',
    role: 'Moderator',
    text: 'Workshop curriculum looks comprehensive. Checking instructor qualifications.',
    timestamp: '2023-06-09 15:20:10'
  }]
}, {
  id: '7',
  title: 'Equipment Financing',
  type: 'Financial',
  partner: 'Industrial Funding Solutions',
  category: 'Funding',
  processingTime: '7 Business Days',
  status: 'Approved',
  submittedOn: '2023-06-08 10:10:15',
  description: 'Financing solutions for purchasing or leasing industrial equipment with competitive rates and flexible terms.',
  eligibility: ['Business operating for 2+ years', 'Credit score of 620+', 'Equipment value between $10,000 and $500,000'],
  applicationRequirements: ['Equipment quote/invoice', 'Business financial statements', 'Tax returns'],
  fee: '$150 application fee + rates from 5.9%',
  regulatoryCategory: 'Equipment Financing',
  documentsRequired: ['Equipment Specifications', 'Vendor Information', 'Business Financial Statements'],
  partnerInfo: {
    name: 'Industrial Funding Solutions',
    email: 'financing@industrialfunding.example.com',
    tier: 'Gold',
    totalSubmissions: 12,
    approvalRate: 85,
    complianceNotes: 'All licenses and registrations verified.'
  },
  comments: [{
    id: '1',
    author: 'Jessica Lee',
    role: 'Moderator',
    text: 'Terms are clear and competitive. Approved.',
    timestamp: '2023-06-08 11:45:30'
  }, {
    id: '2',
    author: 'Robert Chen',
    role: 'Compliance',
    text: 'All regulatory requirements satisfied. Final approval granted.',
    timestamp: '2023-06-08 14:30:15'
  }]
}, {
  id: '8',
  title: 'Business License Assistance',
  type: 'Non-Financial',
  partner: 'Compliance Experts',
  category: 'Licensing',
  processingTime: '10 Business Days',
  status: 'Pending',
  submittedOn: '2023-06-07 14:30:20',
  description: 'Professional assistance with obtaining all necessary business licenses and permits at the federal, state, and local levels.',
  eligibility: ['All business types', 'Any location in the United States'],
  fee: '$350 base fee + government filing fees',
  outcome: 'Completed license applications and filing with appropriate authorities',
  partnerInfo: {
    name: 'Compliance Experts',
    email: 'services@complianceexperts.example.com',
    tier: 'Silver',
    totalSubmissions: 7,
    approvalRate: 90,
    complianceNotes: 'Verified service provider with excellent track record.'
  },
  comments: [{
    id: '1',
    author: 'Michael Brown',
    role: 'Moderator',
    text: 'Service description is clear. Checking success rates for different license types.',
    timestamp: '2023-06-07 16:15:40'
  }]
}];
// Summary data
const summaryData = [{
  id: 'pending',
  title: 'Pending Approvals',
    count: displayServices.filter(s => s.status === 'Pending').length,
  icon: ClockIcon,
  color: 'bg-amber-100 text-amber-600',
  borderColor: 'border-amber-200'
}, {
  id: 'approved',
  title: 'Approved This Week',
    count: displayServices.filter(s => s.status === 'Approved').length,
  icon: CheckCircleIcon,
  color: 'bg-green-100 text-green-600',
  borderColor: 'border-green-200'
}, {
  id: 'rejected',
  title: 'Rejected',
    count: displayServices.filter(s => s.status === 'Rejected').length,
  icon: XCircleIcon,
  color: 'bg-red-100 text-red-600',
  borderColor: 'border-red-200'
}];
// Table columns definition
const serviceColumns = [{
  key: 'title',
  label: 'Title',
  primary: true
}, {
  key: 'type',
  label: 'Service Type'
}, {
  key: 'partner',
  label: 'Partner'
}, {
  key: 'category',
  label: 'Category'
}, {
  key: 'processingTime',
  label: 'Processing Time'
}, {
  key: 'status',
  label: 'Status'
}, {
  key: 'submittedOn',
  label: 'Submitted On'
}];
export const ServiceApprovalsPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false);
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
      const submittedDate = new Date(service.submittedOn);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
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
    const dateA = new Date(a.submittedOn).getTime();
    const dateB = new Date(b.submittedOn).getTime();
    return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
  });
  // Render service type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Financial: 'bg-blue-100 text-blue-800 border border-blue-200',
      'Non-Financial': 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>;
  };
  // Render service status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Approved: 'bg-green-100 text-green-800 border border-green-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      'Sent Back': 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Format the table data
  const formattedServices = filteredServices.map(service => ({
    ...service,
    type: renderType(service.type),
    status: renderStatus(service.status)
  }));
  // Handle row click to open drawer
  const handleRowClick = (serviceId: string) => {
    const service = displayServices.find(item => item.id === serviceId);
    if (service) {
      setSelectedService(service);
      setIsDrawerOpen(true);
    }
  };
  // Render expanded content for table row
  const renderExpandedContent = (row: any) => {
    return <div className="p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Service Preview</h4>
        <p className="text-gray-700 mb-3">
          {row.description || 'No description available.'}
        </p>
        <div className="flex space-x-4">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700" onClick={() => handleRowClick(row.id)}>
            View Full Details
          </button>
        </div>
      </div>;
  };
  // Handle service actions
  const handleApproveService = (serviceId: string) => {
    setSelectedService(displayServices.find(item => item.id === serviceId));
    setShowApproveModal(true);
  };
  const handleRejectService = (serviceId: string) => {
    setSelectedService(displayServices.find(item => item.id === serviceId));
    setShowRejectModal(true);
  };
  const handleSendBackService = (serviceId: string) => {
    setSelectedService(displayServices.find(item => item.id === serviceId));
    setShowSendBackModal(true);
  };
  // Get unique categories and partners for filters
  const uniqueCategories = Array.from(new Set(displayServices.map(service => service.category)));
  const uniquePartners = Array.from(new Set(displayServices.map(service => service.partner)));
  return <div className="p-6 bg-[#F8FAFC] min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mr-2">
            Service Approvals
          </h1>
          <div className="relative group">
            <InfoIcon className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-72 bg-white p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-sm text-gray-700">
                Financial services require two-step approval; non-financial
                services follow a single-step review.
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          Review and approve partner-submitted services before publication.
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryData.map(item => <div key={item.id} className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${item.borderColor}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${item.color} mr-4`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {item.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.count}
                </p>
              </div>
            </div>
          </div>)}
      </div>
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search services..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative inline-block">
              <select className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={serviceType} onChange={e => setServiceType(e.target.value)}>
                <option value="All">All Service Types</option>
                <option value="Financial">Financial</option>
                <option value="Non-Financial">Non-Financial</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="relative inline-block">
              <select className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Sent Back">Sent Back</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="relative inline-block">
              <select className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowMoreFiltersModal(true)}>
              <FilterIcon className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>
      {/* Services Table */}
      <EnhancedTableSection title="Services" columns={serviceColumns} data={formattedServices} rowsPerPage={10} renderExpandedContent={renderExpandedContent} data-id="services-table" />
      {/* Empty State */}
      {filteredServices.length === 0 && <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="mx-auto max-w-md">
            <div className="bg-gray-100 p-6 rounded-full inline-flex items-center justify-center mb-4">
              <FilterIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found for this filter
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria to find what you're
              looking for.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => {
          setServiceType('All');
          setStatusFilter('All');
          setCategoryFilter('All');
          setPartnerFilter('All');
          setDateRange({
            startDate: '',
            endDate: ''
          });
          setSearchQuery('');
        }}>
              Clear All Filters
            </button>
          </div>
        </div>}
      {/* Service Details Drawer */}
      {selectedService && <ServiceDetailsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} service={selectedService} onApprove={() => setShowApproveModal(true)} onReject={() => setShowRejectModal(true)} onSendBack={() => setShowSendBackModal(true)} />}
      {/* Action Modals */}
      {selectedService && <>
          <ApproveModal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} onConfirm={() => {
        alert(`Service "${selectedService.title}" approved!`);
        setShowApproveModal(false);
        setIsDrawerOpen(false);
      }} listing={selectedService} />
          <RejectModal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={reason => {
        alert(`Service "${selectedService.title}" rejected: ${reason}`);
        setShowRejectModal(false);
        setIsDrawerOpen(false);
      }} listing={selectedService} />
          <SendBackModal isOpen={showSendBackModal} onClose={() => setShowSendBackModal(false)} onConfirm={(reason, comments) => {
        alert(`Service "${selectedService.title}" sent back: ${reason} - ${comments}`);
        setShowSendBackModal(false);
        setIsDrawerOpen(false);
      }} listing={selectedService} />
        </>}
      {/* More Filters Modal */}
      {showMoreFiltersModal && <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowMoreFiltersModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowMoreFiltersModal(false)}>
                  <span className="sr-only">Close</span>
                  <XCircleIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Additional Filters
                </h3>
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select id="category" className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                      <option value="All">All Categories</option>
                      {uniqueCategories.map(category => <option key={category} value={category}>
                          {category}
                        </option>)}
                    </select>
                  </div>
                  {/* Partner Filter */}
                  <div>
                    <label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-1">
                      Partner
                    </label>
                    <select id="partner" className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}>
                      <option value="All">All Partners</option>
                      {uniquePartners.map(partner => <option key={partner} value={partner}>
                          {partner}
                        </option>)}
                    </select>
                  </div>
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start-date" className="block text-xs text-gray-500 mb-1">
                          Start Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <input type="date" id="start-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.startDate} onChange={e => setDateRange({
                        ...dateRange,
                        startDate: e.target.value
                      })} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="end-date" className="block text-xs text-gray-500 mb-1">
                          End Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <input type="date" id="end-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.endDate} onChange={e => setDateRange({
                        ...dateRange,
                        endDate: e.target.value
                      })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm" onClick={() => setShowMoreFiltersModal(false)}>
                    Apply Filters
                  </button>
                  <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm" onClick={() => {
                setCategoryFilter('All');
                setPartnerFilter('All');
                setDateRange({
                  startDate: '',
                  endDate: ''
                });
                setShowMoreFiltersModal(false);
              }}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};