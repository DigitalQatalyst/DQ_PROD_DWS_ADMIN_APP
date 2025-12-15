-- Taxonomy Integration for cnt_contents (Content Management Only)
-- Adds full taxonomy support for content items while maintaining backward compatibility with category field
-- Taxonomies are managed separately in taxonomy manager page (for all entities)
-- This integration only affects content management (cnt_contents table)
-- Other entities (services, businesses, etc.) are unaffected by this migration

SET check_function_bodies = off;

-- 1) Junction table for cnt_contents ↔ taxonomies
CREATE TABLE IF NOT EXISTS public.cnt_contents_taxonomies (
  content_id uuid NOT NULL REFERENCES public.cnt_contents(id) ON DELETE CASCADE,
  taxonomy_id uuid NOT NULL REFERENCES public.taxonomies(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, taxonomy_id)
);

CREATE INDEX IF NOT EXISTS idx_cnt_contents_taxonomies_content_id ON public.cnt_contents_taxonomies(content_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_taxonomies_taxonomy_id ON public.cnt_contents_taxonomies(taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_cnt_contents_taxonomies_kind ON public.cnt_contents_taxonomies(taxonomy_id) WHERE EXISTS (
  SELECT 1 FROM public.taxonomies t WHERE t.id = taxonomy_id
);

-- 2) Helper function to get primary domain for content (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_content_domain(_content_id uuid)
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    -- First try: get from taxonomy (Domain kind)
    (SELECT t.label 
     FROM public.cnt_contents_taxonomies ct
     JOIN public.taxonomies t ON t.id = ct.taxonomy_id
     WHERE ct.content_id = _content_id 
       AND t.kind = 'Domain'
       AND t.archived = false
     ORDER BY t.position, t.label
     LIMIT 1),
    -- Fallback: use category column (backward compatibility)
    (SELECT category FROM public.cnt_contents WHERE id = _content_id),
    NULL
  );
$$;

-- 3) Helper function to get all taxonomies for content (grouped by kind)
CREATE OR REPLACE FUNCTION public.get_content_taxonomies(_content_id uuid)
RETURNS TABLE (
  kind text,
  taxonomy_id uuid,
  label text,
  key text,
  position int
)
LANGUAGE sql STABLE AS $$
  SELECT 
    t.kind,
    t.id AS taxonomy_id,
    t.label,
    t.key,
    t.position
  FROM public.cnt_contents_taxonomies ct
  JOIN public.taxonomies t ON t.id = ct.taxonomy_id
  WHERE ct.content_id = _content_id
    AND t.archived = false
  ORDER BY t.kind, t.position, t.label;
$$;

-- 4) Helper function to assign/update taxonomies for content
CREATE OR REPLACE FUNCTION public.set_content_taxonomies(
  _content_id uuid,
  _taxonomy_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Remove existing taxonomies
  DELETE FROM public.cnt_contents_taxonomies WHERE content_id = _content_id;
  
  -- Add new taxonomies (if any provided)
  IF _taxonomy_ids IS NOT NULL AND array_length(_taxonomy_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_taxonomies (content_id, taxonomy_id)
    SELECT _content_id, unnest(_taxonomy_ids)
    ON CONFLICT (content_id, taxonomy_id) DO NOTHING;
  END IF;
END;
$$;

-- 5) Update v_media_all view to include taxonomy-derived fields
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
  CASE WHEN c.content_type = 'Podcast' THEN c.content_url ELSE NULL END AS audio_url,
  COALESCE((c.metadata->>'is_video_episode')::boolean, false) AS is_video_episode,
  NULLIF((c.metadata->>'episode_no')::int, 0) AS episode_no,
  NULL::int AS audio_duration_sec,
  (c.metadata->>'transcript_url') AS audio_transcript_url,
  CASE WHEN c.content_type = 'Report' THEN c.content_url ELSE NULL END AS report_document_url,
  NULLIF((c.metadata->>'pages')::int, 0) AS report_pages,
  NULLIF((c.metadata->>'file_size_mb')::numeric, 0) AS report_file_size_mb,
  c.metadata->'highlights' AS report_highlights,
  c.metadata->'toc' AS report_toc,
  CASE WHEN c.content_type IN ('Tool','Toolkit') THEN c.content_url ELSE NULL END AS tool_document_url,
  (c.metadata->>'requirements') AS tool_requirements,
  NULLIF((c.metadata->>'file_size_mb')::numeric, 0) AS tool_file_size_mb,
  (c.metadata->>'start_at')::timestamptz AS start_at,
  (c.metadata->>'end_at')::timestamptz AS end_at,
  (c.metadata->>'venue') AS venue,
  (c.metadata->>'registration_url') AS registration_url,
  (c.metadata->>'timezone') AS timezone,
  (c.metadata->>'mode') AS event_mode,
  c.metadata->'agenda' AS event_agenda,
  -- Domain: Use taxonomy first, fallback to category column
  COALESCE(
    (SELECT t.label 
     FROM public.cnt_contents_taxonomies ct
     JOIN public.taxonomies t ON t.id = ct.taxonomy_id
     WHERE ct.content_id = c.id 
       AND t.kind = 'Domain'
       AND t.archived = false
     ORDER BY t.position, t.label
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

-- 6) Update create_media_item RPC to optionally accept taxonomy_ids
CREATE OR REPLACE FUNCTION public.create_media_item(_base jsonb, _type text, _child jsonb, _taxonomy_ids uuid[] DEFAULT NULL)
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
  -- Map child by type into cnt_contents columns and metadata
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

  -- Assign taxonomies if provided
  IF _taxonomy_ids IS NOT NULL AND array_length(_taxonomy_ids, 1) > 0 THEN
    PERFORM public.set_content_taxonomies(_id, _taxonomy_ids);
  END IF;

  RETURN _id;
END;
$$;

-- 7) Update update_media_item RPC to optionally accept taxonomy_ids
CREATE OR REPLACE FUNCTION public.update_media_item(_id uuid, _base jsonb, _type text, _child jsonb, _taxonomy_ids uuid[] DEFAULT NULL)
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

  -- Update taxonomies if provided (NULL means don't change, empty array means remove all)
  IF _taxonomy_ids IS NOT NULL THEN
    PERFORM public.set_content_taxonomies(_id, _taxonomy_ids);
  END IF;

  RETURN _id;
END;
$$;

-- 8) RLS Policies for junction table
ALTER TABLE public.cnt_contents_taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_join_parent" ON public.cnt_contents_taxonomies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cnt_contents c
      WHERE c.id = cnt_contents_taxonomies.content_id
        AND c.status = 'Published'
        AND (c.published_at IS NULL OR c.published_at <= now())
    )
  );

CREATE POLICY "authenticated_read_all" ON public.cnt_contents_taxonomies
  FOR SELECT USING (public._is_authenticated());

CREATE POLICY "authenticated_write_all" ON public.cnt_contents_taxonomies
  USING (public._is_authenticated())
  WITH CHECK (public._is_authenticated());

-- 9) Grants
GRANT ALL ON FUNCTION
  public.get_content_domain(uuid),
  public.get_content_taxonomies(uuid),
  public.set_content_taxonomies(uuid, uuid[])
TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cnt_contents_taxonomies
TO authenticated, service_role;

GRANT SELECT ON TABLE public.cnt_contents_taxonomies
TO anon;

-- Note: The updated create_media_item and update_media_item functions maintain backward compatibility
-- They work with or without taxonomy_ids parameter

