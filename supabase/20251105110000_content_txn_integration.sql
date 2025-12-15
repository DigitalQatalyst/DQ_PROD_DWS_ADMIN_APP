-- Content Taxonomy Integration with txn_* Schema (Content Management Only)
-- Integrates content management (cnt_contents) with the new taxonomy manager schema (txn_*)
-- This replaces the old taxonomies-based integration and uses the new facet-based system
-- Taxonomies are managed separately in taxonomy manager page (for all entities)
-- This integration only affects content management (cnt_contents table)
-- Other entities (services, businesses, etc.) are unaffected by this migration

SET check_function_bodies = off;

-- 1) Junction table for cnt_contents ↔ txn_facet_values
-- Links content items to specific taxonomy values (facet values)
CREATE TABLE IF NOT EXISTS public.cnt_contents_facet_values (
  content_id uuid NOT NULL,
  facet_value_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  PRIMARY KEY (content_id, facet_value_id)
);

-- Add foreign key constraints after ensuring primary keys exist on referenced tables
DO $$ 
BEGIN
  -- Add foreign key to cnt_contents if constraint doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_facet_values_content_id_fkey'
    AND conrelid = 'public.cnt_contents_facet_values'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contents_pkey' 
    AND conrelid = 'public.cnt_contents'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_facet_values
      ADD CONSTRAINT cnt_contents_facet_values_content_id_fkey 
      FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to txn_facet_values if constraint doesn't exist and primary key exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_facet_values_facet_value_id_fkey'
    AND conrelid = 'public.cnt_contents_facet_values'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'txn_facet_values_pkey' 
    AND conrelid = 'public.txn_facet_values'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_facet_values
      ADD CONSTRAINT cnt_contents_facet_values_facet_value_id_fkey 
      FOREIGN KEY (facet_value_id) REFERENCES public.txn_facet_values(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cnt_contents_facet_values_content_id 
  ON public.cnt_contents_facet_values(content_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_facet_values_facet_value_id 
  ON public.cnt_contents_facet_values(facet_value_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_facet_values_facet_lookup 
  ON public.cnt_contents_facet_values(facet_value_id) 
  WHERE EXISTS (
    SELECT 1 FROM public.txn_facet_values fv 
    WHERE fv.id = cnt_contents_facet_values.facet_value_id
  );

-- 2) Junction table for cnt_contents ↔ txn_tags (optional tagging)
CREATE TABLE IF NOT EXISTS public.cnt_contents_tags (
  content_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  PRIMARY KEY (content_id, tag_id)
);

-- Add foreign key constraints after ensuring primary keys exist on referenced tables
DO $$ 
BEGIN
  -- Add foreign key to cnt_contents if constraint doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_tags_content_id_fkey'
    AND conrelid = 'public.cnt_contents_tags'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contents_pkey' 
    AND conrelid = 'public.cnt_contents'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_tags
      ADD CONSTRAINT cnt_contents_tags_content_id_fkey 
      FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to txn_tags if constraint doesn't exist and primary key exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_tags_tag_id_fkey'
    AND conrelid = 'public.cnt_contents_tags'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'txn_tags_pkey' 
    AND conrelid = 'public.txn_tags'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_tags
      ADD CONSTRAINT cnt_contents_tags_tag_id_fkey 
      FOREIGN KEY (tag_id) REFERENCES public.txn_tags(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cnt_contents_tags_content_id 
  ON public.cnt_contents_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_tags_tag_id 
  ON public.cnt_contents_tags(tag_id);

-- 3) Junction table for cnt_contents ↔ txn_collections (optional collection assignment)
CREATE TABLE IF NOT EXISTS public.cnt_contents_collections (
  content_id uuid NOT NULL,
  collection_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  PRIMARY KEY (content_id, collection_id)
);

-- Add foreign key constraints after ensuring primary keys exist on referenced tables
DO $$ 
BEGIN
  -- Add foreign key to cnt_contents if constraint doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_collections_content_id_fkey'
    AND conrelid = 'public.cnt_contents_collections'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contents_pkey' 
    AND conrelid = 'public.cnt_contents'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_collections
      ADD CONSTRAINT cnt_contents_collections_content_id_fkey 
      FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to txn_collections if constraint doesn't exist and primary key exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cnt_contents_collections_collection_id_fkey'
    AND conrelid = 'public.cnt_contents_collections'::regclass
  ) AND EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'txn_collections_pkey' 
    AND conrelid = 'public.txn_collections'::regclass
  ) THEN
    ALTER TABLE public.cnt_contents_collections
      ADD CONSTRAINT cnt_contents_collections_collection_id_fkey 
      FOREIGN KEY (collection_id) REFERENCES public.txn_collections(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cnt_contents_collections_content_id 
  ON public.cnt_contents_collections(content_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_collections_collection_id 
  ON public.cnt_contents_collections(collection_id);

-- 4) Helper function to get primary domain facet value for content (for backward compatibility)
-- Maps to the old "domain" concept - looks for facet with code 'Domain' or similar
CREATE OR REPLACE FUNCTION public.get_content_domain_facet(_content_id uuid, _language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    -- First try: get from facet value (facet code = 'Domain' or similar)
    (SELECT fvt.name 
     FROM public.cnt_contents_facet_values ccfv
     JOIN public.txn_facet_values fv ON fv.id = ccfv.facet_value_id
     JOIN public.txn_facets f ON f.id = fv.facet_id
     LEFT JOIN public.txn_facet_value_translations fvt 
       ON fvt.base_id = fv.id AND fvt.language_code = _language_code
     WHERE ccfv.content_id = _content_id 
       AND (f.code = 'Domain' OR f.code = 'domain' OR f.code ILIKE '%domain%')
       AND f.is_private = false
     ORDER BY fvt.name NULLS LAST, fv.code
     LIMIT 1),
    -- Fallback: use category column (backward compatibility)
    (SELECT category FROM public.cnt_contents WHERE id = _content_id),
    NULL
  );
$$;

-- 5) Helper function to get all facet values for content (grouped by facet)
CREATE OR REPLACE FUNCTION public.get_content_facet_values(_content_id uuid, _language_code text DEFAULT 'en')
RETURNS TABLE (
  facet_code text,
  facet_name text,
  facet_value_id uuid,
  facet_value_code text,
  facet_value_name text,
  facet_value_position int
)
LANGUAGE sql STABLE AS $$
  SELECT 
    f.code AS facet_code,
    COALESCE(ft.name, f.code) AS facet_name,
    fv.id AS facet_value_id,
    fv.code AS facet_value_code,
    COALESCE(fvt.name, fv.code) AS facet_value_name,
    0 AS facet_value_position -- Can be extended if position is added to txn_facet_values
  FROM public.cnt_contents_facet_values ccfv
  JOIN public.txn_facet_values fv ON fv.id = ccfv.facet_value_id
  JOIN public.txn_facets f ON f.id = fv.facet_id
  LEFT JOIN public.txn_facet_translations ft 
    ON ft.base_id = f.id AND ft.language_code = _language_code
  LEFT JOIN public.txn_facet_value_translations fvt 
    ON fvt.base_id = fv.id AND fvt.language_code = _language_code
  WHERE ccfv.content_id = _content_id
    AND f.is_private = false
  ORDER BY f.code, COALESCE(fvt.name, fv.code);
$$;

-- 6) Helper function to get all tags for content
CREATE OR REPLACE FUNCTION public.get_content_tags(_content_id uuid)
RETURNS TABLE (
  tag_id uuid,
  tag_value text
)
LANGUAGE sql STABLE AS $$
  SELECT 
    t.id AS tag_id,
    t.value AS tag_value
  FROM public.cnt_contents_tags cct
  JOIN public.txn_tags t ON t.id = cct.tag_id
  WHERE cct.content_id = _content_id
  ORDER BY t.value;
$$;

-- 7) Helper function to get all collections for content
CREATE OR REPLACE FUNCTION public.get_content_collections(_content_id uuid, _language_code text DEFAULT 'en')
RETURNS TABLE (
  collection_id uuid,
  collection_name text,
  collection_slug text,
  collection_path text[]
)
LANGUAGE sql STABLE AS $$
  WITH RECURSIVE collection_path AS (
    SELECT 
      c.id,
      c.parent_id,
      COALESCE(ct.name, c.id::text) AS name,
      COALESCE(ct.slug, c.id::text) AS slug,
      ARRAY[COALESCE(ct.name, c.id::text)] AS path,
      1 AS depth
    FROM public.txn_collections c
    LEFT JOIN public.txn_collection_translations ct 
      ON ct.base_id = c.id AND ct.language_code = _language_code
    WHERE c.id IN (
      SELECT collection_id FROM public.cnt_contents_collections 
      WHERE content_id = _content_id
    )
    UNION ALL
    SELECT 
      c.id,
      c.parent_id,
      COALESCE(ct.name, c.id::text) AS name,
      COALESCE(ct.slug, c.id::text) AS slug,
      ARRAY[COALESCE(ct.name, c.id::text)] || cp.path,
      cp.depth + 1
    FROM public.txn_collections c
    LEFT JOIN public.txn_collection_translations ct 
      ON ct.base_id = c.id AND ct.language_code = _language_code
    JOIN collection_path cp ON c.id = cp.parent_id
    WHERE cp.depth < 10 -- Prevent infinite loops
  )
  SELECT DISTINCT
    cp.id AS collection_id,
    cp.name AS collection_name,
    cp.slug AS collection_slug,
    cp.path AS collection_path
  FROM collection_path cp
  WHERE cp.parent_id IS NULL -- Only return root collections
  ORDER BY cp.path;
$$;

-- 8) Helper function to assign/update facet values for content
CREATE OR REPLACE FUNCTION public.set_content_facet_values(
  _content_id uuid,
  _facet_value_ids uuid[],
  _user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Remove existing facet values
  DELETE FROM public.cnt_contents_facet_values WHERE content_id = _content_id;
  
  -- Add new facet values (if any provided)
  IF _facet_value_ids IS NOT NULL AND array_length(_facet_value_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_facet_values (content_id, facet_value_id, created_by)
    SELECT _content_id, unnest(_facet_value_ids), _user_id
    ON CONFLICT (content_id, facet_value_id) DO NOTHING;
  END IF;
END;
$$;

-- 9) Helper function to assign/update tags for content
CREATE OR REPLACE FUNCTION public.set_content_tags(
  _content_id uuid,
  _tag_ids uuid[],
  _user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Remove existing tags
  DELETE FROM public.cnt_contents_tags WHERE content_id = _content_id;
  
  -- Add new tags (if any provided)
  IF _tag_ids IS NOT NULL AND array_length(_tag_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_tags (content_id, tag_id, created_by)
    SELECT _content_id, unnest(_tag_ids), _user_id
    ON CONFLICT (content_id, tag_id) DO NOTHING;
  END IF;
END;
$$;

-- 10) Helper function to assign/update collections for content
CREATE OR REPLACE FUNCTION public.set_content_collections(
  _content_id uuid,
  _collection_ids uuid[],
  _user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Remove existing collections
  DELETE FROM public.cnt_contents_collections WHERE content_id = _content_id;
  
  -- Add new collections (if any provided)
  IF _collection_ids IS NOT NULL AND array_length(_collection_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_collections (content_id, collection_id, created_by)
    SELECT _content_id, unnest(_collection_ids), _user_id
    ON CONFLICT (content_id, collection_id) DO NOTHING;
  END IF;
END;
$$;

-- 11) Update v_media_all view to include facet-derived domain field
CREATE OR REPLACE VIEW public.v_media_all AS
SELECT
  c.id,
  c.slug,
  c.title,
  c.summary,
  c.status,
  'Public'::text AS visibility,
  'en'::text AS language,
  NULL::text AS seo_title,
  NULL::text AS seo_description,
  NULL::text AS canonical_url,
  c.published_at,
  c.created_at,
  c.updated_at,
  c.thumbnail_url,
  to_jsonb(COALESCE(c.tags, ARRAY[]::text[])) AS tags,
  c.content_type AS type,
  CASE WHEN c.content_type = 'Article' THEN c.content ELSE NULL END AS article_body_html,
  CASE WHEN c.content_type = 'Article' THEN c.metadata->'body_json' ELSE NULL END AS article_body_json,
  (c.metadata->>'byline') AS article_byline,
  (c.metadata->>'source') AS article_source,
  NULL::date AS article_announcement_date,
  NULL::text AS article_document_url,
  c.content AS body_html,
  c.metadata->'body_json' AS body_json,
  CASE WHEN c.content_type = 'Video' THEN c.content_url ELSE NULL END AS video_url,
  (c.metadata->>'platform') AS platform,
  NULLIF(c.duration,'')::int AS video_duration_sec,
  (c.metadata->>'transcript_url') AS video_transcript_url,
  -- Resource types: Handle Report, Tool, Podcast as Resource content_type
  -- Database only allows 'Resource' as content_type, use content_subtype or metadata to determine specific type
  -- content_subtype allowed values: 'article', 'video', 'guide', 'resource', 'event', 'news', 'announcement', 'business_insight', 'success_story', 'case_study', 'press_release'
  -- For audio/podcast: check if content_subtype or metadata indicates podcast
  CASE WHEN c.content_type = 'Resource' AND (
    LOWER(c.content_subtype) IN ('podcast', 'audio') OR 
    LOWER(c.metadata->>'subtype') IN ('podcast', 'audio') OR
    c.metadata->>'audio_url' IS NOT NULL
  ) THEN c.content_url ELSE NULL END AS audio_url,
  COALESCE((c.metadata->>'is_video_episode')::boolean, false) AS is_video_episode,
  NULLIF((c.metadata->>'episode_no')::int, 0) AS episode_no,
  NULL::int AS audio_duration_sec,
  (c.metadata->>'transcript_url') AS audio_transcript_url,
  -- Report: check content_subtype or metadata
  CASE WHEN c.content_type = 'Resource' AND (
    LOWER(c.content_subtype) IN ('report', 'document') OR 
    LOWER(c.metadata->>'subtype') IN ('report', 'document') OR
    c.metadata->>'pages' IS NOT NULL
  ) THEN c.content_url ELSE NULL END AS report_document_url,
  NULLIF((c.metadata->>'pages')::int, 0) AS report_pages,
  NULLIF((c.metadata->>'file_size_mb')::numeric, 0) AS report_file_size_mb,
  c.metadata->'highlights' AS report_highlights,
  c.metadata->'toc' AS report_toc,
  -- Tool/Toolkit: check content_subtype or metadata
  CASE WHEN c.content_type = 'Resource' AND (
    LOWER(c.content_subtype) IN ('tool', 'toolkit', 'template') OR 
    LOWER(c.metadata->>'subtype') IN ('tool', 'toolkit', 'template') OR
    c.metadata->>'requirements' IS NOT NULL
  ) THEN c.content_url ELSE NULL END AS tool_document_url,
  (c.metadata->>'requirements') AS tool_requirements,
  NULLIF((c.metadata->>'file_size_mb')::numeric, 0) AS tool_file_size_mb,
  (c.metadata->>'start_at')::timestamptz AS start_at,
  (c.metadata->>'end_at')::timestamptz AS end_at,
  (c.metadata->>'venue') AS venue,
  (c.metadata->>'registration_url') AS registration_url,
  (c.metadata->>'timezone') AS timezone,
  (c.metadata->>'mode') AS event_mode,
  c.metadata->'agenda' AS event_agenda,
  -- Domain: Use facet value first (facet code = 'Domain'), fallback to category column
  COALESCE(
    (SELECT fvt.name 
     FROM public.cnt_contents_facet_values ccfv
     JOIN public.txn_facet_values fv ON fv.id = ccfv.facet_value_id
     JOIN public.txn_facets f ON f.id = fv.facet_id
     LEFT JOIN public.txn_facet_value_translations fvt 
       ON fvt.base_id = fv.id AND fvt.language_code = 'en'
     WHERE ccfv.content_id = c.id 
       AND (f.code = 'Domain' OR f.code = 'domain' OR f.code ILIKE '%domain%')
       AND f.is_private = false
     ORDER BY fvt.name NULLS LAST, fv.code
     LIMIT 1),
    c.category
  ) AS domain,
  NULL::text AS business_stage,
  NULL::text AS format,
  NULL::text AS popularity,
  NULL::text AS legacy_provider_name,
  NULL::text AS legacy_provider_logo_url,
  NULL::text AS image_url,
  NULL::text AS podcast_url,
  NULL::bigint AS file_size_bytes,
  NULL::bigint AS download_count,
  NULL::date AS event_date,
  NULL::text AS event_time,
  NULL::text AS event_location,
  NULL::text AS event_location_details,
  NULL::text AS event_registration_info,
  NULL::jsonb AS authors,
  NULL::jsonb AS author_slugs
FROM public.cnt_contents c;

-- 11b) Update v_media_public view (filtered version of v_media_all)
CREATE OR REPLACE VIEW public.v_media_public AS
SELECT * FROM public.v_media_all
WHERE status = 'Published' AND visibility = 'Public' AND (published_at IS NULL OR published_at <= now());

-- 11c) Update v_media_public_grid view (lean grid version)
CREATE OR REPLACE VIEW public.v_media_public_grid AS
SELECT 
  id, 
  title,
  COALESCE(NULLIF(summary,''), NULLIF(left(regexp_replace(COALESCE(body_html,''), '<[^>]*>', '', 'g'), 240),'')) AS summary,
  thumbnail_url,
  type,
  tags,
  published_at,
  start_at,
  registration_url,
  COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
FROM public.v_media_public;

-- 12) Update create_media_item RPC to optionally accept facet_value_ids, tag_ids, collection_ids
CREATE OR REPLACE FUNCTION public.create_media_item(
  _base jsonb, 
  _type text, 
  _child jsonb, 
  _facet_value_ids uuid[] DEFAULT NULL,
  _tag_ids uuid[] DEFAULT NULL,
  _collection_ids uuid[] DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  _id uuid;
  t text := initcap(lower(coalesce(_type,'')));
  v_slug text := public.normalize_slug(public._jtxt(_base,'slug'));
  v_title text := COALESCE(public._jtxt(_base,'title'), '');
  v_summary text := public._jtxt(_base,'summary');
  v_status text := COALESCE(public._jtxt(_base,'status'), 'Draft');
  v_thumbnail text := public._jtxt(_base,'thumbnail_url');
  v_domain text := public._jtxt(_base,'domain');
  v_published_at timestamptz := (_base->>'published_at')::timestamptz;
  v_tags jsonb := COALESCE(_base->'tags','[]'::jsonb);
  v_content_url text := NULL;
  v_duration text := NULL;
  v_content text := NULL;
  v_metadata jsonb := '{}'::jsonb;
BEGIN
  -- Map child by type into cnt_contents columns and metadata (same as before)
  IF t = 'Article' THEN
    v_content := public._jtxt(_child,'body_html');
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'body_json', _child->'body_json',
      'byline', public._jtxt(_child,'byline'),
      'source', public._jtxt(_child,'source')
    ));
  ELSIF t = 'Video' THEN
    v_content_url := public._jtxt(_child,'video_url');
    v_duration := NULLIF((_child->>'duration_sec')::int,0)::text;
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'platform', public._jtxt(_child,'platform'),
      'transcript_url', public._jtxt(_child,'transcript_url')
    ));
  ELSIF t = 'Podcast' THEN
    v_content_url := public._jtxt(_child,'audio_url');
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'is_video_episode', COALESCE((_child->>'is_video_episode')::boolean, false),
      'episode_no', NULLIF((_child->>'episode_no')::int, 0),
      'transcript_url', public._jtxt(_child,'transcript_url')
    ));
  ELSIF t = 'Report' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'pages', NULLIF((_child->>'pages')::int, 0),
      'file_size_mb', NULLIF((_child->>'file_size_mb')::numeric, 0),
      'highlights', _child->'highlights',
      'toc', _child->'toc'
    ));
  ELSIF t = 'Tool' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'requirements', public._jtxt(_child,'requirements'),
      'file_size_mb', NULLIF((_child->>'file_size_mb')::numeric, 0)
    ));
  ELSIF t = 'Event' THEN
    v_metadata := jsonb_strip_nulls(jsonb_build_object(
      'start_at', (_child->>'start_at')::timestamptz,
      'end_at', (_child->>'end_at')::timestamptz,
      'venue', public._jtxt(_child,'venue'),
      'registration_url', public._jtxt(_child,'registration_url'),
      'timezone', public._jtxt(_child,'timezone'),
      'mode', public._jtxt(_child,'mode'),
      'agenda', _child->'agenda'
    ));
  END IF;

  INSERT INTO public.cnt_contents (
    title, slug, content_type, status, summary, content, category, tags,
    featured_image_url, thumbnail_url, published_at, content_url, duration, metadata
  ) VALUES (
    v_title, v_slug, t, v_status, v_summary, v_content, v_domain,
    COALESCE((SELECT array_agg(x::text) FROM jsonb_array_elements_text(v_tags) AS t(x)), ARRAY[]::text[]),
    v_thumbnail, v_thumbnail, v_published_at, v_content_url, v_duration, v_metadata
  ) RETURNING id INTO _id;

  -- Assign facet values if provided
  IF _facet_value_ids IS NOT NULL AND array_length(_facet_value_ids, 1) > 0 THEN
    PERFORM public.set_content_facet_values(_id, _facet_value_ids, _user_id);
  END IF;

  -- Assign tags if provided
  IF _tag_ids IS NOT NULL AND array_length(_tag_ids, 1) > 0 THEN
    PERFORM public.set_content_tags(_id, _tag_ids, _user_id);
  END IF;

  -- Assign collections if provided
  IF _collection_ids IS NOT NULL AND array_length(_collection_ids, 1) > 0 THEN
    PERFORM public.set_content_collections(_id, _collection_ids, _user_id);
  END IF;

  RETURN _id;
END;
$$;

-- 13) Update update_media_item RPC to optionally accept facet_value_ids, tag_ids, collection_ids
CREATE OR REPLACE FUNCTION public.update_media_item(
  _id uuid, 
  _base jsonb, 
  _type text, 
  _child jsonb, 
  _facet_value_ids uuid[] DEFAULT NULL,
  _tag_ids uuid[] DEFAULT NULL,
  _collection_ids uuid[] DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  t text := initcap(lower(coalesce(_type,'')));
  v_slug text := public.normalize_slug(public._jtxt(_base,'slug'));
  v_published_at timestamptz := (_base->>'published_at')::timestamptz;
  v_thumbnail text := public._jtxt(_base,'thumbnail_url');
  v_domain text := public._jtxt(_base,'domain');
  v_tags jsonb := COALESCE(_base->'tags','[]'::jsonb);
  v_content_url text := NULL;
  v_duration text := NULL;
  v_content text := NULL;
  v_meta jsonb := '{}'::jsonb;
BEGIN
  IF t = 'Article' THEN
    v_content := public._jtxt(_child,'body_html');
    v_meta := jsonb_strip_nulls(jsonb_build_object('body_json', _child->'body_json','byline',public._jtxt(_child,'byline'),'source',public._jtxt(_child,'source')));
  ELSIF t = 'Video' THEN
    v_content_url := public._jtxt(_child,'video_url');
    v_duration := NULLIF((_child->>'duration_sec')::int,0)::text;
    v_meta := jsonb_strip_nulls(jsonb_build_object('platform',public._jtxt(_child,'platform'),'transcript_url',public._jtxt(_child,'transcript_url')));
  ELSIF t = 'Podcast' THEN
    v_content_url := public._jtxt(_child,'audio_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object('is_video_episode',COALESCE((_child->>'is_video_episode')::boolean,false),'episode_no',NULLIF((_child->>'episode_no')::int,0),'transcript_url',public._jtxt(_child,'transcript_url')));
  ELSIF t = 'Report' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object('pages',NULLIF((_child->>'pages')::int,0),'file_size_mb',NULLIF((_child->>'file_size_mb')::numeric,0),'highlights',_child->'highlights','toc',_child->'toc'));
  ELSIF t = 'Tool' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object('requirements',public._jtxt(_child,'requirements'),'file_size_mb',NULLIF((_child->>'file_size_mb')::numeric,0)));
  ELSIF t = 'Event' THEN
    v_meta := jsonb_strip_nulls(jsonb_build_object('start_at',(_child->>'start_at')::timestamptz,'end_at',(_child->>'end_at')::timestamptz,'venue',public._jtxt(_child,'venue'),'registration_url',public._jtxt(_child,'registration_url'),'timezone',public._jtxt(_child,'timezone'),'mode',public._jtxt(_child,'mode'),'agenda',_child->'agenda'));
  END IF;

  UPDATE public.cnt_contents SET
    title = COALESCE(public._jtxt(_base,'title'), title),
    slug = COALESCE(v_slug, slug),
    content_type = COALESCE(t, content_type),
    status = COALESCE(public._jtxt(_base,'status'), status),
    summary = COALESCE(public._jtxt(_base,'summary'), summary),
    content = COALESCE(v_content, content),
    category = COALESCE(v_domain, category),
    tags = COALESCE((SELECT array_agg(x::text) FROM jsonb_array_elements_text(v_tags) AS t(x)), tags),
    featured_image_url = COALESCE(v_thumbnail, featured_image_url),
    thumbnail_url = COALESCE(v_thumbnail, thumbnail_url),
    published_at = COALESCE(v_published_at, published_at),
    content_url = COALESCE(v_content_url, content_url),
    duration = COALESCE(v_duration, duration),
    metadata = COALESCE(NULLIF(v_meta,'{}'::jsonb), '{}'::jsonb)
  WHERE id = _id;

  -- Update facet values if provided (NULL means don't change, empty array means remove all)
  IF _facet_value_ids IS NOT NULL THEN
    PERFORM public.set_content_facet_values(_id, _facet_value_ids, _user_id);
  END IF;

  -- Update tags if provided
  IF _tag_ids IS NOT NULL THEN
    PERFORM public.set_content_tags(_id, _tag_ids, _user_id);
  END IF;

  -- Update collections if provided
  IF _collection_ids IS NOT NULL THEN
    PERFORM public.set_content_collections(_id, _collection_ids, _user_id);
  END IF;

  RETURN _id;
END;
$$;

-- 14) RLS Policies for junction tables
ALTER TABLE public.cnt_contents_facet_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnt_contents_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnt_contents_collections ENABLE ROW LEVEL SECURITY;

-- Public read policies (published content only)
CREATE POLICY "public_read_join_parent_facets" ON public.cnt_contents_facet_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cnt_contents c
      WHERE c.id = cnt_contents_facet_values.content_id
        AND c.status = 'Published'
        AND (c.published_at IS NULL OR c.published_at <= now())
    )
  );

CREATE POLICY "public_read_join_parent_tags" ON public.cnt_contents_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cnt_contents c
      WHERE c.id = cnt_contents_tags.content_id
        AND c.status = 'Published'
        AND (c.published_at IS NULL OR c.published_at <= now())
    )
  );

CREATE POLICY "public_read_join_parent_collections" ON public.cnt_contents_collections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cnt_contents c
      WHERE c.id = cnt_contents_collections.content_id
        AND c.status = 'Published'
        AND (c.published_at IS NULL OR c.published_at <= now())
    )
  );

-- Authenticated read/write policies
CREATE POLICY "authenticated_read_all_facets" ON public.cnt_contents_facet_values
  FOR SELECT USING (public._is_authenticated());

CREATE POLICY "authenticated_write_all_facets" ON public.cnt_contents_facet_values
  USING (public._is_authenticated())
  WITH CHECK (public._is_authenticated());

CREATE POLICY "authenticated_read_all_tags" ON public.cnt_contents_tags
  FOR SELECT USING (public._is_authenticated());

CREATE POLICY "authenticated_write_all_tags" ON public.cnt_contents_tags
  USING (public._is_authenticated())
  WITH CHECK (public._is_authenticated());

CREATE POLICY "authenticated_read_all_collections" ON public.cnt_contents_collections
  FOR SELECT USING (public._is_authenticated());

CREATE POLICY "authenticated_write_all_collections" ON public.cnt_contents_collections
  USING (public._is_authenticated())
  WITH CHECK (public._is_authenticated());

-- 15) Grants
GRANT ALL ON FUNCTION
  public.get_content_domain_facet(uuid, text),
  public.get_content_facet_values(uuid, text),
  public.get_content_tags(uuid),
  public.get_content_collections(uuid, text),
  public.set_content_facet_values(uuid, uuid[], uuid),
  public.set_content_tags(uuid, uuid[], uuid),
  public.set_content_collections(uuid, uuid[], uuid)
TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
  public.cnt_contents_facet_values,
  public.cnt_contents_tags,
  public.cnt_contents_collections
TO authenticated, service_role;

GRANT SELECT ON TABLE 
  public.cnt_contents_facet_values,
  public.cnt_contents_tags,
  public.cnt_contents_collections
TO anon;

-- Note: The updated create_media_item and update_media_item functions maintain backward compatibility
-- They work with or without facet_value_ids, tag_ids, collection_ids parameters
-- Old taxonomy_ids parameter is replaced with facet_value_ids

