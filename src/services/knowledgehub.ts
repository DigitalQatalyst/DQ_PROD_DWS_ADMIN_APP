import { getSupabaseClient, getSupabaseClient2, getServiceRoleClient2 } from '../lib/dbClient';
import { createClient } from '@supabase/supabase-js';
import type { VMediaAll, KHMediaType } from '../types/knowledgehub';

// Get service role client for read operations that need to bypass RLS
// This allows all authenticated users to view content regardless of segment
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

const MEDIA_TYPE_CANONICAL_MAP: Record<string, KHMediaType> = {
  article: 'Article',
  articles: 'Article',
  news: 'Article',
  guide: 'Article',
  guides: 'Article',
  video: 'Video',
  videos: 'Video',
  podcast: 'Podcast',
  podcasts: 'Podcast',
  report: 'Report',
  reports: 'Report',
  tool: 'Tool',
  tools: 'Tool',
  toolkit: 'Tool',
  toolkits: 'Tool',
  event: 'Event',
  events: 'Event',
};

const MEDIA_TYPE_GUARD_DETAIL =
  'Allowed media types: Article, Video, Podcast, Report, Tool, Event.';

function normalizeMediaType(type: string | null | undefined): KHMediaType {
  const key = (type ?? '').trim().toLowerCase();
  if (!key) return 'Article';
  const canonical = MEDIA_TYPE_CANONICAL_MAP[key];
  if (!canonical) {
    throw new Error(`Unsupported media type: ${type ?? '(empty)'}. ${MEDIA_TYPE_GUARD_DETAIL}`);
  }
  return canonical;
}

const normalizeArrayField = (value: any) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

export async function createMedia(base: Record<string, any>, type: KHMediaType, child: Record<string, any>): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');
  const canonicalType = normalizeMediaType(type);
  // Normalize array-like fields to avoid sending scalars (Postgres jsonb expects arrays)
  const normalizeBase = (b: Record<string, any>) => {
    if (!b || typeof b !== 'object') return b;
    return {
      ...b,
      // ensure tags/categories/stages are always arrays (even if empty)
      tags: normalizeArrayField(b.tags),
      categories: normalizeArrayField(b.categories),
      business_stage: normalizeArrayField(b.business_stage),
    };
  };

  const normalizedBase = normalizeBase(base);

  // Explicitly pass all parameters to disambiguate between function overloads
  const { data, error } = await supabase.rpc('create_media_item', {
    _base: normalizedBase,
    _type: canonicalType,
    _child: child,
    _facet_value_ids: null,
    _tag_ids: null,
    _collection_ids: null,
    _user_id: null,
  });
  if (error) throw error;
  return data as string; // returns id
}

export async function updateMedia(id: string, base: Record<string, any>, type: KHMediaType, child: Record<string, any>): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');
  const canonicalType = normalizeMediaType(type);
  const normalizeBase = (b: Record<string, any>) => {
    if (!b || typeof b !== 'object') return b;
    return {
      ...b,
      tags: normalizeArrayField(b.tags),
      categories: normalizeArrayField(b.categories),
      business_stage: normalizeArrayField(b.business_stage),
    };
  };

  const normalizedBase = normalizeBase(base);

  // Explicitly pass all parameters to disambiguate between function overloads
  const { data, error } = await supabase.rpc('update_media_item', {
    _id: id,
    _base: normalizedBase,
    _type: canonicalType,
    _child: child,
    _facet_value_ids: null,
    _tag_ids: null,
    _collection_ids: null,
    _user_id: null,
  });
  if (error) throw error;
  return data as string;
}

export function parseDurationToSeconds(s?: string): number | null {
  if (!s) return null;
  const t = String(s).trim();
  if (!t) return null;
  const parts = t.split(':').map((n) => parseInt(n, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export interface ListMediaFilters {
  search?: string;
  status?: string;
  type?: KHMediaType | 'All';
  domain?: string;
  limit?: number;
}

export async function listMedia(filters: ListMediaFilters = {}): Promise<VMediaAll[]> {
  // Use service role client to bypass RLS - allows all authenticated users to view content
  const supabase = getServiceRoleClient() || getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');

  // Query v_media_all view - it includes article_byline from metadata
  // For author_name, we'll need to query cnt_contents separately or update the view
  let query = supabase.from('v_media_all').select('*');

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'All') {
    query = query.eq('type', filters.type);
  }

  if (filters.domain) {
    query = query.eq('domain', filters.domain);
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    query = query.or(`title.ilike.${searchPattern},summary.ilike.${searchPattern}`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  // Order by created_at DESC (latest first) by default
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Fetch metadata from cnt_contents for all items to ensure we have author metadata
  if (data && data.length > 0) {
    const ids = data.map(row => row.id);
    const { data: metadataRows, error: metadataError } = await supabase
      .from('cnt_contents')
      .select('id, metadata, author_name')
      .in('id', ids);

    if (!metadataError && metadataRows) {
      // Merge metadata into the results
      const metadataMap = new Map(metadataRows.map(row => [row.id, { metadata: row.metadata, author_name: row.author_name }]));
      return data.map(row => {
        const metadataData = metadataMap.get(row.id);
        if (metadataData) {
          return {
            ...row,
            metadata: metadataData.metadata,
            author_name: metadataData.author_name || row.author_name,
          } as VMediaAll;
        }
        return row;
      }) as VMediaAll[];
    }
  }

  return (data || []) as VMediaAll[];
}

export interface ListGuidesFilters {
  search?: string;
  status?: string;
  domain?: string;
  limit?: number;
}

export async function listGuides(filters: ListGuidesFilters = {}): Promise<any[]> {
  const supabase = getServiceRoleClient2() || getSupabaseClient2();
  if (!supabase) throw new Error('Secondary Supabase client not available');

  let query = supabase.from('guides').select('*');

  if (filters.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  if (filters.domain && filters.domain !== 'All') {
    query = query.eq('domain', filters.domain);
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    query = query.or(`title.ilike.${searchPattern},summary.ilike.${searchPattern}`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('last_updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(guide => ({
    ...guide,
    type: 'Guide', // Canonical type for UI
  }));
}

export async function getGuideById(id: string): Promise<any | null> {
  const supabase = getServiceRoleClient2() || getSupabaseClient2();
  if (!supabase) throw new Error('Secondary Supabase client not available');

  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return {
    ...data,
    type: 'Guide',
  };
}

export async function checkSlugExists(slug: string, isGuide: boolean = false): Promise<boolean> {
  if (!slug) return false;

  if (isGuide) {
    const supabase2 = getServiceRoleClient2() || getSupabaseClient2();
    if (!supabase2) return false;
    const { data, error } = await supabase2
      .from('guides')
      .select('id')
      .eq('slug', slug)
      .limit(1);
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');

  const { data, error } = await supabase
    .from('cnt_contents')
    .select('id')
    .eq('slug', slug)
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

