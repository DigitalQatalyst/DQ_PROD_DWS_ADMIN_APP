// KnowledgeHub schema types used by services/hooks

export type KHMediaType = 'Article' | 'Video' | 'Podcast' | 'Report' | 'Tool' | 'Event' | 'Guide';
export type KHStatus = 'Draft' | 'InReview' | 'Scheduled' | 'Published' | 'Archived' | string;
export type KHVisibility = 'Public' | 'Private' | 'Unlisted' | string;

export interface KHMediaBase {
  id: string;
  slug: string | null;
  title: string;
  summary: string | null;
  status: KHStatus;
  visibility: KHVisibility;
  language: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  thumbnail_url: string | null;
  tags: any[] | null; // jsonb array
}

// Flattened row from public.v_media_all
export interface VMediaAll extends KHMediaBase {
  type: KHMediaType | null;
  // type-specific optional columns present in the view
  article_body_html?: string | null;
  article_body_json?: any | null;
  article_byline?: string | null;
  // Note: author_name is from cnt_contents table but may not be in the view
  // If view is updated to include author_name, it will be preferred over article_byline
  author_name?: string | null;
  article_source?: string | null;
  article_announcement_date?: string | null;
  article_document_url?: string | null;

  video_url?: string | null;
  platform?: string | null;
  video_duration_sec?: number | null;
  video_transcript_url?: string | null;

  audio_url?: string | null;
  is_video_episode?: boolean | null;
  episode_no?: number | null;
  audio_duration_sec?: number | null;
  audio_transcript_url?: string | null;

  report_document_url?: string | null;
  report_pages?: number | null;
  report_file_size_mb?: number | null;
  report_highlights?: any | null;
  report_toc?: any | null;

  tool_document_url?: string | null;
  tool_requirements?: string | null;
  tool_file_size_mb?: number | null;

  start_at?: string | null;
  end_at?: string | null;
  venue?: string | null;
  registration_url?: string | null;
  timezone?: string | null;
  event_mode?: string | null;
  event_agenda?: any | null;

  domain?: string | null;
}

export type TaxonomyKind = 'Domain' | 'Stage' | 'Format' | 'Tag' | 'Popularity';

export interface Taxonomy {
  id: string;
  kind: TaxonomyKind;
  label: string;
  key: string;
  description?: string | null;
  archived: boolean;
  position: number;
  allowed_media_types?: any | null;
}

