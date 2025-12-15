import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon, CheckCircleIcon, ArchiveIcon, FlagIcon, BarChartIcon, TrendingUpIcon, ClockIcon, StarIcon, MaximizeIcon, MinimizeIcon, CopyIcon, DownloadIcon, BuildingIcon, MailIcon, GlobeIcon, MapPinIcon, PhoneIcon, BriefcaseIcon, UsersIcon, CalendarIcon, AwardIcon, HashIcon, LinkIcon, InstagramIcon, TwitterIcon, FacebookIcon, LinkedinIcon, DollarSignIcon, PieChartIcon, PercentIcon } from 'lucide-react';
import { createFocusTrap } from 'focus-trap';
import { TabsSimple } from './TabVariations';
import type { SimpleSection } from './TabVariations';
import { ReviewCommentsModule } from './ReviewCommentsModule';
import { useAbility } from '../hooks/useAbility';
import { useAuth } from '../context/AuthContext';
type BusinessDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  business: any;
  onApprove?: () => void;
  onReject?: () => void;
  onSendBack?: () => void;
  onRefresh?: () => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error') => void;
};
export const BusinessDetailsDrawer: React.FC<BusinessDetailsDrawerProps> = ({
  isOpen,
  onClose,
  business,
  onApprove,
  onReject,
  onSendBack,
  onRefresh,
  showToast
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const ability = useAbility();
  const { userSegment } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Set up focus trap for accessibility
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Store the currently focused element to restore focus later
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      // Create and activate focus trap
      focusTrapRef.current = createFocusTrap(drawerRef.current, {
        fallbackFocus: drawerRef.current,
        escapeDeactivates: false,
        allowOutsideClick: true
      });
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        focusTrapRef.current?.activate();
      }, 100);
    }
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        // Restore focus when drawer closes
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus();
        }
      }
    };
  }, [isOpen]);
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      // Escape key to close/collapse drawer
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isExpanded) {
          toggleExpanded();
        } else {
          handleClose();
        }
      }
      // Shift+Enter to toggle expanded view
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        toggleExpanded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded]);
  // Handle URL params for deep linking
  useEffect(() => {
    if (isOpen) {
      updateUrlParams();
    }
  }, [isOpen, isExpanded, business]);
  // Check for deep link parameters on mount
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === 'full') {
        setIsExpanded(true);
      }
    };
    if (isOpen) {
      checkUrlParams();
    }
  }, [isOpen]);
  // Apply content scale effect when drawer opens
  useEffect(() => {
    if (isOpen && contentRef.current && !prefersReducedMotion.current) {
      contentRef.current.style.transform = 'scale(0.98)';
      contentRef.current.style.opacity = '0';
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(1)';
          contentRef.current.style.opacity = '1';
        }
      }, 50);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  // Map business status to review workflow status
  const mapBusinessStatusToReviewStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Active': 'Published',
      'Featured': 'Published',
      'Pending': 'Pending Review',
      'Inactive': 'Draft'
    };
    return statusMap[status] || status;
  };

  // Determine status flags for ReviewCommentsModule
  const currentReviewStatus = mapBusinessStatusToReviewStatus(business.status);
  const isDraft = currentReviewStatus === 'Draft' || business.status === 'Inactive';
  const isPending = currentReviewStatus === 'Pending Review' || business.status === 'Pending';
  const isPublished = currentReviewStatus === 'Published' || business.status === 'Active' || business.status === 'Featured';
  const isArchived = false; // Businesses don't have archived status
  const isRejected = false; // Businesses don't have rejected status

  // Get available tabs based on business data
  const getAvailableTabs = () => {
    const tabs = [{
      id: 'overview',
      title: 'Overview'
    }, {
      id: 'contact',
      title: 'Contact & Location'
    }, {
      id: 'products',
      title: 'Products & Services'
    }];
    if (business.financials) {
      tabs.push({
        id: 'financials',
        title: 'Financial Information'
      });
    }
    // Add Review & Comments tab
    tabs.push({
      id: 'review',
      title: 'Review & Comments'
    });
    return tabs;
  };
  const availableTabs = getAvailableTabs();
  // Get current active tab ID
  const getActiveTabId = () => {
    return availableTabs[activeTabIndex]?.id || 'overview';
  };
  // Update URL params for deep linking
  const updateUrlParams = () => {
    const url = new URL(window.location.href);
    if (isOpen && business) {
      url.searchParams.set('businessId', business.id);
      if (isExpanded) {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.set('view', 'drawer');
      }
    } else {
      url.searchParams.delete('businessId');
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };
  // Render business size with appropriate styling
  const renderSize = (size: string) => {
    const sizeStyles: Record<string, string> = {
      Small: 'bg-blue-100 text-blue-800 border border-blue-200',
      Medium: 'bg-green-100 text-green-800 border border-green-200',
      Large: 'bg-purple-100 text-purple-800 border border-purple-200',
      Enterprise: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${sizeStyles[size] || 'bg-gray-100 text-gray-800'}`}>
        {size}
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
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Copy deep link to clipboard
  const copyDeepLink = () => {
    const businessId = business.id;
    const currentUrl = new URL(window.location.href);
    // Ensure we're on the business-directory page
    currentUrl.pathname = '/business-directory';
    // Set the query parameters
    currentUrl.searchParams.set('businessId', businessId);
    currentUrl.searchParams.set('view', isExpanded ? 'full' : 'drawer');
    navigator.clipboard.writeText(currentUrl.toString());
    alert('Link copied to clipboard!');
  };
  // Export business details as PDF
  const exportPdf = () => {
    alert('Exporting business details as PDF...');
  };
  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  // Handle drawer close with URL cleanup
  const handleClose = () => {
    // Deactivate focus trap
    if (focusTrapRef.current) {
      focusTrapRef.current.deactivate();
    }
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('businessId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close drawer
    onClose();
  };
  // Render overview tab
  const renderOverview = () => <div className="px-6 lg:px-8">
      {/* Logo */}
      {business.logo && <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-white p-2 flex items-center justify-center">
            <img src={business.logo} alt={`${business.name} logo`} className="max-h-full max-w-full object-contain" />
          </div>
        </div>}
      {/* Business Type */}
      <div className="mb-4 flex items-center">
        <div className={`p-2 rounded-md ${business.type === 'Government' ? 'bg-blue-100 text-blue-600' : business.type === 'Private' ? 'bg-purple-100 text-purple-600' : business.type === 'Semi-Government' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
          <BuildingIcon className="h-4 w-4" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-700">{business.type}</h3>
          <p className="text-xs text-gray-500">
            {business.size && `${business.size} Organization`}
          </p>
        </div>
      </div>
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed">{business.description}</p>
      </div>
      {/* Industry */}
      <div className="border-b border-gray-100 mb-6 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Industry</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
          {business.industry}
        </span>
      </div>
      {/* Founding Date */}
      {business.foundedYear && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Founded</h3>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{business.foundedYear}</span>
          </div>
        </div>}
      {/* Number of Employees */}
      {business.employees && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Employees
          </h3>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{business.employees}</span>
          </div>
        </div>}
      {/* Key People */}
      {business.keyPeople && business.keyPeople.length > 0 && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Key People
          </h3>
          <div className="space-y-3">
            {business.keyPeople.map((person: any, index: number) => <div key={index} className="flex items-start">
                <UserIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium">{person.name}</p>
                  <p className="text-sm text-gray-600">{person.role}</p>
                </div>
              </div>)}
          </div>
        </div>}
      {/* Certifications & Awards */}
      {business.certifications && business.certifications.length > 0 && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Certifications & Awards
          </h3>
          <div className="space-y-2">
            {business.certifications.map((cert: string, index: number) => <div key={index} className="flex items-center">
                <AwardIcon className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{cert}</span>
              </div>)}
          </div>
        </div>}
      {/* License Information */}
      {business.licenseInfo && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            License Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">License Number</p>
              <div className="flex items-center">
                <HashIcon className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-700">{business.licenseInfo.number}</p>
              </div>
            </div>
            {business.licenseInfo.issuedDate && <div>
                <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-700">
                    {formatDate(business.licenseInfo.issuedDate)}
                  </p>
                </div>
              </div>}
            {business.licenseInfo.expiryDate && <div>
                <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-gray-700">
                    {formatDate(business.licenseInfo.expiryDate)}
                  </p>
                </div>
              </div>}
            {business.licenseInfo.authority && <div>
                <p className="text-xs text-gray-500 mb-1">Issuing Authority</p>
                <p className="text-gray-700">
                  {business.licenseInfo.authority}
                </p>
              </div>}
          </div>
        </div>}
    </div>;
  // Render contact tab
  const renderContactAndLocation = () => <div className="px-6 lg:px-8">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BuildingIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Primary Contact
              </h4>
            </div>
            <div className="space-y-4">
              {business.phone && <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={`tel:${business.phone}`} className="text-sm text-blue-600">
                      {business.phone}
                    </a>
                  </div>
                </div>}
              {business.email && <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <div className="flex items-center">
                    <MailIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={`mailto:${business.email}`} className="text-sm text-blue-600">
                      {business.email}
                    </a>
                  </div>
                </div>}
              {business.website && <div>
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  <div className="flex items-center">
                    <GlobeIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>}
            </div>
          </div>
          {business.socialMedia && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <LinkIcon className="w-5 h-5 text-purple-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-800">
                  Social Media
                </h4>
              </div>
              <div className="space-y-4">
                {business.socialMedia.linkedin && <div className="flex items-center">
                    <LinkedinIcon className="w-4 h-4 text-blue-600 mr-2" />
                    <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>}
                {business.socialMedia.twitter && <div className="flex items-center">
                    <TwitterIcon className="w-4 h-4 text-blue-400 mr-2" />
                    <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Twitter
                    </a>
                  </div>}
                {business.socialMedia.facebook && <div className="flex items-center">
                    <FacebookIcon className="w-4 h-4 text-blue-800 mr-2" />
                    <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Facebook
                    </a>
                  </div>}
                {business.socialMedia.instagram && <div className="flex items-center">
                    <InstagramIcon className="w-4 h-4 text-pink-600 mr-2" />
                    <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Instagram
                    </a>
                  </div>}
              </div>
            </div>}
        </div>
      </div>
      {/* Address */}
      {business.address && <div className="mb-8 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Address</h3>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start mb-4">
              <MapPinIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  Headquarters
                </h4>
                <p className="text-sm text-gray-700">
                  {business.address.street}
                  <br />
                  {business.address.city}, {business.address.region}{' '}
                  {business.address.postalCode}
                  <br />
                  {business.address.country}
                </p>
              </div>
            </div>
            {business.address.coordinates && <div className="relative h-48 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Map would be displayed here
                  </p>
                </div>
              </div>}
          </div>
        </div>}
      {/* Additional Locations */}
      {business.additionalLocations && business.additionalLocations.length > 0 && <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Additional Locations
            </h3>
            <div className="space-y-4">
              {business.additionalLocations.map((location: any, index: number) => <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start">
                      <MapPinIcon className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {location.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {location.address}
                        </p>
                        {location.phone && <div className="flex items-center mt-2">
                            <PhoneIcon className="w-3.5 h-3.5 text-gray-400 mr-1" />
                            <a href={`tel:${location.phone}`} className="text-sm text-blue-600">
                              {location.phone}
                            </a>
                          </div>}
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>}
    </div>;
  // Render products and services tab
  const renderProductsAndServices = () => <div className="px-6 lg:px-8">
      {/* Main Products & Services */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Main Products & Services
        </h3>
        {business.products && business.products.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.products.map((product: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {product.description}
                </p>
                {product.category && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {product.category}
                  </span>}
              </div>)}
          </div> : <p className="text-gray-500">
            No products or services information available.
          </p>}
      </div>
      {/* Target Markets */}
      {business.targetMarkets && business.targetMarkets.length > 0 && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Target Markets
          </h3>
          <div className="flex flex-wrap gap-2">
            {business.targetMarkets.map((market: string, index: number) => <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {market}
              </span>)}
          </div>
        </div>}
      {/* Business Hours */}
      {business.businessHours && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Business Hours
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="space-y-2">
              {Object.entries(business.businessHours).map(([day, hours]) => <div key={day} className="flex justify-between">
                  <span className="font-medium text-gray-700">{day}</span>
                  <span className="text-gray-600">{hours}</span>
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
  // Render financials tab
  const renderFinancials = () => <div className="px-6 lg:px-8">
      {business.financials ? <>
          {/* Financial Overview */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.financials.revenue && <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center mb-2">
                    <DollarSignIcon className="w-4 h-4 text-green-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Annual Revenue
                    </h4>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">
                    {business.financials.revenue}
                  </p>
                  {business.financials.revenueGrowth && <div className="mt-2 text-xs text-green-600 flex items-center">
                      <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
                      <span>
                        +{business.financials.revenueGrowth}% from previous year
                      </span>
                    </div>}
                </div>}
              {business.financials.marketShare && <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center mb-2">
                    <PieChartIcon className="w-4 h-4 text-blue-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Market Share
                    </h4>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">
                    {business.financials.marketShare}
                  </p>
                </div>}
              {business.financials.profitMargin && <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center mb-2">
                    <PercentIcon className="w-4 h-4 text-purple-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Profit Margin
                    </h4>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">
                    {business.financials.profitMargin}
                  </p>
                </div>}
            </div>
          </div>
          {/* Investments */}
          {business.financials.investments && business.financials.investments.length > 0 && <div className="mb-6 border-b border-gray-100 pb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Investments & Funding
                </h3>
                <div className="space-y-3">
                  {business.financials.investments.map((investment: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-800">
                            {investment.round}
                          </h4>
                          <span className="text-gray-600">
                            {investment.date}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">
                          <span className="font-semibold">
                            {investment.amount}
                          </span>
                          {investment.investors && ` from ${investment.investors}`}
                        </p>
                        {investment.details && <p className="text-sm text-gray-600">
                            {investment.details}
                          </p>}
                      </div>)}
                </div>
              </div>}
          {/* Financial Reports */}
          {business.financials.reports && business.financials.reports.length > 0 && <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Financial Reports
                </h3>
                <div className="space-y-2">
                  {business.financials.reports.map((report: any, index: number) => <div key={index} className="flex items-center p-2.5 bg-gray-50 rounded-md border border-gray-100">
                        <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">{report.title}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({report.year})
                        </span>
                        <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150">
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      </div>)}
                </div>
              </div>}
        </> : <div className="text-center py-8">
          <DollarSignIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Financial Information
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Financial information for this business is not publicly available or
            has not been provided.
          </p>
        </div>}
    </div>;
  // Determine drawer width based on expanded state and screen size
  const getDrawerWidth = () => {
    // On mobile, always use full width
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
      return '100vw';
    }
    // On tablet, use 60vw or 100vw for expanded
    if (typeof window !== 'undefined' && window.innerWidth <= 1279) {
      return isExpanded ? '100vw' : '60vw';
    }
    // On desktop, use 40vw or 100vw for expanded
    return isExpanded ? '100vw' : '40vw';
  };
  // Define transition classes for reduced motion preference
  const transitionClass = prefersReducedMotion.current ? '' : 'transition-all duration-300 ease-in-out';
  // Determine overlay opacity based on screen size
  const overlayOpacity = typeof window !== 'undefined' && window.innerWidth <= 767 ? 'opacity-50' : 'opacity-30';
  // Render the appropriate tab content based on active tab
  const renderTabContent = () => {
    const activeTabId = getActiveTabId();
    switch (activeTabId) {
      case 'overview':
        return renderOverview();
      case 'contact':
        return renderContactAndLocation();
      case 'products':
        return renderProductsAndServices();
      case 'financials':
        return renderFinancials();
      case 'review':
        return renderReviewAndComments();
      default:
        return renderOverview();
    }
  };

  // Render review and comments tab
  const renderReviewAndComments = () => {
    return (
      <ReviewCommentsModule
        itemId={business.id}
        itemType="Business"
        currentStatus={currentReviewStatus}
        isDraft={isDraft}
        isPending={isPending}
        isPublished={isPublished}
        isArchived={isArchived}
        isRejected={isRejected}
        onApprove={onApprove || (() => {})}
        onReject={onReject || (() => {})}
        onSendBack={onSendBack || (() => {})}
        canApprove={ability.can('publish', 'Business')}
        canReject={ability.can('approve', 'Business')}
        canSendBack={ability.can('approve', 'Business')}
        canUnpublish={ability.can('unpublish', 'Business')}
        canArchive={false} // Businesses don't have archive
        canFlag={userSegment === 'internal'}
        comments={business.comments || []}
        activityLog={business.activityLog || []}
        tableName="eco_business_directory"
        showToast={showToast}
        onStatusChange={async (newStatus) => {
          // Update local business state if available
          if (business && business.status !== newStatus) {
            // Map back from review status to business status
            const reverseMap: Record<string, string> = {
              'Published': business.status === 'Featured' ? 'Featured' : 'Active',
              'Pending Review': 'Pending',
              'Draft': 'Inactive'
            };
            business.status = reverseMap[newStatus] || business.status;
            
            // Refresh parent component's list
            if (onRefresh) {
              await onRefresh();
            }
            
            // Show updated status in toast
            if (showToast) {
              showToast(`Status updated to ${business.status}`, 'success');
            }
          }
        }}
      />
    );
  };
  return <div className="fixed inset-0 overflow-hidden z-50">
      {/* Background overlay */}
      <div className={`absolute inset-0 bg-black ${transitionClass} ${isOpen ? overlayOpacity : 'opacity-0'}`} onClick={isExpanded ? undefined : handleClose} aria-hidden="true"></div>
      {/* Drawer container */}
      <div className={`fixed inset-y-0 right-0 ${transitionClass}`} style={{
      width: getDrawerWidth(),
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
    }} ref={drawerRef}>
        <div className="h-full bg-white shadow-xl overflow-hidden flex flex-col">
          {/* Content container with smooth scale/fade effect */}
          <div ref={contentRef} className={`flex flex-col h-full ${transitionClass}`} style={{
          opacity: 1,
          transform: 'scale(1)'
        }}>
            {/* Drawer Header - Sticky with white background and shadow */}
            <div ref={headerRef} className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 transition-all duration-300 ease-in-out">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center sm:items-start">
                    <button type="button" className="sm:hidden mr-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" onClick={handleClose}>
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {business.name}
                      </h2>
                      <div className="mt-1 flex flex-col space-y-1">
                        <div className="flex items-center">
                          {renderStatus(business.status)}
                          {business.size && <span className="ml-2">
                              {renderSize(business.size)}
                            </span>}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-700">
                            {business.industry}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isExpanded && <>
                        <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={exportPdf} title="Export as PDF">
                          <span className="sr-only">Export as PDF</span>
                          <DownloadIcon className="h-5 w-5" />
                        </button>
                        <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={copyDeepLink} title="Copy Link">
                          <span className="sr-only">Copy Link</span>
                          <CopyIcon className="h-5 w-5" />
                        </button>
                      </>}
                    <button type="button" className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={toggleExpanded} title={isExpanded ? 'Collapse' : 'Expand'}>
                      <span className="sr-only">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? <MinimizeIcon className="h-5 w-5" /> : <MaximizeIcon className="h-5 w-5" />}
                    </button>
                    <button type="button" className="hidden sm:block rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150" onClick={handleClose}>
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Tabs Navigation */}
            <div ref={tabsRef} className="sticky top-[57px] sm:top-[72px] z-10 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''} px-4 sm:px-6`}>
                <TabsSimple sections={availableTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} data-id="business-details-tabs" />
              </div>
            </div>
            {/* Tab Content - Scrollable area with max height */}
            <div ref={contentAreaRef} className="flex-1 overflow-y-auto" style={{
            maxHeight: 'calc(100vh - 160px)'
          }}>
              <div className={`py-6 ${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                {renderTabContent()}
              </div>
            </div>
            {/* Drawer Footer - Sticky at the bottom */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 shadow-inner">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                  <button type="button" className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={isExpanded ? toggleExpanded : handleClose}>
                    {isExpanded ? 'Collapse' : 'Close'}
                  </button>
                  <div className="flex sm:space-x-3">
                    {business.website && <a href={business.website} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                        <GlobeIcon className="w-4 h-4 mr-1.5" />
                        Visit Website
                      </a>}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="hidden sm:inline">
                    Keyboard shortcuts: Esc to close, Shift+Enter to toggle full
                    view
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};