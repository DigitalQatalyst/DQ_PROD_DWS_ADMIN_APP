import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ArchiveIcon, FlagIcon, CalendarIcon, UserIcon, StarIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, DownloadIcon, PlusIcon, BookIcon, VideoIcon, FileTextIcon, NewspaperIcon, CalendarDaysIcon, ThumbsUpIcon, MessageSquareIcon, EditIcon, AlertCircleIcon } from 'lucide-react';
import { ContentDetailsDrawer } from './ContentDetailsDrawer';
import { FlagContentModal } from './FlagContentModal';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SendBackModal } from './SendBackModal';
// Switch from legacy cnt_contents to KnowledgeHub view-backed hook
import { useKHContent } from '../hooks/useKHContent';
import { useAuth } from '../context/AuthContext';
import { Content } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';
import { logContentActivity } from '../lib/auditLog';
import { getSupabaseClient } from '../lib/dbClient';
import { createClient } from '@supabase/supabase-js';

// Get service role client for operations that need to bypass RLS
function getServiceRoleClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Service role key not available, falling back to regular client');
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}


export const ContentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  const { data: contentData, loading, error, list } = useKHContent();
  const [creating, setCreating] = useState(false);
  
  // Map database columns to UI fields
  // Note: contentData from useKHContent is already mapped, but we ensure proper field mapping here
  const mapContentFromDB = (dbContent: any): Content => {
    // Check multiple possible author fields: author_name (from table), author (if already mapped), article_byline (from view metadata)
    // Also check metadata for author details
    const metadata = dbContent.metadata || {};
    
    // Parse metadata if it's a string
    let parsedMetadata: any = {};
    if (typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = {};
      }
    } else {
      parsedMetadata = metadata;
    }
    
    // Prefer already-mapped props from useKHContent (if present)
    const author = dbContent.author || dbContent.author_name || dbContent.article_byline || parsedMetadata.author_name || '';
    
    // Prefer mapped publishedOn; otherwise compute from DB fields
    const publishedOn = (dbContent.publishedOn && String(dbContent.publishedOn).trim() !== '')
      ? dbContent.publishedOn
      : (dbContent.status === 'Published'
          ? (dbContent.published_at || dbContent.created_at || '')
          : '');
    
    // Extract author info from metadata
    const authorInfo: Content['authorInfo'] = {
      email: parsedMetadata.author_email || undefined,
      organization: parsedMetadata.author_org || parsedMetadata.source || undefined,
      bio: parsedMetadata.author_bio || undefined,
      profileImage: parsedMetadata.author_photo_url || undefined,
      title: parsedMetadata.author_title || undefined,
      totalSubmissions: parsedMetadata.totalSubmissions || undefined,
      approvalRate: parsedMetadata.approvalRate || undefined,
    };

    const toolkitMeta = parsedMetadata.toolkit || {};
    const combinedCategories = Array.isArray(toolkitMeta.categories)
      ? toolkitMeta.categories
      : Array.isArray(dbContent.categories)
      ? dbContent.categories
      : dbContent.category
      ? [dbContent.category]
      : [];
    const combinedBusinessStages = Array.isArray(toolkitMeta.businessStages) ? toolkitMeta.businessStages : [];
    const combinedTags = Array.isArray(dbContent.tags) ? dbContent.tags : Array.isArray(toolkitMeta.tags) ? toolkitMeta.tags : [];
    const toolkitDetails: Content['toolkit'] =
      (dbContent.type === 'Tool' || dbContent.type === 'Toolkit')
        ? {
            bodyHtml: dbContent.content || toolkitMeta.bodyHtml || '',
            bodyJson: toolkitMeta.bodyJson || null,
            toc: Array.isArray(toolkitMeta.toc) ? toolkitMeta.toc : [],
            requirements: Array.isArray(toolkitMeta.requirements) ? toolkitMeta.requirements : [],
            highlights: Array.isArray(toolkitMeta.highlights) ? toolkitMeta.highlights : [],
            version: toolkitMeta.version || undefined,
            releaseDate: toolkitMeta.releaseDate || undefined,
            changelogHtml: toolkitMeta.changelogHtml || toolkitMeta.changelog || undefined,
            changelogJson: toolkitMeta.changelogJson || undefined,
            documentUrl: toolkitMeta.documentUrl || dbContent.tool_document_url || dbContent.downloadUrl || undefined,
            fileType: toolkitMeta.fileType || dbContent.tool_file_type || undefined,
            fileSizeMb:
              toolkitMeta.fileSizeMb !== undefined
                ? toolkitMeta.fileSizeMb
                : dbContent.tool_file_size_mb !== undefined
                ? dbContent.tool_file_size_mb
                : null,
            fileSizeLabel:
              toolkitMeta.fileSizeLabel ||
              (dbContent.tool_file_size_mb ? `${dbContent.tool_file_size_mb} MB` : toolkitMeta.fileSizeMb ? `${toolkitMeta.fileSizeMb} MB` : null),
            attachments: Array.isArray(toolkitMeta.attachments) ? toolkitMeta.attachments : [],
            authors: Array.isArray(toolkitMeta.authors) ? toolkitMeta.authors : [],
          }
        : undefined;
    
    return {
      id: dbContent.id,
      title: dbContent.title || '',
      type: dbContent.type || 'Article',
      status: dbContent.status || 'Draft',
      author: author,
      lastModified: dbContent.lastModified || dbContent.updated_at || dbContent.created_at || '',
      content: dbContent.content || dbContent.article_body_html || '',
      category: dbContent.category || dbContent.domain || '',
      tags: combinedTags,
      categories: combinedCategories,
      businessStages: combinedBusinessStages,
      featuredImage: dbContent.featuredImage || dbContent.thumbnail_url || '',
      thumbnail: dbContent.thumbnail || dbContent.thumbnail_url || dbContent.featuredImage || dbContent.featured_image_url || '',
      publishDate: dbContent.publishDate || dbContent.published_at || undefined,
      // Only show publishedOn for published items
      publishedOn: publishedOn,
      engagement: { views: 0, likes: 0, comments: 0 },
      summary: dbContent.summary || toolkitMeta.summary || undefined,
      format: toolkitMeta.format || dbContent.format || undefined,
      description: dbContent.description || dbContent.summary || toolkitMeta.summary || '',
      authorInfo: Object.keys(authorInfo).some(key => authorInfo[key as keyof typeof authorInfo] !== undefined) ? authorInfo : undefined,
      toolkit: toolkitDetails,
    };
  };

  // Use Supabase data directly - RLS will handle filtering
  // Memoize to avoid new object identities on every render (prevents drawer re-open loops)
  const displayContent = React.useMemo(() => contentData.map(mapContentFromDB), [contentData]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Use state to manage the content data
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [contentType, setContentType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [authorFilter, setAuthorFilter] = useState('All');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Structured logging helper (gated by env flag)
  const LOG_CONTENT_FLOW = import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONTENT_LOGGING === 'true';
  const logContentFlow = (stage: string, data: any) => {
    if (!LOG_CONTENT_FLOW) return;
    const logEntry = {
      timestamp: new Date().toISOString(),
      stage,
      environment: import.meta.env.MODE,
      userId: (window as any).__USER_ID__ || 'unknown',
      tenantId: (window as any).__TENANT_ID__ || 'unknown',
      ...data
    };
    console.log(`[CONTENT_VIEW_FLOW:${stage}]`, logEntry);
  };

  // Helper: merge cnt_contents row (with metadata) into an existing Content object
  const mergeContentWithCntRow = (base: Content, row: any): Content => {
    const rawMeta = row?.metadata ?? {};
    let parsedMeta: any = {};
    if (typeof rawMeta === 'string') {
      try {
        parsedMeta = JSON.parse(rawMeta);
      } catch {
        parsedMeta = {};
      }
    } else {
      parsedMeta = rawMeta || {};
    }

    const mergedAuthor = base.author || row?.author_name || parsedMeta.author_name || '';
    const authorInfo: Content['authorInfo'] = {
      email: parsedMeta.author_email || base.authorInfo?.email || undefined,
      organization: parsedMeta.author_org || base.authorInfo?.organization || undefined,
      bio: parsedMeta.author_bio || base.authorInfo?.bio || undefined,
      profileImage: parsedMeta.author_photo_url || base.authorInfo?.profileImage || undefined,
      title: parsedMeta.author_title || base.authorInfo?.title || undefined,
      totalSubmissions: base.authorInfo?.totalSubmissions,
      approvalRate: base.authorInfo?.approvalRate,
    };
    const toolkitMeta = parsedMeta.toolkit || {};
    const mergedCategories = Array.isArray(toolkitMeta.categories)
      ? toolkitMeta.categories
      : base.categories || (base.category ? [base.category] : undefined);
    const mergedBusinessStages = Array.isArray(toolkitMeta.businessStages)
      ? toolkitMeta.businessStages
      : base.businessStages;
    const mergedTags = Array.isArray(toolkitMeta.tags) ? toolkitMeta.tags : base.tags;
    const mergedToolkit: Content['toolkit'] =
      base.type === 'Tool'
        ? {
            bodyHtml: row?.content || toolkitMeta.bodyHtml || base.toolkit?.bodyHtml,
            bodyJson: toolkitMeta.bodyJson || base.toolkit?.bodyJson,
            toc: Array.isArray(toolkitMeta.toc) ? toolkitMeta.toc : base.toolkit?.toc,
            requirements: Array.isArray(toolkitMeta.requirements) ? toolkitMeta.requirements : base.toolkit?.requirements,
            highlights: Array.isArray(toolkitMeta.highlights) ? toolkitMeta.highlights : base.toolkit?.highlights,
            version: toolkitMeta.version || base.toolkit?.version,
            releaseDate: toolkitMeta.releaseDate || base.toolkit?.releaseDate,
            changelogHtml: toolkitMeta.changelogHtml || toolkitMeta.changelog || base.toolkit?.changelogHtml,
            changelogJson: toolkitMeta.changelogJson || base.toolkit?.changelogJson,
            documentUrl: toolkitMeta.documentUrl || base.toolkit?.documentUrl,
            fileType: toolkitMeta.fileType || base.toolkit?.fileType,
            fileSizeMb:
              toolkitMeta.fileSizeMb !== undefined
                ? toolkitMeta.fileSizeMb
                : base.toolkit?.fileSizeMb !== undefined
                ? base.toolkit?.fileSizeMb
                : null,
            fileSizeLabel: toolkitMeta.fileSizeLabel || base.toolkit?.fileSizeLabel,
            attachments: Array.isArray(toolkitMeta.attachments) ? toolkitMeta.attachments : base.toolkit?.attachments,
            authors: Array.isArray(toolkitMeta.authors) ? toolkitMeta.authors : base.toolkit?.authors,
          }
        : base.toolkit;

    const merged: Content = {
      ...base,
      author: mergedAuthor,
      content: row?.content ?? base.content,
      publishDate: row?.published_at ?? base.publishDate,
      publishedOn: base.status === 'Published' ? (row?.published_at || base.publishedOn || '') : '',
      lastModified: row?.updated_at || base.lastModified,
      authorInfo: Object.values(authorInfo).some(v => v !== undefined) ? authorInfo : base.authorInfo,
      summary: parsedMeta.summary || base.summary,
      format: toolkitMeta.format || base.format,
      description: parsedMeta.summary || base.description,
      categories: mergedCategories,
      businessStages: mergedBusinessStages,
      tags: mergedTags,
      toolkit: mergedToolkit,
    };
    return merged;
  };

  // Fetch cnt_contents for a specific id and enrich the selected content
  const enrichSelectedContent = async (contentId: string, current: Content | null) => {
    try {
      const client = getServiceRoleClient() || getSupabaseClient();
      if (!client) return;
      const { data: row, error } = await client
        .from('cnt_contents')
        .select('id, metadata, content, author_name, published_at, updated_at')
        .eq('id', contentId)
        .single();
      if (error) {
        logContentFlow('ENRICH_ERROR', { contentId, error: error.message });
        return;
      }
      if (row && current) {
        const enriched = mergeContentWithCntRow(current, row);
        // Only update if something actually changed to avoid unnecessary churn
        const changed = JSON.stringify({
          a: current.authorInfo, b: enriched.authorInfo, c: current.content, d: enriched.content,
          e: current.publishedOn, f: enriched.publishedOn, g: current.lastModified, h: enriched.lastModified
        });
        let changedHash = 'na';
        try {
          // Best-effort hash for telemetry
          const buf = await (window.crypto?.subtle?.digest?.('SHA-256', new TextEncoder().encode(changed)) as Promise<ArrayBuffer>);
          if (buf) changedHash = Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('');
        } catch {}
        logContentFlow('ENRICH_SUCCESS', { contentId, hasAuthorInfo: !!enriched.authorInfo, changedHash });
        setSelectedContent(enriched);
      }
    } catch (e: any) {
      logContentFlow('ENRICH_EXCEPTION', { contentId, error: e?.message || String(e) });
    }
  };

  // Load content from database on mount and when refresh flag is set
  useEffect(() => {
    const loadContent = async () => {
      logContentFlow('LOAD_START', {
        authLoading,
        currentDataLength: contentData.length,
        hasRefreshFlag: !!sessionStorage.getItem('content-refresh-required')
      });
      
      try {
        // Check if we need to refresh due to a save operation
        const refreshContentId = sessionStorage.getItem('content-refresh-required');
        const refreshTimestamp = sessionStorage.getItem('content-refresh-timestamp');
        
        if (refreshContentId) {
          logContentFlow('REFRESH_REQUIRED', {
            contentId: refreshContentId,
            timestamp: refreshTimestamp
          });
          // Clear the flag immediately to avoid duplicate refreshes
          sessionStorage.removeItem('content-refresh-required');
          sessionStorage.removeItem('content-refresh-timestamp');
        }
        
        logContentFlow('LIST_CALL', { pageSize: 1000 });
        await list({}, { page: 1, pageSize: 1000, sortBy: 'published_at', sortOrder: 'desc' });
        
        logContentFlow('LOAD_COMPLETE', {
          dataLength: contentData.length,
          refreshedContentId: refreshContentId || null
        });
      } catch (err: any) {
        logContentFlow('LOAD_ERROR', {
          error: err?.message || String(err)
        });
        console.error('❌ Failed to load content from database:', err);
      }
    };

    // Only load if auth is ready
    if (!authLoading) {
      loadContent();
    }
  }, [list, authLoading]);

  // Show toast if navigated here after a successful save
  useEffect(() => {
    if (authLoading) return;
    try {
      const raw = sessionStorage.getItem('content-save-success');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.message) {
          setToast({ type: parsed.type === 'error' ? 'error' : 'success', message: parsed.message });
        }
        sessionStorage.removeItem('content-save-success');
      }
    } catch (e) {
      // ignore parse errors
      try { sessionStorage.removeItem('content-save-success'); } catch {}
    }
  }, [authLoading]);
  
  // Also listen for focus events (user returning to tab) to refresh stale data
  useEffect(() => {
    const handleFocus = () => {
      // Check if we have a refresh flag when user returns to the tab
      const refreshContentId = sessionStorage.getItem('content-refresh-required');
      if (refreshContentId && !authLoading) {
        logContentFlow('FOCUS_REFRESH', { contentId: refreshContentId });
        list({}, { page: 1, pageSize: 1000, sortBy: 'published_at', sortOrder: 'desc' });
        sessionStorage.removeItem('content-refresh-required');
        sessionStorage.removeItem('content-refresh-timestamp');
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [list, authLoading]);
  
  // Check URL for deep linking on initial render and when content data changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('contentId');
    const view = urlParams.get('view');
    if (contentId) {
      // Guard: if already showing this item, do not re-select/re-open to avoid render loops
      if (selectedContent?.id === contentId && isDrawerOpen) {
        return;
      }
      // Always find the latest content from the refreshed list
      const content = displayContent.find(c => c.id === contentId);
      if (content) {
        logContentFlow('DEEP_LINK_OPEN', {
          contentId,
          view,
          foundInList: true,
          contentTitle: content.title
        });
        setSelectedContent(content);
        setIsDrawerOpen(true);
        // If view parameter is set to 'full', we'll let the drawer component handle it
        // The drawer already reads this parameter in its own useEffect
      } else {
        logContentFlow('DEEP_LINK_MISSING', {
          contentId,
          availableIds: displayContent.map(c => c.id).slice(0, 10)
        });
      }
    }
  }, [displayContent, selectedContent?.id, isDrawerOpen]); // Re-run when content data changes
  
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load content</h2>
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
  
  // Loading state for content fetch
  if (loading && !error && contentData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content…</p>
        </div>
      </div>
    );
  }

  // Summary data calculation based on current content
  const summaryData = [{
    id: 'draft',
    title: 'Drafts',
    count: displayContent.filter(content => content.status === 'Draft').length,
    icon: FileTextIcon,
    color: 'bg-gray-100 text-gray-600',
    borderColor: 'border-gray-200'
  }, {
    id: 'pending',
    title: 'Pending Review',
    count: displayContent.filter(content => content.status === 'Pending Review').length,
    icon: ClockIcon,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200'
  }, {
    id: 'published',
    title: 'Published',
    count: displayContent.filter(content => content.status === 'Published').length,
    icon: CheckCircleIcon,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-200'
  }, {
    id: 'archived',
    title: 'Archived',
    count: displayContent.filter(content => content.status === 'Archived').length,
    icon: ArchiveIcon,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  }];
  // Filter and sort content
  const filteredContent = displayContent.filter(content => {
    // Filter by type
    if (contentType !== 'All' && content.type !== contentType) return false;
    // Filter by status
    if (statusFilter !== 'All' && content.status !== statusFilter) return false;
    // Filter by category
    if (categoryFilter !== 'All' && content.category !== categoryFilter) return false;
    // Filter by author
    if (authorFilter !== 'All' && content.author !== authorFilter) return false;
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const publishedDate = new Date(content.publishedOn);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      if (publishedDate < startDate || publishedDate > endDate) return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return content.title.toLowerCase().includes(query) || content.author.toLowerCase().includes(query) || content.category.toLowerCase().includes(query) || content.description && content.description.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    // Sort by publication date
    const dateA = new Date(a.publishedOn).getTime();
    const dateB = new Date(b.publishedOn).getTime();
    return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredContent.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredContent.length);
  const paginatedContent = filteredContent.slice(startIndex, endIndex);
  // Get icon for content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'Article':
        return <BookIcon className="w-3.5 h-3.5 mr-1" />;
      case 'Video':
        return <VideoIcon className="w-3.5 h-3.5 mr-1" />;
      case 'Guide':
        return <FileTextIcon className="w-3.5 h-3.5 mr-1" />;
      case 'Resource':
        return <FileTextIcon className="w-3.5 h-3.5 mr-1" />;
      case 'Event':
        return <CalendarDaysIcon className="w-3.5 h-3.5 mr-1" />;
      case 'News':
        return <NewspaperIcon className="w-3.5 h-3.5 mr-1" />;
      default:
        return <FileTextIcon className="w-3.5 h-3.5 mr-1" />;
    }
  };
  // Render content type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Article: 'bg-blue-100 text-blue-800 border border-blue-200',
      Video: 'bg-purple-100 text-purple-800 border border-purple-200',
      Guide: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      Resource: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      Event: 'bg-orange-100 text-orange-800 border border-orange-200',
      News: 'bg-red-100 text-red-800 border border-red-200'
    };
    return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {getContentTypeIcon(type)}
        {type}
      </span>;
  };
  // Render content status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800 border border-gray-200',
      'Pending Review': 'bg-amber-100 text-amber-800 border border-amber-200',
      Published: 'bg-green-100 text-green-800 border border-green-200',
      Archived: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>;
  };
  // Render engagement metrics
  const renderEngagement = (engagement: {
    views: number;
    likes: number;
    comments: number;
  }) => {
    if (engagement.views === 0) return 'No data';
    return <div className="flex items-center">
        <EyeIcon className="w-3.5 h-3.5 text-gray-400 mr-1" />
        <span className="text-[12px] text-gray-700">{engagement.views}</span>
      </div>;
  };
  // Format date for display
  const formatDate = (dateString: string) => {
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
  
  // Truncate author name to prevent UI breaking
  const truncateAuthor = (author: string | undefined | null, maxLength: number = 30): string => {
    if (!author || author.trim() === '') {
      return 'N/A';
    }
    if (author.length <= maxLength) {
      return author;
    }
    return author.substring(0, maxLength - 3) + '...';
  };
  // Handle row click to open drawer
  const handleRowClick = (contentId: string) => {
    const content = displayContent.find(item => item.id === contentId);
    if (content) {
      logContentFlow('ROW_CLICK', {
        contentId,
        contentTitle: content.title,
        foundInList: true
      });
      setSelectedContent(content);
      setIsDrawerOpen(true);
      // Enrich with metadata/content directly from cnt_contents to ensure latest author/body fields
      enrichSelectedContent(contentId, content);
      // Update URL with contentId parameter for deep linking
      const url = new URL(window.location.href);
      url.searchParams.set('contentId', contentId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    } else {
      logContentFlow('ROW_CLICK_MISSING', {
        contentId,
        availableIds: displayContent.map(c => c.id).slice(0, 10)
      });
    }
  };
  
  // Refresh handler for drawer
  // Repro note (pre-fix):
  // 1) Edit item, Save, navigate back to list
  // 2) Immediately open drawer from list
  // 3) Drawer searched stale displayContent before hook state updated → old data
  // Fix: use the fresh list returned from hook; if still hidden by RLS, fetch by id via service role.
  const handleRefreshContent = async () => {
    logContentFlow('DRAWER_REFRESH', {
      contentId: selectedContent?.id
    });
    // Use fresh list returned by hook to avoid stale closure over displayContent
    const updatedList = await list({}, { page: 1, pageSize: 1000, sortBy: 'published_at', sortOrder: 'desc' });
    if (selectedContent) {
      let refreshed = updatedList.find(c => c.id === selectedContent.id);
      if (!refreshed) {
        // Fallback: fetch single item by id using service role (guards against RLS mismatches)
        logContentFlow('FALLBACK_FETCH_BY_ID', { contentId: selectedContent.id });
        try {
          const svc = getServiceRoleClient() || getSupabaseClient();
          if (!svc) {
            logContentFlow('FALLBACK_NO_CLIENT', { reason: 'No Supabase client available' });
          } else {
            const { data: row } = await svc
              .from('v_media_all')
              .select('*')
              .eq('id', selectedContent.id)
              .single();
            if (row) {
              refreshed = mapContentFromDB(row);
              logContentFlow('FALLBACK_FETCH_SUCCESS', { contentId: selectedContent.id });
            } else {
              logContentFlow('FALLBACK_FETCH_EMPTY', { contentId: selectedContent.id });
            }
          }
        } catch (e: any) {
          logContentFlow('FALLBACK_FETCH_ERROR', { contentId: selectedContent.id, error: e?.message || String(e) });
        }
      }
      if (refreshed) {
        setSelectedContent(refreshed);
        // Also enrich with cnt_contents row to ensure author/body metadata are present post-save
        await enrichSelectedContent(refreshed.id, refreshed);
      }
    }
  };
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, contentId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(contentId);
    }
  };
  // Handle add new content button click
  const handleAddNewContent = () => {
    setCreating(true);
    setTimeout(() => navigate('/content-form'), 0);
  };
  // Handle edit content
  const handleEditContent = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation(); // Prevent row click handler from firing
    const content = displayContent.find(c => c.id === contentId) || selectedContent || null;
    navigate(`/content-form/${contentId}`, content ? { state: { content } } : undefined);
  };
  // Handle content actions with audit logging
  const handleApproveContent = async () => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }
      
      console.log('🔑 Using service role client for content approval');

      // Update content status to Published
      const { error } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Published',
          published_at: new Date().toISOString()
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      // Log activity
      await logContentActivity('approved', selectedContent.id, {
        previous_status: selectedContent.status,
        new_status: 'Published'
      });

      await logContentActivity('published', selectedContent.id, {
        published_at: new Date().toISOString()
      });

      setToast({ type: 'success', message: `Content "${selectedContent.title}" approved and published successfully!` });
      setShowApproveModal(false);
      setIsDrawerOpen(false);
      
      // Refresh content list
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
    } catch (error) {
      console.error('❌ Failed to approve content:', error);
      setToast({ type: 'error', message: 'Failed to approve content. Please try again.' });
    }
  };

  const handleRejectContent = async (reason: string) => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }
      
      console.log('🔑 Using service role client for content rejection');

      // Update content status to Rejected
      const { error } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Rejected'
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      // Log activity
      await logContentActivity('rejected', selectedContent.id, {
        previous_status: selectedContent.status,
        rejection_reason: reason
      });

      setToast({ type: 'success', message: `Content "${selectedContent.title}" rejected successfully!` });
      setShowRejectModal(false);
      setIsDrawerOpen(false);
      
      // Refresh content list
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
    } catch (error) {
      console.error('❌ Failed to reject content:', error);
      setToast({ type: 'error', message: 'Failed to reject content. Please try again.' });
    }
  };

  const handleSendBackContent = async (reason: string, comments: string) => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }

      // Update content status
      const { error } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Draft'
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      // Log activity
      await logContentActivity('sent_back', selectedContent.id, {
        previous_status: selectedContent.status,
        reason,
        comments
      });

      // Also add a comment to the review system if comments are provided
      if (comments && comments.trim()) {
        try {
          const commentSupabase = getServiceRoleClient() || getSupabaseClient();
          if (commentSupabase) {
            // Get or create review cycle
            const { data: cycleData } = await commentSupabase
              .from('wf_review_cycles')
              .select('id')
              .eq('content_id', selectedContent.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            let reviewCycleId = cycleData?.id;
            if (!reviewCycleId) {
              const { data: newCycle } = await commentSupabase
                .from('wf_review_cycles')
                .insert({
                  content_id: selectedContent.id,
                  status: 'Draft',
                  submitted_by_name: 'System',
                  cycle_number: 1,
                  submitted_by: '00000000-0000-0000-0000-000000000000'
                })
                .select('id')
                .single();
              reviewCycleId = newCycle?.id;
            }

            // Add the send back comment
            if (reviewCycleId) {
              await commentSupabase
                .from('wf_review_comments')
                .insert({
                  review_cycle_id: reviewCycleId,
                  content_id: selectedContent.id,
                  author_id: localStorage.getItem('user_id') || '00000000-0000-0000-0000-000000000000',
                  author_name: localStorage.getItem('azure_user_info') ? JSON.parse(localStorage.getItem('azure_user_info') || '{}').name : 'Unknown',
                  author_role: localStorage.getItem('user_role') || 'unknown',
                  comment_text: `Send back reason: ${reason}. Comments: ${comments}`
                });
            }
          }
        } catch (commentError) {
          console.warn('Failed to add send back comment:', commentError);
        }
      }

      setToast({ type: 'success', message: `Content "${selectedContent.title}" sent back for revisions!` });
      setShowSendBackModal(false);
      setIsDrawerOpen(false);
      
      // Refresh content list
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
    } catch (error) {
      console.error('❌ Failed to send back content:', error);
      setToast({ type: 'error', message: 'Failed to send back content. Please try again.' });
    }
  };

  const handleArchiveContent = async () => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }

      console.log('📦 Archiving content:', selectedContent.id, 'Current status:', selectedContent.status);

      // Update content status to Archived
      const { error, data: updatedData } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Archived'
        })
        .eq('id', selectedContent.id)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Content archived in DB:', updatedData);

      // Log activity
      await logContentActivity('archived', selectedContent.id, {
        previous_status: selectedContent.status
      });

      // Close drawer and clear selected content FIRST
      setIsDrawerOpen(false);
      setSelectedContent(null);
      
      // Clear URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('contentId');
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
      
      // Refresh content list to get updated data
      console.log('🔄 Refreshing content list...');
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
      console.log('✅ List refresh complete');

      setToast({ type: 'success', message: `Content "${selectedContent.title}" archived successfully!` });
    } catch (error) {
      console.error('❌ Failed to archive content:', error);
      setToast({ type: 'error', message: 'Failed to archive content. Please try again.' });
    }
  };

  const handleUnpublishContent = async () => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }

      // Update content status
      const { error } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Draft'
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      // Log activity
      await logContentActivity('unpublished', selectedContent.id, {
        previous_status: selectedContent.status
      });

      setToast({ type: 'success', message: `Content "${selectedContent.title}" unpublished successfully!` });
      
      // Close drawer and clear selected content
      setIsDrawerOpen(false);
      setSelectedContent(null);
      
      // Clear URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('contentId');
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
      
      // Refresh content list to get updated data
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
    } catch (error) {
      console.error('❌ Failed to unpublish content:', error);
      setToast({ type: 'error', message: 'Failed to unpublish content. Please try again.' });
    }
  };

  const handleFlagContent = async (reason: string) => {
    if (!selectedContent) return;

    try {
      // Use service role client to bypass RLS for status updates
      const supabase = getServiceRoleClient() || getSupabaseClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Database connection unavailable' });
        return;
      }

      // Update content status to Pending Review, keep published_at for audit
      const { error: updateError } = await supabase
        .from('cnt_contents')
        .update({ 
          status: 'Pending Review',
          flagged_at: new Date().toISOString()
        })
        .eq('id', selectedContent.id);

      if (updateError) throw updateError;

      // Increment flag count using RPC function
      const { error: flagError } = await supabase
        .rpc('increment_flag_count', { content_id: selectedContent.id });

      if (flagError) {
        console.warn('⚠️ Failed to increment flag count:', flagError);
        // Don't throw - flagging still successful without count increment
      }

      // Log activity with reason
      await logContentActivity('flagged', selectedContent.id, {
        previous_status: selectedContent.status,
        new_status: 'Pending Review',
        reason: reason
      });

      setToast({ type: 'success', message: `Content flagged for review successfully!` });
      setShowFlagModal(false);
      setIsDrawerOpen(false);
      
      // Refresh content list to get updated data
      await list({}, { page: 1, pageSize: 1000, sortBy: 'created_at', sortOrder: 'desc' });
    } catch (error) {
      console.error('❌ Failed to flag content:', error);
      setToast({ type: 'error', message: 'Failed to flag content. Please try again.' });
    }
  };
  // Handle drawer close
  const handleDrawerClose = () => {
    // Clear URL parameters first to prevent deep-link effect from re-opening
    const url = new URL(window.location.href);
    url.searchParams.delete('contentId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
    // Close and clear selected content to avoid unnecessary prop churn
    setIsDrawerOpen(false);
    setSelectedContent(null);
  };
  // Get unique categories and authors for filters
  const uniqueCategories = Array.from(new Set(displayContent.map(content => content.category)));
  const uniqueAuthors = Array.from(new Set(displayContent.map(content => content.author)));
  const uniqueTypes = Array.from(new Set(displayContent.map(content => content.type)));
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
    setContentType('All');
    setStatusFilter('All');
    setCategoryFilter('All');
    setAuthorFilter('All');
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
              Content Management
            </h1>
            <div className="relative group hidden sm:block">
              <InfoIcon className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute left-0 top-full mt-2 w-72 bg-white p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <p className="text-sm text-gray-700">
                  View, review, and manage all content across the platform —
                  including articles, resources, and media assets.
                </p>
              </div>
            </div>
          </div>
          {/* Add button in the header */}
          <Can I="create" a="Content">
            <button
              className={`px-4 py-2 rounded-md shadow-sm flex items-center justify-center text-sm font-medium hidden sm:flex ${creating ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              onClick={handleAddNewContent}
              disabled={creating}
            >
              {creating ? (
                <>
                  <span className="inline-block mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opening…
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Content
                </>
              )}
            </button>
          </Can>
        </div>
        <p className="text-sm text-gray-500 text-center sm:text-left">
          View, review, and manage all content across the platform — including
          articles, resources, and media assets.
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {summaryData.map(item => {
          const statusMap: Record<string, string> = {
            'draft': 'Draft',
            'pending': 'Pending Review',
            'published': 'Published',
            'archived': 'Archived'
          };
          const isActive = statusFilter === statusMap[item.id];
          return <div 
            key={item.id} 
            onClick={() => setStatusFilter(statusMap[item.id] || 'All')}
            className={`rounded-xl shadow-sm border bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer ${
              isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-[13px] text-gray-600 font-medium">
                  {item.title}
                </h3>
                <p className={`text-lg sm:text-xl font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {item.count}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-500">+8%</span> from last week
                </p>
              </div>
            </div>
          </div>;
        })}
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
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs" placeholder="Search content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {/* Filter Chips */}
            <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
              <div className="min-w-[140px] relative">
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={contentType} onChange={e => setContentType(e.target.value)}>
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
                <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
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
              {(contentType !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || authorFilter !== 'All' || dateRange.startDate || dateRange.endDate || searchQuery) && <div className="flex-shrink-0">
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
      {/* Content Table - Desktop and Tablet View */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Content</h2>
            {filteredContent.length > 0 && <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                Showing {startIndex + 1}-{endIndex} of {filteredContent.length}{' '}
                items
              </p>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider hidden lg:table-cell">
                  Engagement
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Published On
                </th>
                <th scope="col" className="relative px-4 py-3 w-16">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedContent.length === 0 ? <tr>
                  <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                    No content found
                  </td>
                </tr> : paginatedContent.map(content => <tr key={content.id} onClick={() => handleRowClick(content.id)} onKeyDown={e => handleRowKeyDown(e, content.id)} tabIndex={0} role="button" className="cursor-pointer hover:bg-gray-50 transition-colors duration-150" aria-label={`View details for ${content.title}`}>
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                      {content.title}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderType(content.type)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {content.category}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      <span className="truncate block max-w-[150px]" title={content.author || undefined}>
                        {truncateAuthor(content.author, 30)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderStatus(content.status)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 hidden lg:table-cell">
                      {renderEngagement(content.engagement)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {formatDate(content.publishedOn)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                      <div className="flex items-center justify-end space-x-2">
                        <Can I="update" a="Content">
                          <button onClick={e => handleEditContent(e, content.id)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" aria-label="Edit content">
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
      {/* Content Mobile Card View */}
      <div className="md:hidden space-y-3 mt-2">
        {paginatedContent.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">No content found</p>
          </div> : paginatedContent.map(content => <div key={content.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200" onClick={() => handleRowClick(content.id)} onKeyDown={e => handleRowKeyDown(e, content.id)} tabIndex={0} role="button" aria-label={`View details for ${content.title}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
                  {content.title}
                </h3>
                {renderStatus(content.status)}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">Type:</span>
                  {renderType(content.type)}
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>{' '}
                  <span className="font-medium">{content.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">Author:</span>{' '}
                  <span className="font-medium text-gray-700 truncate max-w-[120px] inline-block align-bottom" title={content.author || undefined}>
                    {truncateAuthor(content.author, 25)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Published:</span>{' '}
                  <span className="font-medium">
                    {formatDate(content.publishedOn)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex items-center">
                  {content.engagement.views > 0 && <div className="flex items-center mr-2">
                      <EyeIcon className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-[11px] text-gray-700">
                        {content.engagement.views}
                      </span>
                    </div>}
                </div>
                <div className="flex space-x-3">
                  <Can I="update" a="Content">
                    <button onClick={e => {
                e.stopPropagation();
                handleEditContent(e, content.id);
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
      {filteredContent.length > 0 && <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
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
              Showing {startIndex + 1}-{endIndex} of {filteredContent.length}
            </div>
          </div>
        </div>}
      {/* Empty State */}
      {filteredContent.length === 0 && <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
          <div className="mx-auto max-w-md">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
              <FilterIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No content found for this filter
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
      <Can I="create" a="Content">
        <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
          <button
            className={`rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 ${creating ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            aria-label="Add new content"
            onClick={handleAddNewContent}
            disabled={creating}
          >
            {creating ? (
              <span className="inline-block h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </Can>
      {/* Content Details Drawer */}
      {selectedContent && <ContentDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={handleDrawerClose} 
        content={selectedContent} 
        onApprove={() => setShowApproveModal(true)} 
        onReject={() => setShowRejectModal(true)} 
        onSendBack={() => setShowSendBackModal(true)} 
        onArchive={handleArchiveContent} 
        onUnpublish={handleUnpublishContent} 
        onFlag={() => setShowFlagModal(true)} 
        showToast={(message, type) => setToast({ message, type })} 
        onRefresh={handleRefreshContent}
      />}
      {/* Action Modals */}
      {selectedContent && <>
          <ApproveModal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} onConfirm={handleApproveContent} listing={selectedContent} />
          <RejectModal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={handleRejectContent} listing={selectedContent} />
          <SendBackModal isOpen={showSendBackModal} onClose={() => setShowSendBackModal(false)} onConfirm={handleSendBackContent} listing={selectedContent} />
          <FlagContentModal isOpen={showFlagModal} onClose={() => setShowFlagModal(false)} onConfirm={handleFlagContent} contentTitle={selectedContent.title} />
        </>}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>;
};
