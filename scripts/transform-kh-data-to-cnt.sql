-- Transformation script to migrate KnowledgeHub data to cnt_contents schema
-- This script transforms data from old KnowledgeHub schema to new cnt_contents schema
--
-- Usage: Run this AFTER loading the old data dump into a temporary schema or database
-- Then run this script to transform the data

SET check_function_bodies = off;

-- Step 0: Verify old tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_items') THEN
        RAISE EXCEPTION 'Table media_items not found. Please load the old data dump first.';
    END IF;
END $$;

-- Step 1: Transform media_items + type tables into cnt_contents
-- This merges all type-specific tables into a single cnt_contents table
INSERT INTO public.cnt_contents (
    id,
    title,
    slug,
    content_type,
    status,
    summary,
    content,
    category,
    tags,
    featured_image_url,
    thumbnail_url,
    published_at,
    content_url,
    duration,
    metadata,
    created_at,
    updated_at
)
SELECT 
    mi.id,
    mi.title,
    mi.slug,
    CASE 
        WHEN a.id IS NOT NULL THEN 'Article'
        WHEN v.id IS NOT NULL THEN 'Video'
        WHEN p.id IS NOT NULL THEN 'Video'  -- Map Podcast to Video
        WHEN r.id IS NOT NULL THEN 'Resource'  -- Map Report to Resource
        WHEN t.id IS NOT NULL THEN 'Resource'  -- Map Tool to Resource
        WHEN e.id IS NOT NULL THEN 'Event'
        ELSE 'Article' -- Default fallback
    END AS content_type,
    COALESCE(mi.status, 'Draft') AS status,
    mi.summary,
    -- Content: article body_html, video/podcast URLs go to content_url
    COALESCE(a.body_html, NULL) AS content,
    -- Category: map from domain field or first taxonomy
    COALESCE(
        mi.domain,
        (SELECT t1.label 
         FROM public.media_taxonomies mt 
         JOIN public.taxonomies t1 ON t1.id = mt.taxonomy_id 
         WHERE mt.media_id = mi.id AND t1.kind = 'Domain' 
         ORDER BY t1.position, t1.label LIMIT 1)
    ) AS category,
    -- Tags: convert jsonb array to text array
    COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(mi.tags)),
        ARRAY[]::text[]
    ) AS tags,
    mi.thumbnail_url AS featured_image_url,
    mi.thumbnail_url,
    mi.published_at,
    -- Content URL: video_url, audio_url, document_url
    COALESCE(
        v.video_url,
        p.audio_url,
        r.document_url,
        t.document_url
    ) AS content_url,
    -- Duration: convert duration_sec to text
    COALESCE(
        NULLIF(v.duration_sec::text, '0'),
        NULLIF(p.duration_sec::text, '0')
    ) AS duration,
    -- Metadata: type-specific fields as jsonb
    jsonb_strip_nulls(
        CASE 
            WHEN a.id IS NOT NULL THEN
                jsonb_build_object(
                    'body_json', a.body_json,
                    'byline', a.byline,
                    'source', a.source,
                    'announcement_date', a.announcement_date,
                    'document_url', a.document_url
                )
            WHEN v.id IS NOT NULL THEN
                jsonb_build_object(
                    'platform', v.platform,
                    'transcript_url', v.transcript_url
                )
            WHEN p.id IS NOT NULL THEN
                jsonb_build_object(
                    'is_video_episode', p.is_video_episode,
                    'episode_no', p.episode_no,
                    'transcript_url', p.transcript_url
                )
            WHEN r.id IS NOT NULL THEN
                jsonb_build_object(
                    'pages', r.pages,
                    'file_size_mb', r.file_size_mb,
                    'highlights', r.highlights,
                    'toc', r.toc
                )
            WHEN t.id IS NOT NULL THEN
                jsonb_build_object(
                    'requirements', t.requirements,
                    'file_size_mb', t.file_size_mb
                )
            WHEN e.id IS NOT NULL THEN
                jsonb_build_object(
                    'start_at', e.start_at,
                    'end_at', e.end_at,
                    'venue', e.venue,
                    'registration_url', e.registration_url,
                    'timezone', e.timezone,
                    'mode', e.mode,
                    'agenda', e.agenda
                )
            ELSE '{}'::jsonb
        END
    ) AS metadata,
    mi.created_at,
    mi.updated_at
FROM public.media_items mi
LEFT JOIN public.articles a ON a.id = mi.id
LEFT JOIN public.videos v ON v.id = mi.id
LEFT JOIN public.podcasts p ON p.id = mi.id
LEFT JOIN public.reports r ON r.id = mi.id
LEFT JOIN public.tools t ON t.id = mi.id
LEFT JOIN public.events e ON e.id = mi.id
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Step 2: Transform taxonomies to new taxonomy system
-- Note: This is a simplified transformation. You may need to adjust based on your taxonomy structure
-- Old: taxonomies (kind, key, label)
-- New: txn_facets (code), txn_facet_values (code, facet_id), txn_facet_value_translations (name, language_code)

-- First, create facets for each taxonomy kind
-- Use WHERE NOT EXISTS instead of ON CONFLICT (no unique constraint on code)
INSERT INTO public.txn_facets (id, code, is_private, created_at, updated_at)
SELECT DISTINCT
    gen_random_uuid() AS id,
    lower(t.kind) AS code,
    false AS is_private,
    now() AS created_at,
    now() AS updated_at
FROM public.taxonomies t
WHERE NOT EXISTS (
    SELECT 1 FROM public.txn_facets f WHERE f.code = lower(t.kind)
);

-- Create facet values for each taxonomy
-- Use WHERE NOT EXISTS instead of ON CONFLICT
INSERT INTO public.txn_facet_values (id, code, facet_id, created_at, updated_at)
SELECT DISTINCT
    gen_random_uuid() AS id,
    lower(t.key) AS code,
    f.id AS facet_id,
    now() AS created_at,
    now() AS updated_at
FROM public.taxonomies t
JOIN public.txn_facets f ON f.code = lower(t.kind)
WHERE NOT EXISTS (
    SELECT 1 FROM public.txn_facet_values fv 
    WHERE fv.code = lower(t.key) AND fv.facet_id = f.id
);

-- Create translations for facet values
-- Use WHERE NOT EXISTS instead of ON CONFLICT
INSERT INTO public.txn_facet_value_translations (id, base_id, language_code, name, created_at, updated_at)
SELECT DISTINCT
    gen_random_uuid() AS id,
    fv.id AS base_id,
    'en' AS language_code,
    t.label AS name,
    now() AS created_at,
    now() AS updated_at
FROM public.taxonomies t
JOIN public.txn_facets f ON f.code = lower(t.kind)
JOIN public.txn_facet_values fv ON fv.code = lower(t.key) AND fv.facet_id = f.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.txn_facet_value_translations fvt 
    WHERE fvt.base_id = fv.id AND fvt.language_code = 'en'
);

-- Step 3: Transform media_taxonomies to cnt_contents_facet_values
INSERT INTO public.cnt_contents_facet_values (content_id, facet_value_id, created_at)
SELECT DISTINCT
    mt.media_id AS content_id,
    fv.id AS facet_value_id,
    now() AS created_at
FROM public.media_taxonomies mt
JOIN public.taxonomies t ON t.id = mt.taxonomy_id
JOIN public.txn_facets f ON f.code = lower(t.kind)
JOIN public.txn_facet_values fv ON fv.code = lower(t.key) AND fv.facet_id = f.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.cnt_contents_facet_values ccfv 
    WHERE ccfv.content_id = mt.media_id AND ccfv.facet_value_id = fv.id
);

-- Step 4: Transform tags from media_items.tags (jsonb) to txn_tags and cnt_contents_tags
-- Extract tags from jsonb and create tag records
WITH tag_values AS (
    SELECT DISTINCT
        jsonb_array_elements_text(mi.tags)::text AS tag_value
    FROM public.media_items mi
    WHERE mi.tags IS NOT NULL AND jsonb_array_length(mi.tags) > 0
)
INSERT INTO public.txn_tags (id, value, created_at, updated_at)
SELECT 
    gen_random_uuid() AS id,
    tag_value,
    now() AS created_at,
    now() AS updated_at
FROM tag_values
WHERE tag_value IS NOT NULL AND tag_value != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.txn_tags tt WHERE tt.value = tag_value
  );

-- Link tags to contents
-- Use WHERE NOT EXISTS instead of ON CONFLICT
INSERT INTO public.cnt_contents_tags (content_id, tag_id, created_at)
SELECT DISTINCT
    mi.id AS content_id,
    tt.id AS tag_id,
    now() AS created_at
FROM public.media_items mi
CROSS JOIN LATERAL jsonb_array_elements_text(mi.tags) AS tag_value
JOIN public.txn_tags tt ON tt.value = tag_value::text
WHERE mi.tags IS NOT NULL AND jsonb_array_length(mi.tags) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.cnt_contents_tags cct 
    WHERE cct.content_id = mi.id AND cct.tag_id = tt.id
  );

-- Step 5: Copy media_assets (structure should be compatible)
-- Use WHERE NOT EXISTS instead of ON CONFLICT
INSERT INTO public.media_assets (
    id,
    media_id,
    storage_path,
    public_url,
    kind,
    mime,
    size_bytes,
    width,
    height,
    duration_sec,
    checksum,
    created_at
)
SELECT 
    id,
    media_id,
    storage_path,
    public_url,
    kind,
    mime,
    size_bytes,
    width,
    height,
    duration_sec,
    checksum,
    created_at
FROM public.media_assets
WHERE NOT EXISTS (
    SELECT 1 FROM public.media_assets ma2 WHERE ma2.id = media_assets.id
);

-- Step 6: Copy media_views (structure should be compatible)
-- Use WHERE NOT EXISTS instead of ON CONFLICT
INSERT INTO public.media_views (
    id,
    media_id,
    viewed_at
)
SELECT 
    id,
    media_id,
    viewed_at
FROM public.media_views
WHERE NOT EXISTS (
    SELECT 1 FROM public.media_views mv2 WHERE mv2.id = media_views.id
);

-- Step 7: Verify data transformation
DO $$
DECLARE
    v_media_count integer;
    v_cnt_count integer;
    v_taxonomy_count integer;
    v_facet_count integer;
BEGIN
    SELECT COUNT(*) INTO v_media_count FROM public.media_items;
    SELECT COUNT(*) INTO v_cnt_count FROM public.cnt_contents;
    SELECT COUNT(*) INTO v_taxonomy_count FROM public.taxonomies;
    SELECT COUNT(*) INTO v_facet_count FROM public.txn_facets;
    
    RAISE NOTICE 'Transformation Summary:';
    RAISE NOTICE '  media_items: %', v_media_count;
    RAISE NOTICE '  cnt_contents: %', v_cnt_count;
    RAISE NOTICE '  taxonomies: %', v_taxonomy_count;
    RAISE NOTICE '  txn_facets: %', v_facet_count;
    
    IF v_cnt_count < v_media_count THEN
        RAISE WARNING 'Some media_items may not have been transformed to cnt_contents';
    END IF;
END $$;

