-- Recreate v_media_all view that was accidentally removed during cleanup
-- This view is needed by the frontend to query content in KnowledgeHub format

CREATE OR REPLACE VIEW public.v_media_all AS
 SELECT id,
    slug,
    title,
    summary,
    status,
    'Public'::text AS visibility,
    'en'::text AS language,
    NULL::text AS seo_title,
    NULL::text AS seo_description,
    NULL::text AS canonical_url,
    published_at,
    created_at,
    updated_at,
    thumbnail_url,
    to_jsonb(COALESCE(tags, ARRAY[]::text[])) AS tags,
    content_type AS type,
        CASE
            WHEN (content_type = 'Article'::text) THEN content
            ELSE NULL::text
        END AS article_body_html,
        CASE
            WHEN (content_type = 'Article'::text) THEN (metadata -> 'body_json'::text)
            ELSE NULL::jsonb
        END AS article_body_json,
    (metadata ->> 'byline'::text) AS article_byline,
    (metadata ->> 'source'::text) AS article_source,
    NULL::date AS article_announcement_date,
    NULL::text AS article_document_url,
    content AS body_html,
    (metadata -> 'body_json'::text) AS body_json,
        CASE
            WHEN (content_type = 'Video'::text) THEN content_url
            ELSE NULL::text
        END AS video_url,
    (metadata ->> 'platform'::text) AS platform,
    (NULLIF(duration, ''::text))::integer AS video_duration_sec,
    (metadata ->> 'transcript_url'::text) AS video_transcript_url,
        CASE
            WHEN (content_type = 'Video'::text OR (content_type = 'Resource'::text AND metadata->>'is_video_episode' = 'true')) THEN content_url
            ELSE NULL::text
        END AS audio_url,
    COALESCE(((metadata ->> 'is_video_episode'::text))::boolean, false) AS is_video_episode,
    NULLIF(((metadata ->> 'episode_no'::text))::integer, 0) AS episode_no,
    NULL::integer AS audio_duration_sec,
    (metadata ->> 'transcript_url'::text) AS audio_transcript_url,
        CASE
            WHEN (content_type = 'Resource'::text) THEN content_url
            ELSE NULL::text
        END AS report_document_url,
    NULLIF(((metadata ->> 'pages'::text))::integer, 0) AS report_pages,
    NULLIF(((metadata ->> 'file_size_mb'::text))::numeric, 0) AS report_file_size_mb,
    (metadata -> 'highlights'::text) AS report_highlights,
    (metadata -> 'toc'::text) AS report_toc,
        CASE
            WHEN (content_type = 'Resource'::text) THEN content_url
            ELSE NULL::text
        END AS tool_document_url,
    (metadata ->> 'requirements'::text) AS tool_requirements,
    NULLIF(((metadata ->> 'file_size_mb'::text))::numeric, 0) AS tool_file_size_mb,
    (metadata ->> 'start_at'::text) AS start_at,
    (metadata ->> 'end_at'::text) AS end_at,
    (metadata ->> 'venue'::text) AS venue,
    (metadata ->> 'registration_url'::text) AS registration_url,
    (metadata ->> 'timezone'::text) AS timezone,
    (metadata ->> 'mode'::text) AS mode,
    (metadata -> 'agenda'::text) AS agenda,
    COALESCE(( SELECT (fvt.name)::text AS name
           FROM (((public.cnt_contents_facet_values ccfv
             JOIN public.txn_facet_values fv ON ((fv.id = ccfv.facet_value_id)))
             JOIN public.txn_facets f ON ((f.id = fv.facet_id)))
             LEFT JOIN public.txn_facet_value_translations fvt ON (((fvt.base_id = fv.id) AND ((fvt.language_code)::text = 'en'::text))))
          WHERE ((ccfv.content_id = c.id) AND (((f.code)::text = 'Domain'::text) OR ((f.code)::text = 'domain'::text) OR ((f.code)::text ~~* '%domain%'::text)) AND (f.is_private = false))
          ORDER BY fvt.name, fv.code
         LIMIT 1), category) AS domain,
    author_name,
    NULL::text AS format,
    NULL::text AS popularity,
    NULL::jsonb AS authors,
    NULL::text[] AS author_slugs
   FROM public.cnt_contents c;

-- Grant permissions
GRANT SELECT ON TABLE public.v_media_all TO anon, authenticated, service_role;

-- Add comment
COMMENT ON VIEW public.v_media_all IS 'KnowledgeHub-compatible view of all content from cnt_contents table';

