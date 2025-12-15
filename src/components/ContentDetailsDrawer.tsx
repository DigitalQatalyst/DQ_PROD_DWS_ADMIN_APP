import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon, CheckCircleIcon, ArchiveIcon, FlagIcon, BarChartIcon, TrendingUpIcon, ClockIcon, StarIcon, MaximizeIcon, MinimizeIcon, CopyIcon, DownloadIcon, BuildingIcon, MailIcon, BadgeIcon, FileIcon, AlertCircleIcon, ChevronDownIcon, BookIcon, VideoIcon, CalendarDaysIcon, NewspaperIcon, EyeIcon, ThumbsUpIcon, TagIcon, LinkIcon, GlobeIcon, MapPinIcon, UsersIcon, PieChartIcon, CalendarIcon, ClipboardIcon, InfoIcon } from 'lucide-react';
import { createFocusTrap } from 'focus-trap';
import { TabsSimple } from './TabVariations';
import type { SimpleSection } from './TabVariations';
import { Can } from './auth/Can';
import { ReviewCommentsModule } from './ReviewCommentsModule';
import { useAbility } from '../hooks/useAbility';
type ContentDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
  onArchive?: () => void;
  onUnpublish?: () => void;
  onFlag?: () => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
  onRefresh?: () => void;
};
export const ContentDetailsDrawer: React.FC<ContentDetailsDrawerProps> = ({
  isOpen,
  onClose,
  content,
  onApprove,
  onReject,
  onSendBack,
  onArchive,
  onUnpublish,
  onFlag,
  showToast,
  onRefresh
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  
  // Move useAbility hook to top level
  const ability = useAbility();
  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString || dateString === '' || dateString === 'Invalid Date') {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };
  // Format datetime for display
  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString || dateString === '' || dateString === 'Invalid Date') {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
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
  }, [isOpen, isExpanded, content]);
  // Check for deep link parameters on mount and refresh content if needed
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === 'full') {
        setIsExpanded(true);
      }
      
      // Check if we need to refresh content when drawer opens
      // This handles the case where user saved content and navigated back
      const refreshContentId = sessionStorage.getItem('content-refresh-required');
      if (refreshContentId && content?.id === refreshContentId && onRefresh) {
        // Clear the flag and refresh
        sessionStorage.removeItem('content-refresh-required');
        sessionStorage.removeItem('content-refresh-timestamp');
        onRefresh();
      }
    };
    if (isOpen) {
      checkUrlParams();
    }
  }, [isOpen, content, onRefresh]);
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
  const isPublished = content.status === 'Published';
  const isDraft = content.status === 'Draft';
  const isPendingReview = content.status === 'Pending Review';
  const isArchived = content.status === 'Archived';
  // Get content type icon
  const getContentTypeIcon = (type: string, size = 5) => {
    const iconSize = `h-${size} w-${size}`;
    switch (type) {
      case 'Article':
        return <BookIcon className={iconSize} />;
      case 'Video':
        return <VideoIcon className={iconSize} />;
      case 'Guide':
        return <FileTextIcon className={iconSize} />;
      case 'Resource':
        return <FileIcon className={iconSize} />;
      case 'Event':
        return <CalendarDaysIcon className={iconSize} />;
      case 'News':
        return <NewspaperIcon className={iconSize} />;
      default:
        return <FileTextIcon className={iconSize} />;
    }
  };
  // Get available tabs based on content status
  const getAvailableTabs = () => {
    const tabs = [{
      id: 'details',
      title: 'Details'
    }, {
      id: 'review',
      title: 'Review & Comments'
    }, {
      id: 'author',
      title: 'Author Details'
    }];
    if (isPublished) {
      tabs.push({
        id: 'insights',
        title: 'Content Insights'
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
    if (isOpen && content) {
      url.searchParams.set('contentId', content.id);
      if (isExpanded) {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.set('view', 'drawer');
      }
    } else {
      url.searchParams.delete('contentId');
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  };
  const getStatusStyle = (status: string) => {
    const statusStyles: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800 border border-gray-200',
      'Pending Review': 'bg-amber-100 text-amber-800 border border-amber-200',
      Published: 'bg-green-100 text-green-800 border border-green-200',
      Archived: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    alert(`Comment added: ${newComment}`);
    setNewComment('');
  };
  // Copy deep link to clipboard
  const copyDeepLink = () => {
    const contentId = content.id;
    const currentUrl = new URL(window.location.href);
    // Ensure we're on the content-management page
    currentUrl.pathname = '/content-management';
    // Set the query parameters
    currentUrl.searchParams.set('contentId', contentId);
    currentUrl.searchParams.set('view', isExpanded ? 'full' : 'drawer');
    navigator.clipboard.writeText(currentUrl.toString());
    alert('Link copied to clipboard!');
  };
  // Export content details as PDF
  const exportPdf = () => {
    alert('Exporting content details as PDF...');
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
    url.searchParams.delete('contentId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close drawer
    onClose();
  };
  // Render approval flow tracker
  const renderApprovalFlow = () => {
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
              <div className={`h-6 w-6 rounded-full ${content.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center shadow-sm`}>
                {content.status === 'Rejected' ? <XIcon className="h-3 w-3 text-white" /> : <CheckCircleIcon className="h-3 w-3 text-white" />}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Initial Review
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full ${content.status === 'Published' || content.status === 'Archived' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center shadow-sm`}>
                {content.status === 'Published' || content.status === 'Archived' ? <CheckCircleIcon className="h-3 w-3 text-white" /> : <span className="text-xs text-white">2</span>}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">
                Final Approval
              </span>
            </div>
          </div>
        </div>
      </div>;
  };
  // Render common content details section
  const renderCommonDetails = () => <>
      {/* Thumbnail/Cover Image */}
      {content.thumbnail && <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden h-48 w-full">
            <img src={content.thumbnail} alt={`Cover for ${content.title}`} className="w-full h-full object-cover" />
          </div>
        </div>}
      {/* Content Type */}
      <div className="mb-4 flex items-center">
        <div className={`p-2 rounded-md ${content.type === 'Article' ? 'bg-blue-100 text-blue-600' : content.type === 'Video' ? 'bg-purple-100 text-purple-600' : content.type === 'Guide' ? 'bg-emerald-100 text-emerald-600' : content.type === 'Resource' ? 'bg-indigo-100 text-indigo-600' : content.type === 'Event' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
          {getContentTypeIcon(content.type, 4)}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-700">{content.type}</h3>
          <p className="text-xs text-gray-500">
            {content.type === 'Article' || content.type === 'Guide' || content.type === 'Resource' || content.type === 'News' ? content.readTime ? `${content.readTime} read time` : '' : content.type === 'Video' ? content.duration ? `${content.duration} duration` : '' : content.type === 'Event' ? content.eventDate ? `Event date: ${content.eventDate}` : '' : ''}
          </p>
        </div>
      </div>
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed">{content.description}</p>
      </div>
      {/* Category */}
      {(content.category || (content.categories && content.categories.length > 0)) && (
        <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {content.categories && content.categories.length > 0 ? (
              content.categories.map((category: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700"
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                {content.category}
              </span>
            )}
          </div>
        </div>
      )}
      {/* Language */}
      {content.language && <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Language</h3>
          <div className="flex items-center">
            <GlobeIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{content.language}</span>
          </div>
        </div>}
      {/* Tags & Keywords */}
      <div className="border-b border-gray-100 mb-6 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Tags & Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {content.tags && content.tags.map((tag: string, index: number) => <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <TagIcon className="w-3 h-3 mr-1 text-gray-500" />
                {tag}
              </span>)}
        </div>
      </div>
      {content.businessStages && content.businessStages.length > 0 && (
        <div className="border-b border-gray-100 mb-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Business Stages</h3>
          <div className="flex flex-wrap gap-2">
            {content.businessStages.map((stage: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {stage}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Created/Submitted On */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 mb-6 pb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Created On
          </h3>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {formatDateTime(content.publishedOn || new Date().toISOString())}
            </span>
          </div>
        </div>
        {content.lastUpdated && <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Last Updated
            </h3>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">
                {formatDateTime(content.lastUpdated)}
              </span>
            </div>
          </div>}
      </div>
      {/* Featured Flag */}
      {content.featured !== undefined && <div className="mb-6 border-b border-gray-100 pb-6">
          <div className="flex items-center">
            <h3 className="text-sm font-semibold text-gray-800 mr-2">
              Featured
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${content.featured ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
              {content.featured ? 'Yes' : 'No'}
            </span>
          </div>
          {content.featured && <p className="text-xs text-gray-500 mt-1">
              This content will be highlighted on the homepage or in featured
              sections.
            </p>}
        </div>}
    </>;
  // Render article-specific details
  const renderArticleDetails = () => <div>
      {renderCommonDetails()}
      {/* Article Body Preview */}
      {content.bodyPreview && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Content Preview
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-48 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed">
              {content.bodyPreview}
            </p>
          </div>
          <button className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors duration-150">
            View Full Content
          </button>
        </div>}
      {/* Source/Reference */}
      {content.source && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Source / Reference
          </h3>
          <div className="flex items-center">
            <LinkIcon className="h-4 w-4 text-gray-500 mr-2" />
            <a href={content.source} className="text-blue-600 hover:text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              {content.sourceTitle || content.source}
            </a>
          </div>
        </div>}
    </div>;
  // Render video-specific details
  const renderVideoDetails = () => <div>
      {renderCommonDetails()}
      {/* Video Preview */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Video Preview
        </h3>
        <div className="relative rounded-lg overflow-hidden bg-gray-100 pt-[56.25%]">
          {content.videoUrl ? <iframe src={content.videoUrl} title={content.title} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> : <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="w-12 h-12 text-gray-400" />
              <span className="absolute text-xs text-gray-600 mt-16">
                Video preview not available
              </span>
            </div>}
        </div>
      </div>
      {/* Transcript */}
      {content.transcript && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Transcript
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-48 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed">
              {content.transcript}
            </p>
          </div>
          <button className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors duration-150">
            View Full Transcript
          </button>
        </div>}
    </div>;
  // Render event-specific details
  const renderEventDetails = () => <div>
      {renderCommonDetails()}
      {/* Event Details */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Event Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </p>
            <div className="flex items-center">
              <CalendarDaysIcon className="h-4 w-4 text-gray-500 mr-2" />
              <p className="text-gray-700">
                {content.eventDate}
                {content.eventTime && ` at ${content.eventTime}`}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
              <p className="text-gray-700">{content.location || 'Online'}</p>
            </div>
          </div>
          {content.capacity && <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Capacity</p>
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-700">{content.capacity} seats</p>
              </div>
            </div>}
          {content.organizer && <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Organizer
              </p>
              <p className="text-gray-700">{content.organizer}</p>
            </div>}
        </div>
      </div>
      {/* Registration Link */}
      {content.registrationUrl && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Registration
          </h3>
          <a href={content.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
            Register Now
          </a>
        </div>}
      {/* Contact Information */}
      {(content.contactEmail || content.contactPhone) && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Contact Information
          </h3>
          {content.contactEmail && <div className="flex items-center mb-2">
              <MailIcon className="h-4 w-4 text-gray-500 mr-2" />
              <a href={`mailto:${content.contactEmail}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                {content.contactEmail}
              </a>
            </div>}
          {content.contactPhone && <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
              <a href={`tel:${content.contactPhone}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                {content.contactPhone}
              </a>
            </div>}
        </div>}
    </div>;
  // Render guide-specific details
  const renderGuideDetails = () => <div>
      {renderCommonDetails()}
      {/* Attachments */}
      {content.attachments && content.attachments.length > 0 && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Attachments
          </h3>
          <div className="space-y-2">
            {content.attachments.map((attachment: any, index: number) => <div key={index} className="flex items-center p-2.5 bg-gray-50 rounded-md border border-gray-100">
                <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{attachment.name}</span>
                <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150">
                  <DownloadIcon className="w-4 h-4" />
                </button>
              </div>)}
          </div>
        </div>}
      {/* Table of Contents */}
      {content.tableOfContents && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Table of Contents
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {content.tableOfContents.map((item: string, index: number) => <li key={index} className="leading-relaxed">
                  {item}
                </li>)}
            </ul>
          </div>
        </div>}
      {/* Version */}
      {content.version && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Version</h3>
          <div className="flex items-center">
            <ClipboardIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {content.version}
            </span>
          </div>
        </div>}
      {/* Download Count */}
      {content.downloadCount !== undefined && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Downloads
          </h3>
          <div className="flex items-center">
            <DownloadIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {content.downloadCount} downloads
            </span>
          </div>
        </div>}
    </div>;
  const renderToolkitDetails = () => {
    const toolkit = content.toolkit || {};
    return (
      <div>
        {renderCommonDetails()}

        {toolkit.documentUrl && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Toolkit Document</h3>
            <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <FileTextIcon className="w-5 h-5 text-gray-500" />
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-gray-800">
                  {toolkit.fileType ? toolkit.fileType.toUpperCase() : 'Document'}
                </p>
                <p className="text-xs text-gray-500">
                  {toolkit.fileSizeLabel ||
                    (typeof toolkit.fileSizeMb === 'number' && !Number.isNaN(toolkit.fileSizeMb)
                      ? `${toolkit.fileSizeMb} MB`
                      : 'Size unavailable')}
                </p>
              </div>
              <a
                href={toolkit.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        )}

        {toolkit.requirements && toolkit.requirements.length > 0 && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Requirements</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toolkit.requirements.map((requirement, index) => (
                <div key={requirement.id || index} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {requirement.label || 'Requirement'}
                  </dt>
                  <dd className="text-sm text-gray-800">{requirement.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {toolkit.highlights && toolkit.highlights.length > 0 && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Key Highlights</h3>
            <ol className="space-y-3">
              {toolkit.highlights.map((highlight, index) => (
                <li key={highlight.id || index} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                  <CheckCircleIcon className={`w-4 h-4 mt-1 ${highlight.allowMarkComplete ? 'text-green-500' : 'text-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{highlight.title}</p>
                    <p className="text-sm text-gray-600">{highlight.description}</p>
                    {highlight.allowMarkComplete && (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        Mark complete enabled
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {toolkit.toc && toolkit.toc.length > 0 && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Table of Contents</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <ul className="space-y-1 text-sm text-gray-700">
                {toolkit.toc.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="leading-relaxed"
                    style={{ marginLeft: `${((item.level || 1) - 1) * 12}px` }}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {toolkit.attachments && toolkit.attachments.length > 0 && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Attachments</h3>
            <div className="space-y-2">
              {toolkit.attachments.map((attachment, index) => (
                <div key={attachment.id || index} className="flex items-center p-2.5 bg-gray-50 rounded-md border border-gray-100">
                  <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{attachment.name}</p>
                    <p className="text-xs text-gray-500">
                      {[attachment.fileType, attachment.fileSizeMb ? `${attachment.fileSizeMb} MB` : undefined]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(toolkit.version || toolkit.releaseDate) && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Version Information</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              {toolkit.version && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <BadgeIcon className="w-3 h-3 mr-1" />
                  {toolkit.version}
                </span>
              )}
              {toolkit.releaseDate && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  Released {formatDate(toolkit.releaseDate)}
                </span>
              )}
            </div>
          </div>
        )}

        {toolkit.changelogHtml && (
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Changelog</h3>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: toolkit.changelogHtml }}
            />
          </div>
        )}

        {toolkit.authors && toolkit.authors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Authors</h3>
            <div className="space-y-3">
              {toolkit.authors.map((author: any, index: number) => (
                <div key={author.profileId || author.id || index} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                  <UserIcon className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {author.name}{' '}
                      {author.isPrimary && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs border border-blue-200">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[author.role, author.organization].filter(Boolean).join(' • ')}
                    </p>
                    {author.bio && <p className="text-sm text-gray-600 mt-1">{author.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // Render resource-specific details
  const renderResourceDetails = () => <div>
      {renderCommonDetails()}
      {/* File or External Link */}
      {(content.fileUrl || content.externalLink) && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Resource File
          </h3>
          <div className="flex items-center p-2.5 bg-gray-50 rounded-md border border-gray-100">
            <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {content.fileName || 'Resource Document'}
            </span>
            <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150">
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
          {content.externalLink && <div className="mt-3">
              <a href={content.externalLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center">
                <LinkIcon className="w-4 h-4 mr-1" />
                View External Resource
              </a>
            </div>}
        </div>}
      {/* Organization/Partner */}
      {content.organization && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Organization / Partner
          </h3>
          <div className="flex items-center">
            <BuildingIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{content.organization}</span>
          </div>
        </div>}
      {/* Impact Metrics */}
      {content.impactMetrics && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Impact Metrics
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(content.impactMetrics).map(([key, value]) => <div key={key}>
                  <p className="text-xs text-gray-500 mb-1">{key}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
  // Render news-specific details
  const renderNewsDetails = () => <div>
      {renderCommonDetails()}
      {/* Body Content Preview */}
      {content.bodyPreview && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Content Preview
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-48 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed">
              {content.bodyPreview}
            </p>
          </div>
          <button className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors duration-150">
            View Full Content
          </button>
        </div>}
      {/* Source/Publisher */}
      {content.publisher && <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Source / Publisher
          </h3>
          <div className="flex items-center">
            <BuildingIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{content.publisher}</span>
          </div>
        </div>}
      {/* Visibility Window */}
      {content.visibilityWindow && <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Visibility Window
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-700">
                  {formatDate(content.visibilityWindow.start)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-700">
                  {formatDate(content.visibilityWindow.end)}
                </p>
              </div>
            </div>
          </div>
        </div>}
    </div>;
  // Render content details based on type
  const renderContentDetails = () => {
    const contentType = content.type;
    switch (contentType) {
      case 'Article':
        return renderArticleDetails();
      case 'Video':
        return renderVideoDetails();
      case 'Event':
        return renderEventDetails();
      case 'Guide':
        return renderGuideDetails();
      case 'Resource':
        return renderResourceDetails();
      case 'News':
        return renderNewsDetails();
      case 'Tool':
      case 'Toolkit':
        return renderToolkitDetails();
      default:
        return renderCommonDetails();
    }
  };
  // Render review and comments tab using reusable module
  const renderReviewAndComments = () => {
    const userSegment = localStorage.getItem('user_segment');
    
    return (
      <ReviewCommentsModule
        itemId={content.id}
        itemType="Content"
        currentStatus={content.status}
        isDraft={isDraft}
        isPending={isPendingReview}
        isPublished={isPublished}
        isArchived={isArchived}
        isRejected={content.status === 'Rejected'}
        onApprove={onApprove}
        onReject={onReject}
        onSendBack={onSendBack}
        onUnpublish={onUnpublish}
        onArchive={onArchive}
        onFlag={onFlag}
        canApprove={ability.can('publish', 'Content')} // Check publish permission for Approve & Publish button
        canReject={ability.can('approve', 'Content')}
        canSendBack={ability.can('approve', 'Content')}
        canUnpublish={ability.can('unpublish', 'Content')}
        canArchive={ability.can('archive', 'Content')}
        canFlag={userSegment === 'internal'}
        comments={content.comments}
        activityLog={content.activityLog}
        onAddComment={handleAddComment}
        tableName="cnt_contents"
        showToast={showToast}
        onStatusChange={async (newStatus) => {
          // Update local content state if available
          if (content && content.status !== newStatus) {
            content.status = newStatus;
            
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
  // Render author details tab
  const renderAuthorDetails = () => <div className="px-6 lg:px-8">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Author Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BuildingIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Author Details
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Author Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {content.author}
                </p>
              </div>
              {content.authorInfo?.title && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Title/Role</p>
                  <p className="text-sm text-gray-700">
                    {content.authorInfo.title}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                <div className="flex items-center">
                  <MailIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                  <p className="text-sm text-blue-600">
                    {content.authorInfo?.email || 'N/A'}
                  </p>
                </div>
              </div>
              {content.authorInfo?.organization && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Organization</p>
                  <p className="text-sm text-gray-700">
                    {content.authorInfo.organization}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 font-medium transition-colors duration-150">
                View Author Profile
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-4">
              <BarChartIcon className="w-5 h-5 text-purple-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-800">
                Submission Metrics
              </h4>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-gray-500">Total Submissions</p>
                  <p className="text-xs font-medium text-gray-800">
                    {content.authorInfo?.totalSubmissions}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{
                  width: `${Math.min((content.authorInfo?.totalSubmissions || 0) * 5, 100)}%`
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-gray-500">Approval Rate</p>
                  <p className="text-xs font-medium text-gray-800">
                    {content.authorInfo?.approvalRate}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-500 ease-out ${(content.authorInfo?.approvalRate || 0) >= 80 ? 'bg-green-500' : (content.authorInfo?.approvalRate || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                  width: `${content.authorInfo?.approvalRate || 0}%`
                }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Author Bio */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Author Bio</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            {content.authorInfo?.bio}
          </p>
        </div>
      </div>
      {/* Author Profile Image */}
      {content.authorInfo?.profileImage && <div className="mb-8 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Profile Image
          </h3>
          <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200">
            <img src={content.authorInfo.profileImage} alt={`${content.author} profile`} className="h-full w-full object-cover" />
          </div>
        </div>}
      {/* Recent Submissions */}
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
  // Render content insights tab (only for published content)
  const renderContentInsights = () => <div className="px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Views */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center mb-3">
            <EyeIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Views</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {content.engagement?.views || 0}
          </p>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
            <span>+15% from last month</span>
          </div>
        </div>
        {/* Likes */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center mb-3">
            <ThumbsUpIcon className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Likes</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {content.engagement?.likes || 0}
          </p>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
            <span>+8% from last month</span>
          </div>
        </div>
        {/* Comments */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center mb-3">
            <MessageSquareIcon className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Comments</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {content.engagement?.comments || 0}
          </p>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>
      </div>
      {/* Average Read/Watch Time */}
      {content.engagement?.avgTime && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
          <div className="flex items-center mb-3">
            <ClockIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">
              Average {content.type === 'Video' ? 'Watch' : 'Read'} Time
            </h3>
          </div>
          <p className="text-xl font-semibold text-gray-900">
            {content.engagement.avgTime}
          </p>
        </div>}
      {/* Weekly Views Trend */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
        <div className="flex items-center mb-4">
          <BarChartIcon className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">
            Weekly Views Trend
          </h3>
        </div>
        <div className="h-40 flex items-end space-x-2">
          <div className="bg-blue-100 w-1/7 h-1/5 rounded-t"></div>
          <div className="bg-blue-200 w-1/7 h-2/5 rounded-t"></div>
          <div className="bg-blue-300 w-1/7 h-3/5 rounded-t"></div>
          <div className="bg-blue-400 w-1/7 h-1/5 rounded-t"></div>
          <div className="bg-blue-500 w-1/7 h-2/5 rounded-t"></div>
          <div className="bg-blue-600 w-1/7 h-4/5 rounded-t"></div>
          <div className="bg-blue-700 w-1/7 h-5/5 rounded-t"></div>
        </div>
        <div className="mt-2 text-xs text-gray-600 flex justify-between">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
      {/* Top Referrals */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
        <div className="flex items-center mb-4">
          <LinkIcon className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Top Referrals</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Google Search</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{
                width: '65%'
              }}></div>
              </div>
              <span className="text-xs text-gray-500">65%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Direct</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{
                width: '20%'
              }}></div>
              </div>
              <span className="text-xs text-gray-500">20%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Social Media</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{
                width: '15%'
              }}></div>
              </div>
              <span className="text-xs text-gray-500">15%</span>
            </div>
          </div>
        </div>
      </div>
      {/* User Feedback Summary */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
        <div className="flex items-center mb-4">
          <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">User Feedback</h3>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-500' : 'text-gray-300'}`} fill={star <= 4 ? 'currentColor' : 'none'} />)}
          </div>
          <span className="text-lg font-semibold text-gray-900">4.0</span>
          <span className="text-sm text-gray-500 ml-2">(24 ratings)</span>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-sm text-gray-700 italic">
              "Very helpful content, exactly what I was looking for!"
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500">User123</span>
              <div className="flex ml-2">
                {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} className={`w-3 h-3 ${star <= 5 ? 'text-yellow-500' : 'text-gray-300'}`} fill={star <= 5 ? 'currentColor' : 'none'} />)}
              </div>
            </div>
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
                {content.activityLog && content.activityLog.length > 0 ? content.activityLog.map((activity: any, index: number) => <tr key={index}>
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
          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
            Unpublish
          </button>
          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-150">
            <FlagIcon className="h-4 w-4 mr-1.5" />
            Flag for Review
          </button>
          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150">
            <ArchiveIcon className="h-4 w-4 mr-1.5" />
            Archive
          </button>
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
        return <div className="px-6 lg:px-8">{renderContentDetails()}</div>;
      case 'review':
        return renderReviewAndComments();
      case 'author':
        return renderAuthorDetails();
      case 'insights':
        return renderContentInsights();
      default:
        return <div className="px-6 lg:px-8">{renderContentDetails()}</div>;
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
                        {content.title}
                      </h2>
                      <div className="mt-1 flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(content.status)}`}>
                            {content.status}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Published on {formatDate(content.publishedOn)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-700">
                            By: {content.author}
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
                <TabsSimple sections={availableTabs} activeTabIndex={activeTabIndex} onTabChange={setActiveTabIndex} data-id="content-details-tabs" />
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
                        Review Content
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
    </div>;
};