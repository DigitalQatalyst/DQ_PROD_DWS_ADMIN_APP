import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon, CheckCircleIcon, ArchiveIcon, FlagIcon, BarChartIcon, TrendingUpIcon, ClockIcon, StarIcon, MaximizeIcon, MinimizeIcon, CopyIcon, DownloadIcon, BuildingIcon, MailIcon, GlobeIcon, MapPinIcon, PhoneIcon, BriefcaseIcon, TagIcon, HomeIcon, ShieldIcon, TruckIcon, UsersIcon, CalendarIcon, AwardIcon, HashIcon, LinkIcon, DollarSignIcon, PieChartIcon, PercentIcon } from 'lucide-react';
import { createFocusTrap } from 'focus-trap';
import { TabsSimple } from './TabVariations';
import type { SimpleSection } from './TabVariations';
type ZoneDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  zone: any;
};
export const ZoneDetailsDrawer: React.FC<ZoneDetailsDrawerProps> = ({
  isOpen,
  onClose,
  zone
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
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
  }, [isOpen, isExpanded, zone]);
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
  // Get available tabs based on zone data
  const getAvailableTabs = () => {
    const tabs = [{
      id: 'overview',
      title: 'Overview'
    }, {
      id: 'businesses',
      title: 'Businesses'
    }, {
      id: 'incentives',
      title: 'Incentives & Benefits'
    }, {
      id: 'contact',
      title: 'Contact & Location'
    }];
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
    if (isOpen && zone) {
      url.searchParams.set('zoneId', zone.id);
      if (isExpanded) {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.set('view', 'drawer');
      }
    } else {
      url.searchParams.delete('zoneId');
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };
  // Render zone type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      'Free Zone': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Industrial Zone': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Business Park': 'bg-green-100 text-green-800 border border-green-200',
      'Economic Zone': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Technology Hub': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>;
  };
  // Render zone status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border border-green-200',
      Developing: 'bg-amber-100 text-amber-800 border border-amber-200',
      Planned: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Copy deep link to clipboard
  const copyDeepLink = () => {
    const zoneId = zone.id;
    const currentUrl = new URL(window.location.href);
    // Ensure we're on the zones-clusters page
    currentUrl.pathname = '/zones-clusters';
    // Set the query parameters
    currentUrl.searchParams.set('zoneId', zoneId);
    currentUrl.searchParams.set('view', isExpanded ? 'full' : 'drawer');
    navigator.clipboard.writeText(currentUrl.toString());
    alert('Link copied to clipboard!');
  };
  // Export zone details as PDF
  const exportPdf = () => {
    alert('Exporting zone details as PDF...');
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
    url.searchParams.delete('zoneId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close drawer
    onClose();
  };
  // Filter businesses in this zone
  const getBusinessesInZone = () => {
    // TODO: Replace with actual business data from database
    return [];
  };
  // Render overview tab
  const renderOverview = () => <div className="px-6 lg:px-8">
      {/* Logo */}
      {zone.logo && <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-white p-2 flex items-center justify-center">
            <img src={zone.logo} alt={`${zone.name} logo`} className="max-h-full max-w-full object-contain" />
          </div>
        </div>}
      {/* Zone Type */}
      <div className="mb-4 flex items-center">
        <div className={`p-2 rounded-md ${zone.type === 'Free Zone' ? 'bg-blue-100 text-blue-600' : zone.type === 'Industrial Zone' ? 'bg-purple-100 text-purple-600' : zone.type === 'Business Park' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
          <BuildingIcon className="h-4 w-4" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-700">{zone.type}</h3>
          <p className="text-xs text-gray-500">
            {zone.status && `${zone.status}`}
          </p>
        </div>
      </div>
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed">{zone.description}</p>
      </div>
      {/* Primary Industries */}
      <div className="border-b border-gray-100 mb-6 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Primary Industries
        </h3>
        <div className="flex flex-wrap gap-2">
          {zone.industries.map((industry: string, index: number) => <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
              {industry}
            </span>)}
        </div>
      </div>
      {/* Established Date */}
      {zone.establishedDate && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Established
          </h3>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {formatDate(zone.establishedDate)}
            </span>
          </div>
        </div>}
      {/* Total Area */}
      {zone.totalArea && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Total Area
          </h3>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{zone.totalArea}</span>
          </div>
        </div>}
      {/* Number of Businesses */}
      {zone.associatedBusinesses && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Businesses
          </h3>
          <div className="flex items-center">
            <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {zone.associatedBusinesses.length} businesses operating in this
              zone
            </span>
          </div>
        </div>}
      {/* Key Features */}
      {zone.keyFeatures && zone.keyFeatures.length > 0 && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Key Features
          </h3>
          <div className="space-y-3">
            {zone.keyFeatures.map((feature: string, index: number) => <div key={index} className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <p className="text-gray-700">{feature}</p>
              </div>)}
          </div>
        </div>}
      {/* Regulatory Authority */}
      {zone.regulatoryAuthority && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Regulatory Authority
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <ShieldIcon className="h-4 w-4 text-gray-600 mr-2" />
              <p className="text-gray-800 font-medium">
                {zone.regulatoryAuthority.name}
              </p>
            </div>
            {zone.regulatoryAuthority.website && <div className="flex items-center mt-2 text-sm">
                <GlobeIcon className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                <a href={zone.regulatoryAuthority.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {zone.regulatoryAuthority.website.replace(/^https?:\/\//, '')}
                </a>
              </div>}
          </div>
        </div>}
    </div>;
  // Render businesses tab
  const renderBusinesses = () => {
    const businesses = getBusinessesInZone();
    return <div className="px-6 lg:px-8">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Businesses Operating in {zone.name}
          </h3>
          {businesses.length === 0 ? <div className="bg-gray-50 rounded-lg p-6 text-center">
              <BuildingIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                No businesses currently registered in this zone.
              </p>
            </div> : <div className="space-y-4">
              {businesses.map((business: any) => <div key={business.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    {business.logo && <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden border border-gray-100 flex items-center justify-center bg-white">
                        <img src={business.logo} alt={`${business.name} logo`} className="max-h-10 max-w-10 object-contain" />
                      </div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {business.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {business.foundedYear}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {business.industry}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                          ${business.type === 'Government' ? 'bg-blue-100 text-blue-800' : business.type === 'Private' ? 'bg-purple-100 text-purple-800' : business.type === 'Semi-Government' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {business.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {business.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      <span>{business.employees}</span>
                    </div>
                    <a href={`/business-directory?businessId=${business.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
                      View Details
                      <ChevronRightIcon className="h-3 w-3 ml-0.5" />
                    </a>
                  </div>
                </div>)}
            </div>}
        </div>
        {businesses.length > 0 && <div className="text-center mt-4">
            <a href="/business-directory" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              View all businesses in the directory
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </a>
          </div>}
      </div>;
  };
  // Render incentives tab
  const renderIncentives = () => <div className="px-6 lg:px-8">
      {zone.incentives && zone.incentives.length > 0 ? <>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Key Incentives & Benefits
            </h3>
            <div className="space-y-4">
              {zone.incentives.map((incentive: any, index: number) => <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-md ${incentive.category === 'Tax' ? 'bg-green-100 text-green-600' : incentive.category === 'Visa' ? 'bg-blue-100 text-blue-600' : incentive.category === 'Ownership' ? 'bg-purple-100 text-purple-600' : incentive.category === 'Infrastructure' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} mr-3 mt-0.5`}>
                      {incentive.category === 'Tax' && <DollarSignIcon className="h-4 w-4" />}
                      {incentive.category === 'Visa' && <UserIcon className="h-4 w-4" />}
                      {incentive.category === 'Ownership' && <HomeIcon className="h-4 w-4" />}
                      {incentive.category === 'Infrastructure' && <BuildingIcon className="h-4 w-4" />}
                      {!['Tax', 'Visa', 'Ownership', 'Infrastructure'].includes(incentive.category) && <TagIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-1">
                        {incentive.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {incentive.description}
                      </p>
                      {incentive.eligibility && <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Eligibility:
                          </p>
                          <p className="text-xs text-gray-700">
                            {incentive.eligibility}
                          </p>
                        </div>}
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
          {zone.comparisonWithOtherZones && <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Comparative Advantages
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-700 mb-3">
                  {zone.comparisonWithOtherZones.description}
                </p>
                {zone.comparisonWithOtherZones.advantages && zone.comparisonWithOtherZones.advantages.length > 0 && <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        Key Advantages:
                      </p>
                      {zone.comparisonWithOtherZones.advantages.map((advantage: string, index: number) => <div key={index} className="flex items-start">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5" />
                            <p className="text-sm text-gray-700">{advantage}</p>
                          </div>)}
                    </div>}
              </div>
            </div>}
        </> : <div className="text-center py-8">
          <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Incentives Information
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Information about incentives and benefits for this zone is not
            currently available.
          </p>
        </div>}
    </div>;
  // Render contact tab
  const renderContact = () => <div className="px-6 lg:px-8">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BuildingIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Main Contact
              </h4>
            </div>
            <div className="space-y-4">
              {zone.phone && <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={`tel:${zone.phone}`} className="text-sm text-blue-600">
                      {zone.phone}
                    </a>
                  </div>
                </div>}
              {zone.email && <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <div className="flex items-center">
                    <MailIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={`mailto:${zone.email}`} className="text-sm text-blue-600">
                      {zone.email}
                    </a>
                  </div>
                </div>}
              {zone.website && <div>
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  <div className="flex items-center">
                    <GlobeIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                    <a href={zone.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {zone.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>}
            </div>
          </div>
          {zone.customerServiceCenter && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <UserIcon className="w-5 h-5 text-purple-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-800">
                  Customer Service
                </h4>
              </div>
              <div className="space-y-4">
                {zone.customerServiceCenter.phone && <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a href={`tel:${zone.customerServiceCenter.phone}`} className="text-sm text-blue-600">
                      {zone.customerServiceCenter.phone}
                    </a>
                  </div>}
                {zone.customerServiceCenter.email && <div className="flex items-center">
                    <MailIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <a href={`mailto:${zone.customerServiceCenter.email}`} className="text-sm text-blue-600">
                      {zone.customerServiceCenter.email}
                    </a>
                  </div>}
                {zone.customerServiceCenter.hours && <div>
                    <p className="text-xs text-gray-500 mb-1">Service Hours</p>
                    <div className="flex items-start">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {zone.customerServiceCenter.hours}
                      </p>
                    </div>
                  </div>}
              </div>
            </div>}
        </div>
      </div>
      {/* Address */}
      {zone.location && <div className="mb-8 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Location</h3>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start mb-4">
              <MapPinIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  Address
                </h4>
                <p className="text-sm text-gray-700">{zone.location.address}</p>
              </div>
            </div>
            {zone.location.coordinates && <div className="relative h-48 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Map would be displayed here
                  </p>
                </div>
              </div>}
            {zone.location.directions && <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Directions:</p>
                <p className="text-sm text-gray-700">
                  {zone.location.directions}
                </p>
              </div>}
          </div>
        </div>}
      {/* Office Hours */}
      {zone.officeHours && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Office Hours
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="space-y-2">
              {Object.entries(zone.officeHours).map(([day, hours]) => <div key={day} className="flex justify-between">
                  <span className="font-medium text-gray-700">{day}</span>
                  <span className="text-gray-600">{hours}</span>
                </div>)}
            </div>
          </div>
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
      case 'businesses':
        return renderBusinesses();
      case 'incentives':
        return renderIncentives();
      case 'contact':
        return renderContact();
      default:
        return renderOverview();
    }
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
                        {zone.name}
                      </h2>
                      <div className="mt-1 flex flex-col space-y-1">
                        <div className="flex items-center">
                          {renderStatus(zone.status)}
                          <span className="ml-2">{renderType(zone.type)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-700">
                            {zone.location ? zone.location.city : ''}
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
                <TabsSimple sections={availableTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} data-id="zone-details-tabs" />
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
                    {zone.website && <a href={zone.website} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
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