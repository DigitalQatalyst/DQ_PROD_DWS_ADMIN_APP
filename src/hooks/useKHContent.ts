import { useCallback, useMemo, useState } from 'react';
import type { Content } from '../types';
import type { VMediaAll, KHMediaType } from '../types/knowledgehub';
import { listMedia } from '../services/knowledgehub';

export interface ListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface KHFilters {
  search?: string;
  status?: string;
  type?: KHMediaType | 'All';
  domain?: string;
}

// Map a v_media_all row into the UI's Content card type
function mapVMediaToContent(row: VMediaAll): Content {
  // Check for author_name first (from cnt_contents table), then article_byline (from metadata), then empty string
  // Note: The view may not expose author_name currently, but if it's added or if querying directly, it will be preferred
  // Also check if row has metadata field (if querying directly from cnt_contents)
  const rowWithMetadata = row as any;
  const metadata = rowWithMetadata.metadata || {};
  
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
  
  const author = row.author_name || row.article_byline || parsedMetadata.author_name || '';
  
  // For published content, show published_at; for non-published, show empty string
  // Only show published_at if status is Published
  const publishedOn = row.status === 'Published' && row.published_at 
    ? row.published_at 
    : row.status === 'Published' 
      ? row.created_at || '' 
      : '';
  
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
  
  return {
    id: row.id,
    title: row.title || '',
    type: (row.type as any) || 'Article',
    status: (row.status as any) || 'Draft',
    author: author,
    lastModified: row.updated_at || row.created_at || '',
    content: row.article_body_html || undefined,
    category: row.domain || undefined,
    tags: (row.tags as any) || undefined,
    featuredImage: row.thumbnail_url || undefined,
    publishDate: row.published_at || undefined,
    publishedOn: publishedOn,
    flagCount: undefined,
    flaggedAt: undefined,
    authorInfo: Object.keys(authorInfo).some(key => authorInfo[key as keyof typeof authorInfo] !== undefined) ? authorInfo : undefined,
  };
}

export function useKHContent() {
  const [data, setData] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Structured logging helper (gated by env flag)
  const LOG_CONTENT_FETCH = import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONTENT_LOGGING === 'true';
  const logContentFetch = (stage: string, data: any) => {
    if (!LOG_CONTENT_FETCH) return;
    const logEntry = {
      timestamp: new Date().toISOString(),
      stage,
      environment: import.meta.env.MODE,
      ...data
    };
    console.log(`[CONTENT_FETCH:${stage}]`, logEntry);
  };

  // Returns the mapped list to allow callers to use fresh data immediately
  const list = useCallback(async (filters: KHFilters = {}, _opts: ListOptions = {}): Promise<Content[]> => {
    const fetchId = Math.random().toString(36).substring(7);
    logContentFetch('FETCH_START', {
      fetchId,
      filters,
      options: _opts,
      currentDataLength: data.length
    });
    
    setLoading(true);
    setError(null);
    try {
      const startTime = Date.now();
      const rows = await listMedia({
        search: filters.search,
        status: filters.status,
        type: filters.type,
        domain: filters.domain,
        limit: _opts.pageSize ?? 100,
      });
      const fetchDuration = Date.now() - startTime;
      
      logContentFetch('FETCH_SUCCESS', {
        fetchId,
        rowCount: rows.length,
        fetchDurationMs: fetchDuration,
        sampleIds: rows.slice(0, 5).map(r => r.id)
      });
      
      const mappedData = rows.map(mapVMediaToContent);
      setData(mappedData);
      
      logContentFetch('FETCH_COMPLETE', {
        fetchId,
        mappedCount: mappedData.length,
        dataLength: mappedData.length
      });
      return mappedData;
    } catch (e: any) {
      logContentFetch('FETCH_ERROR', {
        fetchId,
        error: e?.message || String(e),
        stack: e?.stack
      });
      setError(e?.message || 'Failed to load media');
      return [];
    } finally {
      setLoading(false);
    }
  }, [data.length]);

  return useMemo(() => ({ data, loading, error, list }), [data, loading, error, list]);
}
