SET check_function_bodies = off;
CREATE SCHEMA IF NOT EXISTS "public";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core
CREATE TABLE IF NOT EXISTS "public"."media_items"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "title" text NOT NULL,
  "slug" text UNIQUE,
  "summary" text,
  "status" text DEFAULT 'Draft'::text NOT NULL,
  "visibility" text DEFAULT 'Public'::text NOT NULL,
  "language" text DEFAULT 'en'::text,
  "published_at" timestamptz,
  "updated_at" timestamptz DEFAULT now(),
  "created_at" timestamptz DEFAULT now(),
  "seo_title" text,
  "seo_description" text,
  "canonical_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "thumbnail_url" text,
  -- compatibility fields used by RPCs/views
  "domain" text,
  "format" text,
  "popularity" text,
  "authors" jsonb DEFAULT '[]'::jsonb,
  "author_slugs" text[] DEFAULT '{}'::text[],
  "event_time" text,
  "event_location_details" text,
  "event_registration_info" text
);
CREATE INDEX IF NOT EXISTS "idx_media_items_pub_grid_keyset" ON "public"."media_items" ("published_at" DESC, "id" DESC) WHERE (("status"='Published' AND "visibility"='Public' AND "published_at" IS NOT NULL));
CREATE INDEX IF NOT EXISTS "idx_media_items_published_at" ON "public"."media_items" ("published_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_media_items_domain"      ON "public"."media_items" ("domain")      WHERE ("domain" IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_media_items_format"      ON "public"."media_items" ("format")      WHERE ("format" IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_media_items_popularity"  ON "public"."media_items" ("popularity")  WHERE ("popularity" IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_media_items_tags_gin"    ON "public"."media_items" USING gin ("tags");

-- Types (1:1)
CREATE TABLE IF NOT EXISTS "public"."articles"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "body_html" text,
  "body_json" jsonb,
  "byline" text,
  "source" text,
  "announcement_date" date,
  "document_url" text
);
CREATE TABLE IF NOT EXISTS "public"."videos"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "video_url" text,
  "platform" text,
  "duration_sec" int,
  "transcript_url" text
);
CREATE TABLE IF NOT EXISTS "public"."podcasts"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "audio_url" text,
  "is_video_episode" boolean DEFAULT false,
  "episode_no" int,
  "duration_sec" int,
  "transcript_url" text
);
CREATE TABLE IF NOT EXISTS "public"."reports"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "document_url" text,
  "pages" int,
  "file_size_mb" numeric,
  "highlights" jsonb,
  "toc" jsonb
);
CREATE TABLE IF NOT EXISTS "public"."tools"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "document_url" text,
  "requirements" text,
  "file_size_mb" numeric
);
CREATE TABLE IF NOT EXISTS "public"."events"(
  "id" uuid PRIMARY KEY REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "start_at" timestamptz,
  "end_at" timestamptz,
  "venue" text,
  "registration_url" text,
  "timezone" text,
  "mode" text,
  "agenda" jsonb
);

-- Taxonomy & tagging
CREATE TABLE IF NOT EXISTS "public"."taxonomies"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "kind" text NOT NULL,
  "label" text NOT NULL,
  "key" text NOT NULL,
  "description" text,
  "archived" boolean DEFAULT false NOT NULL,
  "position" int DEFAULT 0 NOT NULL,
  "allowed_media_types" jsonb,
  CONSTRAINT "taxonomies_kind_check" CHECK (("kind" = ANY (ARRAY['Domain'::text,'Stage'::text,'Format'::text,'Tag'::text,'Popularity'::text])))
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_taxonomies_kind_key" ON "public"."taxonomies" ("kind","key");
CREATE TABLE IF NOT EXISTS "public"."media_taxonomies"(
  "media_id" uuid NOT NULL,
  "taxonomy_id" uuid NOT NULL,
  PRIMARY KEY ("media_id","taxonomy_id"),
  FOREIGN KEY ("media_id") REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  FOREIGN KEY ("taxonomy_id") REFERENCES "public"."taxonomies"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_media_taxonomies_taxonomy_id" ON "public"."media_taxonomies" ("taxonomy_id");

-- Assets & views tracking
CREATE TABLE IF NOT EXISTS "public"."media_assets"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "media_id" uuid NOT NULL REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "storage_path" text NOT NULL,
  "public_url" text NOT NULL,
  "kind" text,
  "mime" text,
  "size_bytes" bigint,
  "width" int,
  "height" int,
  "duration_sec" int,
  "checksum" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "media_assets_kind_check" CHECK (("kind" = ANY (ARRAY['Image'::text,'Video'::text,'Audio'::text,'Doc'::text])))
);
CREATE INDEX IF NOT EXISTS "media_assets_media_id_idx" ON "public"."media_assets" ("media_id");
CREATE INDEX IF NOT EXISTS "idx_media_assets_kind" ON "public"."media_assets" ("kind");
CREATE INDEX IF NOT EXISTS "idx_media_assets_public_url_not_null" ON "public"."media_assets" ("public_url") WHERE ("public_url" IS NOT NULL);

CREATE TABLE IF NOT EXISTS "public"."media_views"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "media_id" uuid NOT NULL REFERENCES "public"."media_items"("id") ON DELETE CASCADE,
  "viewed_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_media_views_media_id" ON "public"."media_views" ("media_id");
CREATE INDEX IF NOT EXISTS "idx_media_views_viewed_at" ON "public"."media_views" ("viewed_at" DESC);

-- Helpers & RPCs
CREATE OR REPLACE FUNCTION "public"."normalize_slug"(input text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce($1,'')), '[^a-z0-9]+', '-', 'g'))
$$;
CREATE OR REPLACE FUNCTION "public"."enforce_slug_normalization"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug='' THEN NEW.slug := public.normalize_slug(COALESCE(NEW.title, gen_random_uuid()::text));
  ELSE NEW.slug := public.normalize_slug(NEW.slug); END IF; RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION "public"."_is_authenticated"() RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.role(),'') IN ('authenticated','service_role')
$$;
CREATE OR REPLACE FUNCTION "public"."_is_public_published"(_id uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.media_items mi WHERE mi.id=_id AND mi.status='Published' AND mi.visibility='Public' AND (mi.published_at IS NULL OR mi.published_at<=now()))
$$;
CREATE OR REPLACE FUNCTION "public"."_jtxt"(j jsonb, key text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT NULLIF(j->>key,'') $$;
CREATE OR REPLACE FUNCTION "public"."create_media_item"(_base jsonb, _type text, _child jsonb) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE _id uuid; t text := lower(coalesce(_type,'')); BEGIN
  INSERT INTO public.media_items(slug,title,summary,status,visibility,language,seo_title,seo_description,canonical_url,published_at,thumbnail_url,tags,domain)
  VALUES(public.normalize_slug(public._jtxt(_base,'slug')),COALESCE(public._jtxt(_base,'title'),''),public._jtxt(_base,'summary'),COALESCE(public._jtxt(_base,'status'),'Draft'),COALESCE(public._jtxt(_base,'visibility'),'Public'),COALESCE(public._jtxt(_base,'language'),'en'),public._jtxt(_base,'seo_title'),public._jtxt(_base,'seo_description'),public._jtxt(_base,'canonical_url'),(_base->>'published_at')::timestamptz,public._jtxt(_base,'thumbnail_url'),COALESCE(_base->'tags','[]'::jsonb),public._jtxt(_base,'domain')) RETURNING id INTO _id;
  IF t IN('article','news','guide') THEN INSERT INTO public.articles(id,body_html,body_json,byline,source,announcement_date) VALUES(_id,public._jtxt(_child,'body_html'),_child->'body_json',public._jtxt(_child,'byline'),public._jtxt(_child,'source'),(_child->>'announcement_date')::date);
  ELSIF t IN('video','videos') THEN INSERT INTO public.videos(id,video_url,platform,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'video_url'),lower(public._jtxt(_child,'platform')),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url'));
  ELSIF t IN('podcast','podcasts') THEN INSERT INTO public.podcasts(id,audio_url,is_video_episode,episode_no,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'audio_url'),COALESCE((_child->>'is_video_episode')::boolean,false),NULLIF((_child->>'episode_no')::int,0),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url'));
  ELSIF t IN('report','reports') THEN INSERT INTO public.reports(id,document_url,pages,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),NULLIF((_child->>'pages')::int,0),NULLIF((_child->>'file_size_mb')::numeric,0));
  ELSIF t IN('tool','tools','toolkit','toolkits') THEN INSERT INTO public.tools(id,document_url,requirements,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),public._jtxt(_child,'requirements'),NULLIF((_child->>'file_size_mb')::numeric,0));
  ELSIF t IN('event','events') THEN INSERT INTO public.events(id,start_at,end_at,venue,registration_url,timezone,mode,agenda) VALUES(_id,(_child->>'start_at')::timestamptz,(_child->>'end_at')::timestamptz,public._jtxt(_child,'venue'),public._jtxt(_child,'registration_url'),public._jtxt(_child,'timezone'),public._jtxt(_child,'mode'),_child->'agenda'); END IF; RETURN _id; END; $$;
CREATE OR REPLACE FUNCTION "public"."update_media_item"(_id uuid,_base jsonb,_type text,_child jsonb) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE t text := lower(coalesce(_type,'')); BEGIN
  UPDATE public.media_items SET slug=COALESCE(public.normalize_slug(public._jtxt(_base,'slug')),slug), title=COALESCE(public._jtxt(_base,'title'),title), summary=COALESCE(public._jtxt(_base,'summary'),summary), status=COALESCE(public._jtxt(_base,'status'),status), visibility=COALESCE(public._jtxt(_base,'visibility'),visibility), language=COALESCE(public._jtxt(_base,'language'),language), seo_title=COALESCE(public._jtxt(_base,'seo_title'),seo_title), seo_description=COALESCE(public._jtxt(_base,'seo_description'),seo_description), canonical_url=COALESCE(public._jtxt(_base,'canonical_url'),canonical_url), published_at=COALESCE((_base->>'published_at')::timestamptz,published_at), thumbnail_url=COALESCE(public._jtxt(_base,'thumbnail_url'),thumbnail_url), tags=COALESCE(_base->'tags',tags), domain=COALESCE(public._jtxt(_base,'domain'),domain), event_time=COALESCE(public._jtxt(_base,'event_time'),event_time), event_location_details=COALESCE(public._jtxt(_base,'event_location_details'),event_location_details), event_registration_info=COALESCE(public._jtxt(_base,'event_registration_info'),event_registration_info) WHERE id=_id;
  IF t IN('article','news','guide') THEN INSERT INTO public.articles(id,body_html,body_json,byline,source,announcement_date) VALUES(_id,public._jtxt(_child,'body_html'),_child->'body_json',public._jtxt(_child,'byline'),public._jtxt(_child,'source'),(_child->>'announcement_date')::date) ON CONFLICT(id) DO UPDATE SET body_html=EXCLUDED.body_html, body_json=EXCLUDED.body_json, byline=EXCLUDED.byline, source=EXCLUDED.source, announcement_date=EXCLUDED.announcement_date;
  ELSIF t IN('video','videos') THEN INSERT INTO public.videos(id,video_url,platform,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'video_url'),lower(public._jtxt(_child,'platform')),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url')) ON CONFLICT(id) DO UPDATE SET video_url=EXCLUDED.video_url, platform=EXCLUDED.platform, duration_sec=EXCLUDED.duration_sec, transcript_url=EXCLUDED.transcript_url;
  ELSIF t IN('podcast','podcasts') THEN INSERT INTO public.podcasts(id,audio_url,is_video_episode,episode_no,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'audio_url'),COALESCE((_child->>'is_video_episode')::boolean,false),NULLIF((_child->>'episode_no')::int,0),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url')) ON CONFLICT(id) DO UPDATE SET audio_url=EXCLUDED.audio_url, is_video_episode=EXCLUDED.is_video_episode, episode_no=EXCLUDED.episode_no, duration_sec=EXCLUDED.duration_sec, transcript_url=EXCLUDED.transcript_url;
  ELSIF t IN('report','reports') THEN INSERT INTO public.reports(id,document_url,pages,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),NULLIF((_child->>'pages')::int,0),NULLIF((_child->>'file_size_mb')::numeric,0)) ON CONFLICT(id) DO UPDATE SET document_url=EXCLUDED.document_url, pages=EXCLUDED.pages, file_size_mb=EXCLUDED.file_size_mb;
  ELSIF t IN('tool','tools','toolkit','toolkits') THEN INSERT INTO public.tools(id,document_url,requirements,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),public._jtxt(_child,'requirements'),NULLIF((_child->>'file_size_mb')::numeric,0)) ON CONFLICT(id) DO UPDATE SET document_url=EXCLUDED.document_url, requirements=EXCLUDED.requirements, file_size_mb=EXCLUDED.file_size_mb;
  ELSIF t IN('event','events') THEN INSERT INTO public.events(id,start_at,end_at,venue,registration_url,timezone,mode,agenda) VALUES(_id,(_child->>'start_at')::timestamptz,(_child->>'end_at')::timestamptz,public._jtxt(_child,'venue'),public._jtxt(_child,'registration_url'),public._jtxt(_child,'timezone'),public._jtxt(_child,'mode'),_child->'agenda') ON CONFLICT(id) DO UPDATE SET start_at=EXCLUDED.start_at, end_at=EXCLUDED.end_at, venue=EXCLUDED.venue, registration_url=EXCLUDED.registration_url, timezone=EXCLUDED.timezone, mode=EXCLUDED.mode, agenda=EXCLUDED.agenda; END IF; RETURN _id; END; $$;

-- Views
CREATE OR REPLACE VIEW "public"."v_media_all" AS
SELECT m.id, m.slug,
       COALESCE(m.title,(to_jsonb(m.*)->>'title')) AS title,
       COALESCE(m.summary,(to_jsonb(m.*)->>'summary')) AS summary,
       m.status, m.visibility, m.language, m.seo_title, m.seo_description, m.canonical_url,
       m.published_at, m.created_at, m.updated_at, m.thumbnail_url, m.tags,
       COALESCE((to_jsonb(m.*)->>'type'), CASE WHEN a.id IS NOT NULL THEN 'Article' WHEN v.id IS NOT NULL THEN 'Video' WHEN p.id IS NOT NULL THEN 'Podcast' WHEN r.id IS NOT NULL THEN 'Report' WHEN t.id IS NOT NULL THEN 'Tool' WHEN e.id IS NOT NULL THEN 'Event' ELSE NULL END) AS type,
       a.body_html AS article_body_html, a.body_json AS article_body_json, a.byline AS article_byline, a.source AS article_source, a.announcement_date AS article_announcement_date, a.document_url AS article_document_url,
       COALESCE(a.body_html,(to_jsonb(m.*)->>'body'),(to_jsonb(m.*)->>'body_html')) AS body_html,
       COALESCE(a.body_json,(to_jsonb(m.*)->'body_json')) AS body_json,
       v.video_url, v.platform, v.duration_sec AS video_duration_sec, v.transcript_url AS video_transcript_url,
       p.audio_url, p.is_video_episode, p.episode_no, p.duration_sec AS audio_duration_sec, p.transcript_url AS audio_transcript_url,
       r.document_url AS report_document_url, r.pages AS report_pages, r.file_size_mb AS report_file_size_mb, r.highlights AS report_highlights, r.toc AS report_toc,
       t.document_url AS tool_document_url, t.requirements AS tool_requirements, t.file_size_mb AS tool_file_size_mb,
       e.start_at, e.end_at, e.venue, e.registration_url, e.timezone, e.mode AS event_mode, COALESCE(e.agenda,(to_jsonb(m.*)->'event_agenda')) AS event_agenda,
       COALESCE((to_jsonb(m.*)->>'domain'),(SELECT t1.label FROM public.media_taxonomies mt JOIN public.taxonomies t1 ON t1.id=mt.taxonomy_id WHERE mt.media_id=m.id AND t1.kind='Domain' ORDER BY t1.position,t1.label LIMIT 1)) AS domain,
       (to_jsonb(m.*)->'authors') AS authors, (to_jsonb(m.*)->'author_slugs') AS author_slugs
FROM public.media_items m
LEFT JOIN public.articles a ON a.id=m.id
LEFT JOIN public.videos   v ON v.id=m.id
LEFT JOIN public.podcasts p ON p.id=m.id
LEFT JOIN public.reports  r ON r.id=m.id
LEFT JOIN public.tools    t ON t.id=m.id
LEFT JOIN public.events   e ON e.id=m.id;

CREATE OR REPLACE VIEW "public"."v_media_public" AS
SELECT * FROM public.v_media_all WHERE status='Published' AND visibility='Public' AND (published_at IS NULL OR published_at<=now());

CREATE OR REPLACE VIEW "public"."v_media_public_grid" AS
SELECT id, title,
       COALESCE(NULLIF(summary,''::text), NULLIF(left(regexp_replace(COALESCE(body_html,''::text),'<[^>]*>'::text,''::text,'g'),240),''::text)) AS summary,
       thumbnail_url, type, tags, published_at, start_at, registration_url,
       COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
FROM public.v_media_public;

-- Convenience RPC
CREATE OR REPLACE FUNCTION "public"."get_media_item_full"(media_id uuid) RETURNS "public"."v_media_all" LANGUAGE sql STABLE AS $$ SELECT * FROM public.v_media_all WHERE id=media_id $$;

-- Triggers
CREATE OR REPLACE TRIGGER "trg_media_items_set_updated_at" BEFORE UPDATE ON "public"."media_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE OR REPLACE TRIGGER "trg_media_items_slug_normalize" BEFORE INSERT OR UPDATE OF "slug","title" ON "public"."media_items" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_slug_normalization"();

-- RLS
ALTER TABLE "public"."media_items"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."articles"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."videos"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."podcasts"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reports"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tools"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."taxonomies"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_taxonomies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_assets"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_views"      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_public" ON "public"."media_items" FOR SELECT USING ((status='Published' AND visibility='Public' AND (published_at IS NULL OR published_at<=now())));
CREATE POLICY "public_read_join_parent" ON "public"."articles"         FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."videos"           FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."podcasts"         FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."reports"          FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."tools"            FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."events"           FOR SELECT USING (public._is_public_published(id));
CREATE POLICY "public_read_join_parent" ON "public"."media_taxonomies" FOR SELECT USING (public._is_public_published(media_id));
CREATE POLICY "public_read_assets_if_parent_public" ON "public"."media_assets" FOR SELECT USING ((public_url IS NOT NULL) AND public._is_public_published(media_id));
CREATE POLICY "public_read_all" ON "public"."taxonomies" FOR SELECT USING (true);

CREATE POLICY "authenticated_read_all"  ON "public"."media_items"      FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."media_items"      USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."articles"         FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."articles"         USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."videos"           FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."videos"           USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."podcasts"         FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."podcasts"         USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."reports"          FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."reports"          USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."tools"            FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."tools"            USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."events"           FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."events"           USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."taxonomies"       FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."taxonomies"       USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."media_taxonomies" FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."media_taxonomies" USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."media_assets"     FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."media_assets"     USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());
CREATE POLICY "authenticated_read_all"  ON "public"."media_views"      FOR SELECT USING (public._is_authenticated());
CREATE POLICY "authenticated_write_all" ON "public"."media_views"      USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());

-- Grants (RLS still applies)
GRANT USAGE ON SCHEMA "public" TO "anon","authenticated","service_role";
GRANT ALL ON FUNCTION
  "public"."normalize_slug"(text),
  "public"."enforce_slug_normalization"(),
  "public"."set_updated_at"(),
  "public"."_is_authenticated"(),
  "public"."_is_public_published"(uuid),
  "public"."_jtxt"(jsonb,text),
  "public"."create_media_item"(jsonb,text,jsonb),
  "public"."update_media_item"(uuid,jsonb,text,jsonb),
  "public"."get_media_item_full"(uuid)
TO "anon","authenticated","service_role";
GRANT SELECT ON TABLE
  "public"."media_items","public"."articles","public"."videos","public"."podcasts","public"."reports","public"."tools","public"."events","public"."taxonomies","public"."media_taxonomies","public"."media_assets","public"."media_views"
TO "anon";
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE
  "public"."media_items","public"."articles","public"."videos","public"."podcasts","public"."reports","public"."tools","public"."events","public"."taxonomies","public"."media_taxonomies","public"."media_assets","public"."media_views"
TO "authenticated","service_role";
GRANT SELECT ON TABLE "public"."v_media_all","public"."v_media_public","public"."v_media_public_grid" TO "anon","authenticated","service_role";

