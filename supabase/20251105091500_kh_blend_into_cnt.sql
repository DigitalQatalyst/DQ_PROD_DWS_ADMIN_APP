-- Blend KnowledgeHub semantics into existing cnt_* tables without adding new tables
-- Adds helper functions, RPCs, views, and a slug normalization trigger that operate on cnt_contents

SET check_function_bodies = off;

-- 1) Helpers
CREATE OR REPLACE FUNCTION public.normalize_slug(input text)
RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce($1,'')), '[^a-z0-9]+', '-', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.enforce_slug_normalization()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.normalize_slug(COALESCE(NEW.title, gen_random_uuid()::text));
  ELSE
    NEW.slug := public.normalize_slug(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$;

-- Add/replace trigger for slug normalization on cnt_contents
DROP TRIGGER IF EXISTS trg_cnt_contents_slug_normalize ON public.cnt_contents;
CREATE TRIGGER trg_cnt_contents_slug_normalize
BEFORE INSERT OR UPDATE OF slug, title ON public.cnt_contents
FOR EACH ROW EXECUTE FUNCTION public.enforce_slug_normalization();

CREATE OR REPLACE FUNCTION public._is_authenticated()
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.role(), '') IN ('authenticated','service_role')
$$;

CREATE OR REPLACE FUNCTION public._jtxt(j jsonb, key text)
RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT NULLIF(j->>key, '')
$$;

-- Fallback for public visibility: use Published status and published_at
CREATE OR REPLACE FUNCTION public._is_public_published(_id uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cnt_contents c
    WHERE c.id = _id
      AND c.status = 'Published'
      AND (c.published_at IS NULL OR c.published_at <= now())
  )
$$;

-- 2) RPCs that write into cnt_contents with type-specific data in columns + metadata jsonb
CREATE OR REPLACE FUNCTION public.create_media_item(_base jsonb, _type text, _child jsonb)
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
    v_duration := NULLIF((_child->>'duration_sec')::int,0)::text; -- keep as text duration for existing column
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
    -- store event-specific fields in metadata; cnt_events table exists but we avoid new rows
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

  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_media_item(_id uuid, _base jsonb, _type text, _child jsonb)
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

  RETURN _id;
END;
$$;

-- 3) Views (app-facing)
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
  COALESCE(c.category, NULL) AS domain,
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

CREATE OR REPLACE VIEW public.v_media_public AS
SELECT * FROM public.v_media_all
WHERE status = 'Published' AND (published_at IS NULL OR published_at <= now());

CREATE OR REPLACE VIEW public.v_media_public_grid AS
SELECT id, title,
       COALESCE(NULLIF(summary,''), NULLIF(left(regexp_replace(COALESCE(body_html,''), '<[^>]*>', '', 'g'), 240),'')) AS summary,
       thumbnail_url AS thumbnail,
       type,
       tags,
       published_at,
       start_at,
       registration_url,
       COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
FROM public.v_media_public;

-- 4) Grants
GRANT ALL ON FUNCTION
  public.normalize_slug(text),
  public.enforce_slug_normalization(),
  public._is_authenticated(),
  public._is_public_published(uuid),
  public._jtxt(jsonb,text),
  public.create_media_item(jsonb,text,jsonb),
  public.update_media_item(uuid,jsonb,text,jsonb)
TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.v_media_all, public.v_media_public, public.v_media_public_grid
TO anon, authenticated, service_role;

