import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon, CheckCircleIcon, ArchiveIcon, FlagIcon, BarChartIcon, TrendingUpIcon, ClockIcon, StarIcon, MaximizeIcon, MinimizeIcon, CopyIcon, DownloadIcon, BuildingIcon, MailIcon, BadgeIcon, FileIcon, AlertCircleIcon, ChevronDownIcon, DollarSignIcon, ShieldIcon, ListChecksIcon, FileCheckIcon, TagIcon, TargetIcon } from 'lucide-react';
import { createFocusTrap } from 'focus-trap';
import { TabsSimple } from './TabVariations';
import type { SimpleSection } from './TabVariations';
import { ReviewCommentsModule } from './ReviewCommentsModule';
import { useAbility } from '../hooks/useAbility';
import { useAuth } from '../context/AuthContext';
import { useReviewWorkflow } from '../hooks/useReviewWorkflow';
type ServiceDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
  canApprove?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onRefresh?: () => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error') => void;
};
export const ServiceDetailsDrawer: React.FC<ServiceDetailsDrawerProps> = ({
  isOpen,
  onClose,
  service,
  onApprove,
  onReject,
  onSendBack,
  canApprove = true,
  canUpdate = true,
  canDelete = true,
  onRefresh,
  showToast
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const ability = useAbility();
  const { userSegment, user } = useAuth();

  // State for action modals
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [unpublishNote, setUnpublishNote] = useState('');
  const [flagNote, setFlagNote] = useState('');
  const [archiveNote, setArchiveNote] = useState('');

  // Initialize workflow hook for service actions
  const workflow = useReviewWorkflow({
    itemId: service?.id || '',
    itemType: 'service',
    currentStatus: service?.status || '',
    tableName: 'marketplace_services',
    onStatusChange: async (newStatus) => {
      if (onRefresh) {
        await onRefresh();
      }
    },
    showToast
  });
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Set up focus trap for accessibility
  useEffect(() => {
    // Deactivate focus trap when modals are open
    if (showUnpublishModal || showFlagModal || showArchiveModal) {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
      return;
    }

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
      if (focusTrapRef.current && !showUnpublishModal && !showFlagModal && !showArchiveModal) {
        focusTrapRef.current.deactivate();
        // Restore focus when drawer closes
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus();
        }
      }
    };
  }, [isOpen, showUnpublishModal, showFlagModal, showArchiveModal]);
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
      // Ctrl/Cmd+E to export PDF
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        exportPdf();
      }
      // Arrow keys to switch tabs
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const availableTabs = getAvailableTabs();
        if (e.key === 'ArrowRight') {
          const nextIndex = (activeTabIndex + 1) % availableTabs.length;
          setActiveTabIndex(nextIndex);
        } else {
          const prevIndex = (activeTabIndex - 1 + availableTabs.length) % availableTabs.length;
          setActiveTabIndex(prevIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded, activeTabIndex]);
  // Handle URL params for deep linking
  useEffect(() => {
    if (isOpen) {
      updateUrlParams();
    }
  }, [isOpen, isExpanded, service]);
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

  // Helper function to get submitted date from either property name
  const getSubmittedDate = (service: any) => {
    return service.submitted_on || service.submittedOn;
  };

  // Helper function to safely format date
  const formatSubmittedDate = (service: any) => {
    const dateStr = getSubmittedDate(service);
    if (!dateStr) return 'Unknown date';
    try {
      // Handle both ISO string and formatted date string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If it's already a formatted string, just take the date part
        return dateStr.split(' ')[0];
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr.split(' ')[0];
    }
  };

  // Helper to safely access nested properties
  const safeGet = (obj: any, ...keys: string[]) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined) {
        return obj[key];
      }
    }
    return undefined;
  };

  const isPublished = service.status === 'Published';
  // Get available tabs based on service status
  const getAvailableTabs = () => {
    const tabs = [{
      id: 'details',
      title: 'Details'
    }, {
      id: 'review',
      title: 'Review & Comments'
    }, {
      id: 'provider',
      title: 'Provider Details'
    }];
    if (isPublished) {
      tabs.push({
        id: 'insights',
        title: 'Service Insights'
      });
    }
    return tabs;
  };
  const availableTabs = getAvailableTabs();
  // Get current active tab ID
  const getActiveTabId = () => {
    return availableTabs[activeTabIndex]?.id || 'details';
  };
  // Update URL params for deep linking
  const updateUrlParams = () => {
    const url = new URL(window.location.href);
    if (isOpen && service) {
      url.searchParams.set('serviceId', service.id);
      if (isExpanded) {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.set('view', 'drawer');
      }
    } else {
      url.searchParams.delete('serviceId');
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };
  const getStatusStyle = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Published: 'bg-green-100 text-green-800 border border-green-200',
      Unpublished: 'bg-blue-100 text-blue-800 border border-blue-200',
      Archived: 'bg-gray-100 text-gray-800 border border-gray-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      'Sent Back': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };
  // Determine the step text based on service type
  const getStepText = () => {
    return 'Service Review';
  };
  // Copy deep link to clipboard
  const copyDeepLink = () => {
    const serviceId = service.id;
    const currentUrl = new URL(window.location.href);
    // Ensure we're on the service-management page
    currentUrl.pathname = '/service-management';
    // Set the query parameters
    currentUrl.searchParams.set('serviceId', serviceId);
    currentUrl.searchParams.set('view', isExpanded ? 'full' : 'drawer');
    navigator.clipboard.writeText(currentUrl.toString());
    alert('Link copied to clipboard!');
  };
  // Export service details as PDF
  const exportPdf = () => {
    alert('Exporting service details as PDF...');
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
    url.searchParams.delete('serviceId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close drawer
    onClose();
  };
  // Render approval flow tracker
  const renderApprovalFlow = () => {
    if (service.type === 'Financial') {
      return <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Approval Flow
        </h3>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-1 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="relative flex justify-between">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full ${service.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center shadow-sm`}>
                {service.status === 'Rejected' ? <XIcon className="h-3 w-3 text-white" /> : <CheckCircleIcon className="h-3 w-3 text-white" />}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Review
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full ${service.status === 'Published' || service.status === 'Unpublished' || service.status === 'Archived' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center shadow-sm`}>
                {service.status === 'Published' || service.status === 'Unpublished' || service.status === 'Archived' ? <CheckCircleIcon className="h-3 w-3 text-white" /> : <span className="text-xs text-white">2</span>}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Published
              </span>
            </div>
          </div>
        </div>
      </div>;
    } else {
      return <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Approval Flow
        </h3>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-1 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="relative flex justify-between">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full ${service.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center shadow-sm`}>
                {service.status === 'Rejected' ? <XIcon className="h-3 w-3 text-white" /> : <CheckCircleIcon className="h-3 w-3 text-white" />}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Review
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full ${service.status === 'Published' || service.status === 'Unpublished' || service.status === 'Archived' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center shadow-sm`}>
                {service.status === 'Published' || service.status === 'Unpublished' || service.status === 'Archived' ? <CheckCircleIcon className="h-3 w-3 text-white" /> : <span className="text-xs text-white">2</span>}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Final
              </span>
            </div>
          </div>
        </div>
      </div>;
    }
  };
  // Helper function to remove "all" from the beginning of eligibility items
  const cleanEligibilityItem = (item: string): string => {
    const trimmed = item.trim();
    // Remove "all" at the beginning (case-insensitive) followed by space/comma
    return trimmed.replace(/^all\s*[,:]\s*/i, '').trim();
  };

  // Render financial service details
  const renderFinancialDetails = () => {
    const eligibility = safeGet(service, 'eligibility') || [];
    const applicationRequirements = safeGet(service, 'applicationRequirements', 'application_requirements') || [];
    const processingTime = safeGet(service, 'processingTime', 'processing_time') || 'N/A';
    const fee = safeGet(service, 'fee') || 'N/A';
    const documentsRequired = safeGet(service, 'documentsRequired', 'documents_required') || [];
    const keyTermsOfService = safeGet(service, 'keyTermsOfService', 'key_terms_of_service') || safeGet(service, 'regulatoryCategory', 'regulatory_category') || '';
    const additionalTermsOfService = safeGet(service, 'additionalTermsOfService', 'additional_terms_of_service') || '';

    return <div className="px-6 lg:px-8 py-4 space-y-6">
      {/* Description Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              {service.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Card */}
      {eligibility.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Eligibility Requirements
              </h3>
              <ul className="space-y-2.5">
                {eligibility.map((item: string, index: number) => {
                  const cleanedItem = cleanEligibilityItem(item);
                  return cleanedItem ? (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
                      <span className="text-gray-700 text-sm leading-relaxed">{cleanedItem}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Application Requirements Card */}
      {applicationRequirements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <ListChecksIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Application Requirements
              </h3>
              <ul className="space-y-2.5">
                {applicationRequirements.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-3"></span>
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <ClockIcon className="w-4 h-4 text-blue-600 mr-2" />
            <h3 className="text-xs font-medium text-blue-900 uppercase tracking-wide">
              Processing Time
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{processingTime}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <DollarSignIcon className="w-4 h-4 text-green-600 mr-2" />
            <h3 className="text-xs font-medium text-green-900 uppercase tracking-wide">
              Fee / Cost
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{fee}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <TagIcon className="w-4 h-4 text-gray-600 mr-2" />
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide">
              Service Type
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{service.type || 'N/A'}</p>
        </div>
      </div>

      {/* Terms of Service Card */}
      {(keyTermsOfService || additionalTermsOfService) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <FileTextIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Terms of Service
              </h3>
              <div className="space-y-3">
                {keyTermsOfService && (
                  <div>
                    {typeof keyTermsOfService === 'string'
                      ? keyTermsOfService.split('\n').filter((term: string) => term.trim()).map((term: string, idx: number) => (
                        <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                          {term.trim()}
                        </p>
                      ))
                      : <p className="text-gray-700 text-sm leading-relaxed">{keyTermsOfService}</p>
                    }
                  </div>
                )}
                {additionalTermsOfService && (
                  <div>
                    {typeof additionalTermsOfService === 'string'
                      ? additionalTermsOfService.split('\n').filter((term: string) => term.trim()).map((term: string, idx: number) => (
                        <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                          {term.trim()}
                        </p>
                      ))
                      : Array.isArray(additionalTermsOfService)
                        ? additionalTermsOfService.filter((term: string) => term.trim()).map((term: string, idx: number) => (
                          <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                            {term.trim()}
                          </p>
                        ))
                        : <p className="text-gray-700 text-sm leading-relaxed">{additionalTermsOfService}</p>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Required Card */}
      {documentsRequired.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <FileCheckIcon className="w-5 h-5 text-indigo-600 mr-3" />
            <h3 className="text-base font-semibold text-gray-900">
              Required Documents
            </h3>
          </div>
          <div className="space-y-3">
            {documentsRequired.map((doc: string, index: number) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2 mr-3">
                    <FileIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-900 text-sm font-medium">{doc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>;
  };
  // Render non-financial service details
  const renderNonFinancialDetails = () => {
    const eligibility = safeGet(service, 'eligibility') || [];
    const processingTime = safeGet(service, 'processingTime', 'processing_time') || 'N/A';
    const fee = safeGet(service, 'fee') || 'N/A';
    const outcome = safeGet(service, 'outcome') || '';
    const keyTermsOfService = safeGet(service, 'keyTermsOfService', 'key_terms_of_service') || '';
    const additionalTermsOfService = safeGet(service, 'additionalTermsOfService', 'additional_terms_of_service') || outcome || '';

    return <div className="px-6 lg:px-8 py-4 space-y-6">
      {/* Description Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              {service.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Card */}
      {service.category && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TagIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Category
              </h3>
              <p className="text-gray-900 font-semibold text-base">{service.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Eligibility Card */}
      {eligibility.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Eligibility Requirements
              </h3>
              <ul className="space-y-2.5">
                {eligibility.map((item: string, index: number) => {
                  const cleanedItem = cleanEligibilityItem(item);
                  return cleanedItem ? (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3"></span>
                      <span className="text-gray-700 text-sm leading-relaxed">{cleanedItem}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Card */}
      {(keyTermsOfService || additionalTermsOfService) && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0">
              <FileTextIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Terms of Service
              </h3>
              <div className="space-y-3">
                {keyTermsOfService && (
                  <div>
                    {typeof keyTermsOfService === 'string'
                      ? keyTermsOfService.split('\n').filter((term: string) => term.trim()).map((term: string, idx: number) => (
                        <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                          {term.trim()}
                        </p>
                      ))
                      : <p className="text-gray-700 text-sm leading-relaxed">{keyTermsOfService}</p>
                    }
                  </div>
                )}
                {additionalTermsOfService && (
                  <div>
                    {typeof additionalTermsOfService === 'string'
                      ? additionalTermsOfService.split('\n').filter((term: string) => term.trim()).map((term: string, idx: number) => (
                        <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                          {term.trim()}
                        </p>
                      ))
                      : Array.isArray(additionalTermsOfService)
                        ? additionalTermsOfService.filter((term: string) => term.trim()).map((term: string, idx: number) => (
                          <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-2">
                            {term.trim()}
                          </p>
                        ))
                        : <p className="text-gray-700 text-sm leading-relaxed">{additionalTermsOfService}</p>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <ClockIcon className="w-4 h-4 text-blue-600 mr-2" />
            <h3 className="text-xs font-medium text-blue-900 uppercase tracking-wide">
              Processing Time
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{processingTime}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <DollarSignIcon className="w-4 h-4 text-green-600 mr-2" />
            <h3 className="text-xs font-medium text-green-900 uppercase tracking-wide">
              Fee / Cost
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{fee}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="flex items-center mb-2">
            <TagIcon className="w-4 h-4 text-gray-600 mr-2" />
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide">
              Service Type
            </h3>
          </div>
          <p className="text-gray-900 font-semibold text-base">{service.type || 'N/A'}</p>
        </div>
      </div>
    </div>;
  };
  // Map service status to review workflow status
  const mapServiceStatusToReviewStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Draft': 'Draft',
      'Pending': 'Pending Review',
      'Published': 'Published',
      'Unpublished': 'Published', // Treat unpublished as published for workflow
      'Rejected': 'Rejected',
      'Sent Back': 'Draft',
      'Archived': 'Archived'
    };
    return statusMap[status] || status;
  };

  // Determine status flags for ReviewCommentsModule
  const currentReviewStatus = mapServiceStatusToReviewStatus(service.status);
  const isDraft = currentReviewStatus === 'Draft' || service.status === 'Draft' || service.status === 'Sent Back';
  const isPending = currentReviewStatus === 'Pending Review' || service.status === 'Pending';
  const isPublishedStatus = currentReviewStatus === 'Published' || service.status === 'Published' || service.status === 'Unpublished';
  const isArchived = currentReviewStatus === 'Archived' || service.status === 'Archived';
  const isRejected = currentReviewStatus === 'Rejected' || service.status === 'Rejected';

  // Render review and comments tab
  const renderReviewAndComments = () => {
    return (
      <ReviewCommentsModule
        itemId={service.id}
        itemType="Service"
        currentStatus={currentReviewStatus}
        isDraft={isDraft}
        isPending={isPending}
        isPublished={isPublishedStatus}
        isArchived={isArchived}
        isRejected={isRejected}
        onApprove={onApprove}
        onReject={onReject}
        onSendBack={onSendBack}
        canApprove={ability.can('approve', 'Service')}
        canReject={ability.can('approve', 'Service')}
        canSendBack={ability.can('approve', 'Service')}
        canUnpublish={ability.can('publish', 'Service') || ability.can('publish', 'Content')}
        canArchive={ability.can('archive', 'Service')}
        canFlag={(ability.can('flag', 'Service') || ability.can('flag', 'Content')) && userSegment === 'internal'}
        comments={safeGet(service, 'comments') || []}
        activityLog={safeGet(service, 'activityLog', 'activity_log') || []}
        tableName="marketplace_services"
        showToast={showToast}
        onStatusChange={async (newStatus) => {
          // Update local service state if available
          if (service && service.status !== newStatus) {
            service.status = newStatus;

            // Refresh parent component's list
            if (onRefresh) {
              await onRefresh();
            }

            // Show updated status in toast
            if (showToast) {
              showToast(`Status updated to ${newStatus}`, 'success');
            }
          }
        }}
      />
    );
  };
  // Render provider details tab
  const renderProviderDetails = () => {
    const partnerInfo = safeGet(service, 'partnerInfo', 'partner_info') || {};
    const partnerName = safeGet(service, 'partner', 'partner_name') || partnerInfo.name || 'N/A';

    return <div className="px-6 lg:px-8">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Partner Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BuildingIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Partner Details
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Partner Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {partnerName}
                </p>
              </div>
              {partnerInfo.email && <div>
                <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                <div className="flex items-center">
                  <MailIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                  <p className="text-sm text-blue-600">
                    {partnerInfo.email}
                  </p>
                </div>
              </div>}
              {partnerInfo.tier && <div>
                <p className="text-xs text-gray-500 mb-1">Partner Tier</p>
                <div className="flex items-center">
                  <BadgeIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${partnerInfo.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : partnerInfo.tier === 'Silver' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                    {partnerInfo.tier}
                  </span>
                </div>
              </div>}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 font-medium transition-colors duration-150">
                View Partner Profile
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BarChartIcon className="w-5 h-5 text-purple-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Performance Metrics
              </h4>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-gray-500">Total Submissions</p>
                  <p className="text-xs font-medium text-gray-800">
                    {partnerInfo.totalSubmissions || 0}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{
                    width: `${Math.min((partnerInfo.totalSubmissions || 0) * 5, 100)}%`
                  }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-gray-500">Approval Rate</p>
                  <p className="text-xs font-medium text-gray-800">
                    {partnerInfo.approvalRate || 0}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-500 ease-out ${(partnerInfo.approvalRate || 0) >= 80 ? 'bg-green-500' : (partnerInfo.approvalRate || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                    width: `${partnerInfo.approvalRate || 0}%`
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {partnerInfo.complianceNotes && <div className="mb-8 border-b border-gray-100 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Compliance Notes
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-start">
            <AlertCircleIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 leading-relaxed">
              {partnerInfo.complianceNotes}
            </p>
          </div>
        </div>
      </div>}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Recent Submissions
        </h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
          <div className="p-6 text-center">
            <BarChartIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              Historical submission data would appear here.
            </p>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors duration-150">
              View All Submissions
            </button>
          </div>
        </div>
      </div>
    </div>;
  };
  // Handler for Unpublish action
  const handleUnpublish = async () => {
    if (!unpublishNote.trim()) {
      if (showToast) {
        showToast('Please provide a reason for unpublishing', 'error');
      }
      return;
    }

    const currentUserName = user?.name || 'Unknown';
    const commentText = `@${currentUserName} ${unpublishNote}`;

    // Submit comment first
    const commentMetadata = {
      comment_type: 'action_note',
      related_status_change: 'Unpublished',
      action_type: 'Unpublish',
      visibility: 'internal'
    };

    const comment = await workflow.submitComment(commentText, commentMetadata);

    if (!comment) {
      if (showToast) {
        showToast('Failed to add comment. Action cancelled.', 'error');
      }
      return;
    }

    // Transition status to Unpublished
    const success = await workflow.transitionStatus(
      'Unpublish',
      'Unpublished',
      service.status,
      { reason: unpublishNote }
    );

    if (success) {
      setShowUnpublishModal(false);
      setUnpublishNote('');
      if (onRefresh) {
        await onRefresh();
      }
    }
  };

  // Handler for Flag for Review action
  const handleFlagForReview = async () => {
    if (!flagNote.trim()) {
      if (showToast) {
        showToast('Please provide a reason for flagging', 'error');
      }
      return;
    }

    const currentUserName = user?.name || 'Unknown';
    const commentText = `@${currentUserName} ${flagNote}`;

    // Submit comment first
    const commentMetadata = {
      comment_type: 'action_note',
      related_status_change: 'Pending',
      action_type: 'Flag',
      visibility: 'internal'
    };

    const comment = await workflow.submitComment(commentText, commentMetadata);

    if (!comment) {
      if (showToast) {
        showToast('Failed to add comment. Action cancelled.', 'error');
      }
      return;
    }

    // Transition status to Pending (for services, this maps to 'Pending' in DB)
    const success = await workflow.transitionStatus(
      'Flag',
      'Pending',
      service.status,
      { reason: flagNote }
    );

    if (success) {
      setShowFlagModal(false);
      setFlagNote('');
      if (onRefresh) {
        await onRefresh();
      }
    }
  };

  // Handler for Archive action
  const handleArchive = async () => {
    if (!archiveNote.trim()) {
      if (showToast) {
        showToast('Please provide a reason for archiving', 'error');
      }
      return;
    }

    const currentUserName = user?.name || 'Unknown';
    const commentText = `@${currentUserName} ${archiveNote}`;

    // Submit comment first
    const commentMetadata = {
      comment_type: 'action_note',
      related_status_change: 'Archived',
      action_type: 'Archive',
      visibility: 'internal'
    };

    const comment = await workflow.submitComment(commentText, commentMetadata);

    if (!comment) {
      if (showToast) {
        showToast('Failed to add comment. Action cancelled.', 'error');
      }
      return;
    }

    // Transition status to Archived
    const success = await workflow.transitionStatus(
      'Archive',
      'Archived',
      service.status,
      { reason: archiveNote }
    );

    if (success) {
      setShowArchiveModal(false);
      setArchiveNote('');
      if (onRefresh) {
        await onRefresh();
      }
    }
  };

  // Render service insights tab (only for published services)
  const renderServiceInsights = () => <div className="px-6 lg:px-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {/* Applications Received */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center mb-3">
          <UserIcon className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Applications</h3>
        </div>
        <p className="text-2xl font-semibold text-gray-900">
          {service.applicants}
        </p>
        <div className="mt-2 text-xs text-green-600 flex items-center">
          <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
          <span>+12% from last month</span>
        </div>
      </div>
      {/* Feedback Summary */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center mb-3">
          <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Feedback</h3>
        </div>
        <div className="flex items-center">
          <p className="text-2xl font-semibold text-gray-900">
            {(safeGet(service, 'feedback')?.rating || 0).toFixed(1)}
          </p>
          <div className="ml-2 flex">
            {[...Array(5)].map((_, i) => {
              const rating = safeGet(service, 'feedback')?.rating || 0;
              return <StarIcon key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`} fill={i < Math.floor(rating) ? 'currentColor' : 'none'} />;
            })}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <span>Based on {safeGet(service, 'feedback')?.count || 0} reviews</span>
        </div>
      </div>
      {/* Weekly Applications Trend */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center mb-3">
          <BarChartIcon className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Weekly Trend</h3>
        </div>
        <div className="h-12 flex items-end space-x-1.5">
          <div className="bg-blue-100 w-1/7 h-3 rounded-t"></div>
          <div className="bg-blue-200 w-1/7 h-5 rounded-t"></div>
          <div className="bg-blue-300 w-1/7 h-7 rounded-t"></div>
          <div className="bg-blue-400 w-1/7 h-4 rounded-t"></div>
          <div className="bg-blue-500 w-1/7 h-6 rounded-t"></div>
          <div className="bg-blue-600 w-1/7 h-8 rounded-t"></div>
          <div className="bg-blue-700 w-1/7 h-12 rounded-t"></div>
        </div>
        <div className="mt-2 text-xs text-gray-600 flex justify-between">
          <span>Mon</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
    {/* Activity Log */}
    <div className="mb-8 border-b border-gray-100 pb-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Activity Log
      </h3>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Performed By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {service.activityLog && service.activityLog.length > 0 ? service.activityLog.map((activity: any, index: number) => <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {activity.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {activity.action}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {activity.performedBy}
                </td>
              </tr>) : <tr>
                <td colSpan={3} className="px-4 py-5 text-center text-sm text-gray-500">
                  No activity recorded
                </td>
              </tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 text-right">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150">
          View All Metrics
          <ChevronRightIcon className="ml-1 w-4 h-4" />
        </button>
      </div>
    </div>
    {/* Operational Buttons */}
    <div className="border-t border-gray-200 mt-4 pt-4">
      <div className="flex flex-wrap gap-3">
        {ability.can('publish', 'Service') && (
          <button
            type="button"
            onClick={() => setShowUnpublishModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={workflow.loading}
          >
            Unpublish
          </button>
        )}
        {(ability.can('flag', 'Service') || (ability.can('flag', 'Content') && userSegment === 'internal')) && (
          <button
            type="button"
            onClick={() => setShowFlagModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={workflow.loading}
          >
            <FlagIcon className="h-4 w-4 mr-1.5" />
            Flag for Review
          </button>
        )}
        {ability.can('archive', 'Service') && (
          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={workflow.loading}
          >
            <ArchiveIcon className="h-4 w-4 mr-1.5" />
            Archive
          </button>
        )}
      </div>
    </div>
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
      case 'details':
        return service.type === 'Financial' ? renderFinancialDetails() : renderNonFinancialDetails();
      case 'review':
        return renderReviewAndComments();
      case 'provider':
        return renderProviderDetails();
      case 'insights':
        return renderServiceInsights();
      default:
        return service.type === 'Financial' ? renderFinancialDetails() : renderNonFinancialDetails();
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
                      {service.title}
                    </h2>
                    <div className="mt-1 flex flex-col space-y-1">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(service.status)}`}>
                          {service.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Submitted on {formatSubmittedDate(service)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-medium text-gray-700">
                          {getStepText()}
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
          {/* Tabs Navigation - Using TabsSimple for responsive behavior */}
          <div ref={tabsRef} className="sticky top-[57px] sm:top-[72px] z-10 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out">
            <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''} px-4 sm:px-6`}>
              <TabsSimple sections={availableTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} data-id="service-details-tabs" />
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
                {getActiveTabId() !== 'review' && !isPublished && <div className="flex sm:space-x-3">
                  <button type="button" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={() => {
                    const reviewTabIndex = availableTabs.findIndex(tab => tab.id === 'review');
                    if (reviewTabIndex !== -1) {
                      setActiveTabIndex(reviewTabIndex);
                    }
                  }}>
                    Review Service
                  </button>
                </div>}
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

    {/* Unpublish Modal */}
    {showUnpublishModal && (
      <div className="fixed z-[100] inset-0 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowUnpublishModal(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-10" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowUnpublishModal(false)}>
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <XIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Unpublish Service
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please provide a reason for unpublishing this service. This note will be added to the comments section.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="unpublishNote" className="block text-sm font-medium text-gray-700">
                Reason for unpublishing <span className="text-red-600">*</span>
              </label>
              <textarea
                id="unpublishNote"
                name="unpublishNote"
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Explain why this service is being unpublished..."
                value={unpublishNote}
                onChange={e => setUnpublishNote(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                required
                autoFocus
              ></textarea>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUnpublish}
                disabled={workflow.loading}
              >
                {workflow.loading ? 'Processing...' : 'Unpublish Service'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => {
                  setShowUnpublishModal(false);
                  setUnpublishNote('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Flag for Review Modal */}
    {showFlagModal && (
      <div className="fixed z-[100] inset-0 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowFlagModal(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-10" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowFlagModal(false)}>
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                <FlagIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Flag for Review
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please provide a reason for flagging this service for review. This note will be added to the comments section.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="flagNote" className="block text-sm font-medium text-gray-700">
                Reason for flagging <span className="text-red-600">*</span>
              </label>
              <textarea
                id="flagNote"
                name="flagNote"
                rows={4}
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Explain why this service needs to be reviewed..."
                value={flagNote}
                onChange={e => setFlagNote(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                required
                autoFocus
              ></textarea>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFlagForReview}
                disabled={workflow.loading}
              >
                {workflow.loading ? 'Processing...' : 'Flag for Review'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagNote('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Archive Modal */}
    {showArchiveModal && (
      <div className="fixed z-[100] inset-0 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowArchiveModal(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-10" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto' }}>
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowArchiveModal(false)}>
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                <ArchiveIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Archive Service
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please provide a reason for archiving this service. This note will be added to the comments section.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="archiveNote" className="block text-sm font-medium text-gray-700">
                Reason for archiving <span className="text-red-600">*</span>
              </label>
              <textarea
                id="archiveNote"
                name="archiveNote"
                rows={4}
                className="shadow-sm focus:ring-gray-500 focus:border-gray-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Explain why this service is being archived..."
                value={archiveNote}
                onChange={e => setArchiveNote(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                required
                autoFocus
              ></textarea>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleArchive}
                disabled={workflow.loading}
              >
                {workflow.loading ? 'Processing...' : 'Archive Service'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => {
                  setShowArchiveModal(false);
                  setArchiveNote('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>;
};
