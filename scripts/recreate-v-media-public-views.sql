-- Recreate v_media_public and v_media_public_grid views that were removed during cleanup
-- These views are required by the frontend catalog

-- v_media_public: Filtered view of published content
CREATE OR REPLACE VIEW public.v_media_public AS
 SELECT 
    id,
    slug,
    title,
    summary,
    status,
    visibility,
    language,
    seo_title,
    seo_description,
    canonical_url,
    published_at,
    created_at,
    updated_at,
    thumbnail_url,
    tags,
    type,
    article_body_html,
    article_body_json,
    article_byline,
    article_source,
    article_announcement_date,
    article_document_url,
    body_html,
    body_json,
    video_url,
    platform,
    video_duration_sec,
    video_transcript_url,
    audio_url,
    is_video_episode,
    episode_no,
    audio_duration_sec,
    audio_transcript_url,
    report_document_url,
    report_pages,
    report_file_size_mb,
    report_highlights,
    report_toc,
    tool_document_url,
    tool_requirements,
    tool_file_size_mb,
    start_at,
    end_at,
    venue,
    registration_url,
    timezone,
    mode,
    agenda,
    domain,
    authors,
    author_slugs
   FROM public.v_media_all
  WHERE status = 'Published' 
    AND visibility = 'Public' 
    AND (published_at IS NULL OR published_at <= now());

-- v_media_public_grid: Simplified grid view for public-facing displays
CREATE OR REPLACE VIEW public.v_media_public_grid AS
 SELECT 
    id,
    title,
    COALESCE(
      NULLIF(summary, ''),
      NULLIF(
        left(
          regexp_replace(
            COALESCE(body_html, ''),
            '<[^>]*>',
            '',
            'g'
          ),
          240
        ),
        ''
      )
    ) AS summary,
    thumbnail_url,
    type,
    tags,
    published_at,
    start_at,
    registration_url,
    COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
   FROM public.v_media_public;

-- Grant permissions
GRANT SELECT ON TABLE public.v_media_public TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.v_media_public_grid TO anon, authenticated, service_role;

-- Add comments
COMMENT ON VIEW public.v_media_public IS 'Filtered view of published content from v_media_all. Shows only Published status, Public visibility, and content with published_at <= now() or NULL.';
COMMENT ON VIEW public.v_media_public_grid IS 'Simplified grid view for public-facing displays. Auto-generates summary from body_html if summary is empty.';

