--
-- PostgreSQL database dump
--

\restrict XPU1XxXObCE7HVu7YcUyUSCgAo1OTzYdsbuWyYllrsWauemoppybLRSwkfFZz9W

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-05 21:35:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 38 (class 2615 OID 16494)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 24 (class 2615 OID 16388)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- TOC entry 36 (class 2615 OID 16624)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- TOC entry 35 (class 2615 OID 16613)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- TOC entry 13 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- TOC entry 14 (class 2615 OID 16605)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- TOC entry 39 (class 2615 OID 16542)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- TOC entry 15 (class 2615 OID 17454)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- TOC entry 28 (class 2615 OID 16653)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- TOC entry 7 (class 3079 OID 16689)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 6089 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 5 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 6090 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 3 (class 3079 OID 16443)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 6091 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 27746)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 6092 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 6 (class 3079 OID 16654)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 6093 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 4 (class 3079 OID 16432)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 6094 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1951 (class 1247 OID 16784)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- TOC entry 1975 (class 1247 OID 16925)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- TOC entry 1948 (class 1247 OID 16778)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- TOC entry 1945 (class 1247 OID 16773)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- TOC entry 1993 (class 1247 OID 17028)
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- TOC entry 2005 (class 1247 OID 17101)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- TOC entry 1987 (class 1247 OID 17006)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- TOC entry 1996 (class 1247 OID 17038)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- TOC entry 1981 (class 1247 OID 16967)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- TOC entry 2077 (class 1247 OID 28791)
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'approver',
    'contributor',
    'creator',
    'viewer'
);


--
-- TOC entry 2020 (class 1247 OID 17158)
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- TOC entry 2011 (class 1247 OID 17118)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- TOC entry 2014 (class 1247 OID 17133)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- TOC entry 2026 (class 1247 OID 17216)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- TOC entry 2023 (class 1247 OID 17171)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- TOC entry 2041 (class 1247 OID 17417)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- TOC entry 451 (class 1255 OID 16540)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 451
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 470 (class 1255 OID 16755)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- TOC entry 450 (class 1255 OID 16539)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 450
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 449 (class 1255 OID 16538)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 452 (class 1255 OID 16597)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 452
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 456 (class 1255 OID 16618)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- TOC entry 6099 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 453 (class 1255 OID 16599)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- TOC entry 6100 (class 0 OID 0)
-- Dependencies: 453
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 454 (class 1255 OID 16609)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 455 (class 1255 OID 16610)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 457 (class 1255 OID 16620)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- TOC entry 6101 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 399 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- TOC entry 1275 (class 1255 OID 30088)
-- Name: _is_authenticated(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._is_authenticated() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(auth.role(),'') IN ('authenticated','service_role')
$$;


--
-- TOC entry 1276 (class 1255 OID 30089)
-- Name: _is_public_published(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._is_public_published(_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS(SELECT 1 FROM public.media_items mi WHERE mi.id=_id AND mi.status='Published' AND mi.visibility='Public' AND (mi.published_at IS NULL OR mi.published_at<=now()))
$$;


--
-- TOC entry 1277 (class 1255 OID 30090)
-- Name: _jtxt(jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._jtxt(j jsonb, key text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$ SELECT NULLIF(j->>key,'') $$;


--
-- TOC entry 1235 (class 1255 OID 29772)
-- Name: can_access_organisation(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_access_organisation(org_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  can_access BOOLEAN := FALSE;
  user_id TEXT;
  user_org_id UUID;
BEGIN
  user_id := get_current_user_id();
  
  IF user_id IS NULL THEN
    RETURN TRUE; -- Allow access in development mode when no auth
  END IF;
  
  -- Platform users can access all organisations
  IF is_platform_user() THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's organisation
  user_org_id := get_current_user_organisation();
  
  -- Users can access their own organisation (both are UUIDs, so no casting needed)
  RETURN user_org_id = org_id;
END;
$$;


--
-- TOC entry 1236 (class 1255 OID 29773)
-- Name: clear_current_user_context(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clear_current_user_context() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    PERFORM set_config('app.current_user_id', NULL, false);
    PERFORM set_config('app.customer_type', NULL, false);
    PERFORM set_config('app.user_role', NULL, false);
    PERFORM set_config('app.organisation_name', NULL, false);
    PERFORM set_config('app.organisation_id', NULL, false);
END;
$$;


--
-- TOC entry 1278 (class 1255 OID 30091)
-- Name: create_media_item(jsonb, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_media_item(_base jsonb, _type text, _child jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE _id uuid; t text := lower(coalesce(_type,'')); BEGIN
  INSERT INTO public.media_items(slug,title,summary,status,visibility,language,seo_title,seo_description,canonical_url,published_at,thumbnail_url,tags,domain)
  VALUES(public.normalize_slug(public._jtxt(_base,'slug')),COALESCE(public._jtxt(_base,'title'),''),public._jtxt(_base,'summary'),COALESCE(public._jtxt(_base,'status'),'Draft'),COALESCE(public._jtxt(_base,'visibility'),'Public'),COALESCE(public._jtxt(_base,'language'),'en'),public._jtxt(_base,'seo_title'),public._jtxt(_base,'seo_description'),public._jtxt(_base,'canonical_url'),(_base->>'published_at')::timestamptz,public._jtxt(_base,'thumbnail_url'),COALESCE(_base->'tags','[]'::jsonb),public._jtxt(_base,'domain')) RETURNING id INTO _id;
  IF t IN('article','news','guide') THEN INSERT INTO public.articles(id,body_html,body_json,byline,source,announcement_date) VALUES(_id,public._jtxt(_child,'body_html'),_child->'body_json',public._jtxt(_child,'byline'),public._jtxt(_child,'source'),(_child->>'announcement_date')::date);
  ELSIF t IN('video','videos') THEN INSERT INTO public.videos(id,video_url,platform,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'video_url'),lower(public._jtxt(_child,'platform')),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url'));
  ELSIF t IN('podcast','podcasts') THEN INSERT INTO public.podcasts(id,audio_url,is_video_episode,episode_no,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'audio_url'),COALESCE((_child->>'is_video_episode')::boolean,false),NULLIF((_child->>'episode_no')::int,0),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url'));
  ELSIF t IN('report','reports') THEN INSERT INTO public.reports(id,document_url,pages,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),NULLIF((_child->>'pages')::int,0),NULLIF((_child->>'file_size_mb')::numeric,0));
  ELSIF t IN('tool','tools','toolkit','toolkits') THEN INSERT INTO public.tools(id,document_url,requirements,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),public._jtxt(_child,'requirements'),NULLIF((_child->>'file_size_mb')::numeric,0));
  ELSIF t IN('event','events') THEN INSERT INTO public.events(id,start_at,end_at,venue,registration_url,timezone,mode,agenda) VALUES(_id,(_child->>'start_at')::timestamptz,(_child->>'end_at')::timestamptz,public._jtxt(_child,'venue'),public._jtxt(_child,'registration_url'),public._jtxt(_child,'timezone'),public._jtxt(_child,'mode'),_child->'agenda'); END IF; RETURN _id; END; $$;


--
-- TOC entry 1288 (class 1255 OID 30761)
-- Name: create_media_item(jsonb, text, jsonb, uuid[], uuid[], uuid[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_media_item(_base jsonb, _type text, _child jsonb, _facet_value_ids uuid[] DEFAULT NULL::uuid[], _tag_ids uuid[] DEFAULT NULL::uuid[], _collection_ids uuid[] DEFAULT NULL::uuid[], _user_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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
      'end_at',   (_child->>'end_at')::timestamptz,
      'venue',    public._jtxt(_child,'venue'),
      'registration_url', public._jtxt(_child,'registration_url'),
      'timezone', public._jtxt(_child,'timezone'),
      'mode',     public._jtxt(_child,'mode'),
      'agenda',   _child->'agenda'
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

  IF _facet_value_ids IS NOT NULL AND array_length(_facet_value_ids, 1) > 0 THEN
    PERFORM public.set_content_facet_values(_id, _facet_value_ids, _user_id);
  END IF;
  IF _tag_ids IS NOT NULL AND array_length(_tag_ids, 1) > 0 THEN
    PERFORM public.set_content_tags(_id, _tag_ids, _user_id);
  END IF;
  IF _collection_ids IS NOT NULL AND array_length(_collection_ids, 1) > 0 THEN
    PERFORM public.set_content_collections(_id, _collection_ids, _user_id);
  END IF;

  RETURN _id;
END;
$$;


--
-- TOC entry 1237 (class 1255 OID 29779)
-- Name: create_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_profile() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO user_profiles (user_id, customer_type, user_role)
    VALUES (NEW.id, 'staff', 'viewer');
    RETURN NEW;
END;
$$;


--
-- TOC entry 1238 (class 1255 OID 29780)
-- Name: current_org_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_org_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.organization_id', true), '')::uuid,  -- Supabase runtime
    nullif(current_setting('jwt.claims.organization_id',        true), '')::uuid   -- manual SET during testing
  );
$$;


--
-- TOC entry 1239 (class 1255 OID 29781)
-- Name: current_org_id_from_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_org_id_from_name() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  org_name text;
  org_id   uuid;
BEGIN
  org_name := COALESCE(
    nullif(current_setting('request.jwt.claim.organization', true), ''),
    nullif(current_setting('jwt.claims.organization',        true), '')
  );

  IF org_name IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO org_id
  FROM public.auth_organizations
  WHERE LOWER(name) = LOWER(org_name)
  LIMIT 1;

  RETURN org_id;
END;
$$;


--
-- TOC entry 1240 (class 1255 OID 29782)
-- Name: current_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_user_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,        -- Supabase runtime
    nullif(current_setting('jwt.claims.sub',        true), '')::uuid         -- manual SET during testing
  );
$$;


--
-- TOC entry 1241 (class 1255 OID 29783)
-- Name: effective_org_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.effective_org_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(public.current_org_id(), public.current_org_id_from_name());
$$;


--
-- TOC entry 1273 (class 1255 OID 30086)
-- Name: enforce_slug_normalization(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_slug_normalization() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug='' THEN NEW.slug := public.normalize_slug(COALESCE(NEW.title, gen_random_uuid()::text));
  ELSE NEW.slug := public.normalize_slug(NEW.slug); END IF; RETURN NEW;
END; $$;


--
-- TOC entry 1242 (class 1255 OID 29784)
-- Name: generate_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_slug(input_text text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$;


--
-- TOC entry 1243 (class 1255 OID 29785)
-- Name: get_app_customer_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_app_customer_type() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- First try to get from app context variable
  IF current_setting('app.customer_type', true) IS NOT NULL THEN
    RETURN current_setting('app.customer_type', true);
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT customer_type 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;


--
-- TOC entry 1244 (class 1255 OID 29786)
-- Name: get_app_organization_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_app_organization_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- First try to get from app context variable (set by backend)
  IF current_setting('app.organization_id', true) IS NOT NULL THEN
    RETURN current_setting('app.organization_id', true)::uuid;
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT organization_id 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;


--
-- TOC entry 1245 (class 1255 OID 29787)
-- Name: get_app_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_app_user_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- First try to get from app context variable
  IF current_setting('app.user_role', true) IS NOT NULL THEN
    RETURN current_setting('app.user_role', true);
  END IF;
  
  -- Fallback to auth_user_profiles lookup
  RETURN (
    SELECT role 
    FROM auth_user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;


--
-- TOC entry 1246 (class 1255 OID 29788)
-- Name: get_claim_org_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_claim_org_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT id FROM auth_organizations
  WHERE name = get_claim_org_name();
$$;


--
-- TOC entry 1247 (class 1255 OID 29789)
-- Name: get_claim_org_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_claim_org_name() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.organization_name', true), '');
$$;


--
-- TOC entry 1284 (class 1255 OID 30756)
-- Name: get_content_collections(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_content_collections(_content_id uuid, _language_code text DEFAULT 'en'::text) RETURNS TABLE(collection_id uuid, collection_name text, collection_slug text, collection_path text[])
    LANGUAGE sql STABLE
    AS $$
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
      SELECT collection_id FROM public.cnt_contents_collections WHERE content_id = _content_id
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
    WHERE cp.depth < 10
  )
  SELECT DISTINCT
    cp.id, cp.name, cp.slug, cp.path
  FROM collection_path cp
  WHERE cp.parent_id IS NULL
  ORDER BY cp.path;
$$;


--
-- TOC entry 1281 (class 1255 OID 30753)
-- Name: get_content_domain_facet(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_content_domain_facet(_content_id uuid, _language_code text DEFAULT 'en'::text) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(
    (SELECT (fvt.name)::text
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
    (SELECT (category)::text FROM public.cnt_contents WHERE id = _content_id),
    NULL
  );
$$;


--
-- TOC entry 1282 (class 1255 OID 30754)
-- Name: get_content_facet_values(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_content_facet_values(_content_id uuid, _language_code text DEFAULT 'en'::text) RETURNS TABLE(facet_code text, facet_name text, facet_value_id uuid, facet_value_code text, facet_value_name text, facet_value_position integer)
    LANGUAGE sql STABLE
    AS $$
  SELECT 
    f.code AS facet_code,
    COALESCE(ft.name, f.code) AS facet_name,
    fv.id AS facet_value_id,
    fv.code AS facet_value_code,
    COALESCE(fvt.name, fv.code) AS facet_value_name,
    0 AS facet_value_position
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


--
-- TOC entry 1283 (class 1255 OID 30755)
-- Name: get_content_tags(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_content_tags(_content_id uuid) RETURNS TABLE(tag_id uuid, tag_value text)
    LANGUAGE sql STABLE
    AS $$
  SELECT t.id, t.value
  FROM public.cnt_contents_tags cct
  JOIN public.txn_tags t ON t.id = cct.tag_id
  WHERE cct.content_id = _content_id
  ORDER BY t.value;
$$;


--
-- TOC entry 1248 (class 1255 OID 29790)
-- Name: get_current_customer_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_customer_type() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'customerType',
    auth.jwt() ->> 'customer_type',
    'staff'  -- Default to staff for backward compatibility
  );
END;
$$;


--
-- TOC entry 1249 (class 1255 OID 29791)
-- Name: get_current_organisation_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_organisation_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'organisation_id')::UUID,
    (auth.jwt() ->> 'organization_id')::UUID,
    NULL
  );
END;
$$;


--
-- TOC entry 1250 (class 1255 OID 29792)
-- Name: get_current_user_context(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_context() RETURNS TABLE(user_id text, customer_type text, user_role text, organisation_name text, organisation_id text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY SELECT
        current_setting('app.current_user_id', true)::TEXT,
        current_setting('app.customer_type', true)::TEXT,
        current_setting('app.user_role', true)::TEXT,
        current_setting('app.organisation_name', true)::TEXT,
        current_setting('app.organisation_id', true)::TEXT;
END;
$$;


--
-- TOC entry 1251 (class 1255 OID 29793)
-- Name: get_current_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;


--
-- TOC entry 1252 (class 1255 OID 29794)
-- Name: get_current_user_org_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_org_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN current_setting('app.organisation_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;


--
-- TOC entry 1253 (class 1255 OID 29795)
-- Name: get_current_user_organisation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_organisation() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_org_id UUID;
  user_id TEXT;
BEGIN
  user_id := get_current_user_id();
  
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT up.organisation_id INTO user_org_id
  FROM user_profiles up
  WHERE up.user_id = user_id::TEXT
  LIMIT 1;
  
  RETURN user_org_id;
END;
$$;


--
-- TOC entry 1254 (class 1255 OID 29796)
-- Name: get_current_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN current_setting('app.user_role', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 329 (class 1259 OID 28850)
-- Name: cnt_contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_contents (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    content_type text DEFAULT 'Article'::text,
    author_id uuid,
    author_name text,
    status text DEFAULT 'Draft'::text,
    published_at timestamp with time zone,
    content text,
    summary text,
    tags text[],
    featured_image_url text,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description text,
    category text,
    thumbnail_url text,
    read_time text,
    duration text,
    comment_count integer DEFAULT 0,
    engagement jsonb DEFAULT '{"likes": 0, "views": 0, "comments": 0}'::jsonb,
    organization_id uuid,
    content_subtype text,
    slug text,
    sector text,
    key_points text[] DEFAULT '{}'::text[],
    is_featured boolean DEFAULT false,
    content_url text,
    source text,
    story_data jsonb DEFAULT '{}'::jsonb,
    entrepreneur_name text,
    entrepreneur_company text,
    entrepreneur_location text,
    impact_metrics jsonb DEFAULT '{}'::jsonb,
    primary_sector_id uuid,
    primary_support_category_id uuid,
    target_stage_id uuid,
    average_rating numeric,
    share_count integer DEFAULT 0,
    flag_count integer DEFAULT 0,
    flagged_at timestamp with time zone,
    CONSTRAINT contents_content_subtype_check CHECK ((content_subtype = ANY (ARRAY['article'::text, 'video'::text, 'guide'::text, 'resource'::text, 'event'::text, 'news'::text, 'announcement'::text, 'business_insight'::text, 'success_story'::text, 'case_study'::text, 'press_release'::text]))),
    CONSTRAINT contents_content_type_check CHECK ((content_type = ANY (ARRAY['Article'::text, 'Video'::text, 'Guide'::text, 'Resource'::text, 'Event'::text, 'News'::text, 'Announcement'::text]))),
    CONSTRAINT contents_status_check CHECK ((status = ANY (ARRAY['Draft'::text, 'Pending Review'::text, 'Published'::text, 'Archived'::text, 'Rejected'::text])))
);


--
-- TOC entry 385 (class 1259 OID 30633)
-- Name: cnt_contents_facet_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_contents_facet_values (
    content_id uuid NOT NULL,
    facet_value_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- TOC entry 376 (class 1259 OID 30552)
-- Name: txn_facet_value_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_facet_value_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    language_code character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    base_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 375 (class 1259 OID 30546)
-- Name: txn_facet_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_facet_values (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    code character varying(255) NOT NULL,
    facet_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 373 (class 1259 OID 30533)
-- Name: txn_facets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_facets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    code character varying(255) NOT NULL,
    is_private boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 379 (class 1259 OID 30577)
-- Name: v_media_all; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_media_all AS
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
            WHEN (content_type = 'Podcast'::text) THEN content_url
            ELSE NULL::text
        END AS audio_url,
    COALESCE(((metadata ->> 'is_video_episode'::text))::boolean, false) AS is_video_episode,
    NULLIF(((metadata ->> 'episode_no'::text))::integer, 0) AS episode_no,
    NULL::integer AS audio_duration_sec,
    (metadata ->> 'transcript_url'::text) AS audio_transcript_url,
        CASE
            WHEN (content_type = 'Report'::text) THEN content_url
            ELSE NULL::text
        END AS report_document_url,
    NULLIF(((metadata ->> 'pages'::text))::integer, 0) AS report_pages,
    NULLIF(((metadata ->> 'file_size_mb'::text))::numeric, (0)::numeric) AS report_file_size_mb,
    (metadata -> 'highlights'::text) AS report_highlights,
    (metadata -> 'toc'::text) AS report_toc,
        CASE
            WHEN (content_type = ANY (ARRAY['Tool'::text, 'Toolkit'::text])) THEN content_url
            ELSE NULL::text
        END AS tool_document_url,
    (metadata ->> 'requirements'::text) AS tool_requirements,
    NULLIF(((metadata ->> 'file_size_mb'::text))::numeric, (0)::numeric) AS tool_file_size_mb,
    ((metadata ->> 'start_at'::text))::timestamp with time zone AS start_at,
    ((metadata ->> 'end_at'::text))::timestamp with time zone AS end_at,
    (metadata ->> 'venue'::text) AS venue,
    (metadata ->> 'registration_url'::text) AS registration_url,
    (metadata ->> 'timezone'::text) AS timezone,
    (metadata ->> 'mode'::text) AS event_mode,
    (metadata -> 'agenda'::text) AS event_agenda,
    COALESCE(( SELECT (fvt.name)::text AS name
           FROM (((public.cnt_contents_facet_values ccfv
             JOIN public.txn_facet_values fv ON ((fv.id = ccfv.facet_value_id)))
             JOIN public.txn_facets f ON ((f.id = fv.facet_id)))
             LEFT JOIN public.txn_facet_value_translations fvt ON (((fvt.base_id = fv.id) AND ((fvt.language_code)::text = 'en'::text))))
          WHERE ((ccfv.content_id = c.id) AND (((f.code)::text = 'Domain'::text) OR ((f.code)::text = 'domain'::text) OR ((f.code)::text ~~* '%domain%'::text)) AND (f.is_private = false))
          ORDER BY fvt.name, fv.code
         LIMIT 1), category) AS domain,
    NULL::jsonb AS authors,
    NULL::jsonb AS author_slugs,
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
    NULL::text AS event_registration_info
   FROM public.cnt_contents c;


--
-- TOC entry 1280 (class 1255 OID 30582)
-- Name: get_media_item_full(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_media_item_full(media_id uuid) RETURNS public.v_media_all
    LANGUAGE sql STABLE
    AS $$ SELECT * FROM public.v_media_all WHERE id=media_id $$;


--
-- TOC entry 1255 (class 1255 OID 29797)
-- Name: get_org_id_from_claim(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_org_id_from_claim() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  org_name text;
  org_id uuid;
BEGIN
  -- Read org_name from JWT claim - try multiple possible claim names
  org_name := COALESCE(
    current_setting('jwt.claims.Company Name', true),
    current_setting('jwt.claims.organization_name', true),
    current_setting('jwt.claims.organisationName', true),
    current_setting('jwt.claims.organizationName', true),
    current_setting('jwt.claims.organisation_name', true)
  );

  -- If no organization name found, return null
  IF org_name IS NULL OR org_name = '' THEN
    RETURN NULL;
  END IF;

  -- Map it to org_id
  SELECT id INTO org_id
  FROM auth_organizations
  WHERE name = org_name;

  RETURN org_id;
END;
$$;


--
-- TOC entry 1256 (class 1255 OID 29798)
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(p_user_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = p_user_id;
    RETURN COALESCE(v_role, 'viewer');
END;
$$;


--
-- TOC entry 1257 (class 1255 OID 29799)
-- Name: increment_flag_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_flag_count(content_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE cnt_contents
  SET flag_count = COALESCE(flag_count, 0) + 1
  WHERE id = content_id;
END;
$$;


--
-- TOC entry 1258 (class 1255 OID 29800)
-- Name: is_enterprise_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_enterprise_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN get_current_customer_type() = 'enterprise';
END;
$$;


--
-- TOC entry 1259 (class 1255 OID 29801)
-- Name: is_member_of_claim_org(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_member_of_claim_org() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth_user_profiles up
    WHERE up.user_id = get_current_user_id()
      AND up.organization_id = get_claim_org_id()
  );
$$;


--
-- TOC entry 1260 (class 1255 OID 29802)
-- Name: is_partner_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_partner_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN get_current_customer_type() = 'partner';
END;
$$;


--
-- TOC entry 1261 (class 1255 OID 29803)
-- Name: is_platform_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_platform_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_staff BOOLEAN := FALSE;
  user_id TEXT;
BEGIN
  user_id := get_current_user_id();
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = user_id
      AND up.customer_type = 'staff'
  ) INTO is_staff;
  
  RETURN is_staff;
END;
$$;


--
-- TOC entry 1262 (class 1255 OID 29804)
-- Name: is_service_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_service_role() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT current_setting('request.jwt.claim.role', true) = 'service_role';
$$;


--
-- TOC entry 1263 (class 1255 OID 29805)
-- Name: is_staff_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_staff_user() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN get_current_customer_type() = 'staff';
END;
$$;


--
-- TOC entry 1264 (class 1255 OID 29806)
-- Name: is_staff_with_allowed_org(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_staff_with_allowed_org() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    customer_type TEXT;
    org_name TEXT;
BEGIN
    customer_type := get_current_customer_type();
    
    IF customer_type != 'staff' THEN
        RETURN FALSE;
    END IF;
    
    -- Get organization name from current user's organization ID
    SELECT o.name INTO org_name
    FROM organisations o
    WHERE o.id = get_current_user_org_id();
    
    RETURN org_name IN ('DigitalQatalyst', 'Front Operations');
END;
$$;


--
-- TOC entry 1265 (class 1255 OID 29807)
-- Name: log_activity(text, uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_activity(p_entity_type text, p_entity_id uuid, p_action text, p_details jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_user_name TEXT;
    v_user_role TEXT;
    v_log_id UUID;
BEGIN
    -- Get current user info
    SELECT id, name, role INTO v_user_id, v_user_name, v_user_role
    FROM users WHERE id = auth.uid();
    
    -- Insert activity log
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        performed_by_name,
        performed_by_role,
        details
    )
    VALUES (
        p_entity_type,
        p_entity_id,
        p_action,
        v_user_id,
        COALESCE(v_user_name, 'Unknown'),
        COALESCE(v_user_role, 'unknown'),
        p_details
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;


--
-- TOC entry 1272 (class 1255 OID 30085)
-- Name: normalize_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_slug(input text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $_$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce($1,'')), '[^a-z0-9]+', '-', 'g'))
$_$;


--
-- TOC entry 1287 (class 1255 OID 30759)
-- Name: set_content_collections(uuid, uuid[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_content_collections(_content_id uuid, _collection_ids uuid[], _user_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM public.cnt_contents_collections WHERE content_id = _content_id;

  IF _collection_ids IS NOT NULL AND array_length(_collection_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_collections (content_id, collection_id, created_by)
    SELECT _content_id, unnest(_collection_ids), _user_id
    ON CONFLICT (content_id, collection_id) DO NOTHING;
  END IF;
END;
$$;


--
-- TOC entry 1285 (class 1255 OID 30757)
-- Name: set_content_facet_values(uuid, uuid[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_content_facet_values(_content_id uuid, _facet_value_ids uuid[], _user_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM public.cnt_contents_facet_values WHERE content_id = _content_id;

  IF _facet_value_ids IS NOT NULL AND array_length(_facet_value_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_facet_values (content_id, facet_value_id, created_by)
    SELECT _content_id, unnest(_facet_value_ids), _user_id
    ON CONFLICT (content_id, facet_value_id) DO NOTHING;
  END IF;
END;
$$;


--
-- TOC entry 1286 (class 1255 OID 30758)
-- Name: set_content_tags(uuid, uuid[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_content_tags(_content_id uuid, _tag_ids uuid[], _user_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM public.cnt_contents_tags WHERE content_id = _content_id;

  IF _tag_ids IS NOT NULL AND array_length(_tag_ids, 1) > 0 THEN
    INSERT INTO public.cnt_contents_tags (content_id, tag_id, created_by)
    SELECT _content_id, unnest(_tag_ids), _user_id
    ON CONFLICT (content_id, tag_id) DO NOTHING;
  END IF;
END;
$$;


--
-- TOC entry 1266 (class 1255 OID 29808)
-- Name: set_current_user_context(text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_current_user_context(user_id text, customer_type text, user_role text, organisation_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Set PostgreSQL context variables for RLS
    PERFORM set_config('app.current_user_id', user_id, false);
    PERFORM set_config('app.customer_type', customer_type, false);
    PERFORM set_config('app.user_role', user_role, false);
    PERFORM set_config('app.organisation_name', organisation_name, false);
    
    -- Get and set organisation_id if organisation_name is provided
    IF organisation_name IS NOT NULL THEN
        PERFORM set_config('app.organisation_id', 
            (SELECT id::TEXT FROM organisations WHERE name = organisation_name LIMIT 1), 
            false);
    END IF;
END;
$$;


--
-- TOC entry 1267 (class 1255 OID 29809)
-- Name: set_org_and_creator(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_org_and_creator() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Automatically populate organization_id from JWT claims if missing
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.effective_org_id();
  END IF;

  -- Automatically populate created_by from JWT claims if missing
  IF NEW.created_by IS NULL THEN
    NEW.created_by := public.current_user_id();
  END IF;

  RETURN NEW;
END;
$$;


--
-- TOC entry 1274 (class 1255 OID 30087)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;


--
-- TOC entry 1268 (class 1255 OID 29810)
-- Name: test_rls_visibility(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.test_rls_visibility() RETURNS TABLE(claim text, table_name text, visible_count integer, total_rows integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    claim_ text;
    tbl text;
BEGIN
    FOR claim_ IN SELECT unnest(ARRAY['enterpriseorg', 'partner1org', 'service_role'])
    LOOP
        PERFORM set_config('jwt.claims.organization_name', claim_, true);
        PERFORM set_config(
            'request.jwt.claim.role',
            CASE WHEN claim_ = 'service_role' THEN 'service_role' ELSE 'authenticated' END,
            true
        );

        FOR tbl IN 
            SELECT unnest(ARRAY[
                'cnt_contents',
                'cnt_resources',
                'comm_mentors',
                'eco_business_directory',
                'eco_growth_areas',
                'eco_zones'
            ])
        LOOP
            EXECUTE format('SELECT count(*) FROM public.%I', tbl) INTO total_rows;
            EXECUTE format('SELECT count(*) FROM public.%I', tbl) INTO visible_count;

            claim := claim_;
            table_name := tbl;
            RETURN NEXT;
        END LOOP;
    END LOOP;
END;
$$;


--
-- TOC entry 1269 (class 1255 OID 29811)
-- Name: test_rls_visibility(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.test_rls_visibility(org_claim text) RETURNS TABLE(claim text, table_name text, visible_count integer, total_rows integer, visible_orgs text)
    LANGUAGE plpgsql
    AS $$
DECLARE
  tbl text;
  visible_count int;
  total_count int;
  org_list text;
BEGIN
  -- Enable RLS and set simulated claim
  SET row_security = on;
  PERFORM set_config('jwt.claims.organization_name', org_claim, true);

  FOR tbl IN
    SELECT unnest(ARRAY[
      'cnt_contents',
      'cnt_resources',
      'comm_mentors',
      'eco_business_directory',
      'eco_growth_areas',
      'eco_zones'
    ])
  LOOP
    -- Count visible rows (with RLS)
    EXECUTE format('SELECT count(*) FROM %I', tbl)
    INTO visible_count;

    -- Count total rows (temporarily disable RLS)
    SET row_security = off;
    EXECUTE format('SELECT count(*) FROM %I', tbl)
    INTO total_count;
    SET row_security = on;

    -- Sample visible organization_ids
    EXECUTE format(
      'SELECT string_agg(DISTINCT organization_id::text, '','') FROM %I',
      tbl
    )
    INTO org_list;

    claim := org_claim;
    table_name := tbl;
    visible_count := COALESCE(visible_count, 0);
    total_rows := COALESCE(total_count, 0);
    visible_orgs := COALESCE(org_list, '— none visible —');

    RETURN NEXT;
  END LOOP;
END $$;


--
-- TOC entry 1279 (class 1255 OID 30092)
-- Name: update_media_item(uuid, jsonb, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_media_item(_id uuid, _base jsonb, _type text, _child jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE t text := lower(coalesce(_type,'')); BEGIN
  UPDATE public.media_items SET slug=COALESCE(public.normalize_slug(public._jtxt(_base,'slug')),slug), title=COALESCE(public._jtxt(_base,'title'),title), summary=COALESCE(public._jtxt(_base,'summary'),summary), status=COALESCE(public._jtxt(_base,'status'),status), visibility=COALESCE(public._jtxt(_base,'visibility'),visibility), language=COALESCE(public._jtxt(_base,'language'),language), seo_title=COALESCE(public._jtxt(_base,'seo_title'),seo_title), seo_description=COALESCE(public._jtxt(_base,'seo_description'),seo_description), canonical_url=COALESCE(public._jtxt(_base,'canonical_url'),canonical_url), published_at=COALESCE((_base->>'published_at')::timestamptz,published_at), thumbnail_url=COALESCE(public._jtxt(_base,'thumbnail_url'),thumbnail_url), tags=COALESCE(_base->'tags',tags), domain=COALESCE(public._jtxt(_base,'domain'),domain), event_time=COALESCE(public._jtxt(_base,'event_time'),event_time), event_location_details=COALESCE(public._jtxt(_base,'event_location_details'),event_location_details), event_registration_info=COALESCE(public._jtxt(_base,'event_registration_info'),event_registration_info) WHERE id=_id;
  IF t IN('article','news','guide') THEN INSERT INTO public.articles(id,body_html,body_json,byline,source,announcement_date) VALUES(_id,public._jtxt(_child,'body_html'),_child->'body_json',public._jtxt(_child,'byline'),public._jtxt(_child,'source'),(_child->>'announcement_date')::date) ON CONFLICT(id) DO UPDATE SET body_html=EXCLUDED.body_html, body_json=EXCLUDED.body_json, byline=EXCLUDED.byline, source=EXCLUDED.source, announcement_date=EXCLUDED.announcement_date;
  ELSIF t IN('video','videos') THEN INSERT INTO public.videos(id,video_url,platform,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'video_url'),lower(public._jtxt(_child,'platform')),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url')) ON CONFLICT(id) DO UPDATE SET video_url=EXCLUDED.video_url, platform=EXCLUDED.platform, duration_sec=EXCLUDED.duration_sec, transcript_url=EXCLUDED.transcript_url;
  ELSIF t IN('podcast','podcasts') THEN INSERT INTO public.podcasts(id,audio_url,is_video_episode,episode_no,duration_sec,transcript_url) VALUES(_id,public._jtxt(_child,'audio_url'),COALESCE((_child->>'is_video_episode')::boolean,false),NULLIF((_child->>'episode_no')::int,0),NULLIF((_child->>'duration_sec')::int,0),public._jtxt(_child,'transcript_url')) ON CONFLICT(id) DO UPDATE SET audio_url=EXCLUDED.audio_url, is_video_episode=EXCLUDED.is_video_episode, episode_no=EXCLUDED.episode_no, duration_sec=EXCLUDED.duration_sec, transcript_url=EXCLUDED.transcript_url;
  ELSIF t IN('report','reports') THEN INSERT INTO public.reports(id,document_url,pages,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),NULLIF((_child->>'pages')::int,0),NULLIF((_child->>'file_size_mb')::numeric,0)) ON CONFLICT(id) DO UPDATE SET document_url=EXCLUDED.document_url, pages=EXCLUDED.pages, file_size_mb=EXCLUDED.file_size_mb;
  ELSIF t IN('tool','tools','toolkit','toolkits') THEN INSERT INTO public.tools(id,document_url,requirements,file_size_mb) VALUES(_id,public._jtxt(_child,'document_url'),public._jtxt(_child,'requirements'),NULLIF((_child->>'file_size_mb')::numeric,0)) ON CONFLICT(id) DO UPDATE SET document_url=EXCLUDED.document_url, requirements=EXCLUDED.requirements, file_size_mb=EXCLUDED.file_size_mb;
  ELSIF t IN('event','events') THEN INSERT INTO public.events(id,start_at,end_at,venue,registration_url,timezone,mode,agenda) VALUES(_id,(_child->>'start_at')::timestamptz,(_child->>'end_at')::timestamptz,public._jtxt(_child,'venue'),public._jtxt(_child,'registration_url'),public._jtxt(_child,'timezone'),public._jtxt(_child,'mode'),_child->'agenda') ON CONFLICT(id) DO UPDATE SET start_at=EXCLUDED.start_at, end_at=EXCLUDED.end_at, venue=EXCLUDED.venue, registration_url=EXCLUDED.registration_url, timezone=EXCLUDED.timezone, mode=EXCLUDED.mode, agenda=EXCLUDED.agenda; END IF; RETURN _id; END; $$;


--
-- TOC entry 1289 (class 1255 OID 30762)
-- Name: update_media_item(uuid, jsonb, text, jsonb, uuid[], uuid[], uuid[], uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_media_item(_id uuid, _base jsonb, _type text, _child jsonb, _facet_value_ids uuid[] DEFAULT NULL::uuid[], _tag_ids uuid[] DEFAULT NULL::uuid[], _collection_ids uuid[] DEFAULT NULL::uuid[], _user_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'body_json', _child->'body_json',
      'byline', public._jtxt(_child,'byline'),
      'source', public._jtxt(_child,'source')
    ));
  ELSIF t = 'Video' THEN
    v_content_url := public._jtxt(_child,'video_url');
    v_duration := NULLIF((_child->>'duration_sec')::int,0)::text;
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'platform', public._jtxt(_child,'platform'),
      'transcript_url', public._jtxt(_child,'transcript_url')
    ));
  ELSIF t = 'Podcast' THEN
    v_content_url := public._jtxt(_child,'audio_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'is_video_episode', COALESCE((_child->>'is_video_episode')::boolean,false),
      'episode_no', NULLIF((_child->>'episode_no')::int,0),
      'transcript_url', public._jtxt(_child,'transcript_url')
    ));
  ELSIF t = 'Report' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'pages', NULLIF((_child->>'pages')::int,0),
      'file_size_mb', NULLIF((_child->>'file_size_mb')::numeric,0),
      'highlights', _child->'highlights',
      'toc', _child->'toc'
    ));
  ELSIF t = 'Tool' THEN
    v_content_url := public._jtxt(_child,'document_url');
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'requirements', public._jtxt(_child,'requirements'),
      'file_size_mb', NULLIF((_child->>'file_size_mb')::numeric,0)
    ));
  ELSIF t = 'Event' THEN
    v_meta := jsonb_strip_nulls(jsonb_build_object(
      'start_at', (_child->>'start_at')::timestamptz,
      'end_at',   (_child->>'end_at')::timestamptz,
      'venue',    public._jtxt(_child,'venue'),
      'registration_url', public._jtxt(_child,'registration_url'),
      'timezone', public._jtxt(_child,'timezone'),
      'mode',     public._jtxt(_child,'mode'),
      'agenda',   _child->'agenda'
    ));
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

  IF _facet_value_ids IS NOT NULL THEN
    PERFORM public.set_content_facet_values(_id, _facet_value_ids, _user_id);
  END IF;
  IF _tag_ids IS NOT NULL THEN
    PERFORM public.set_content_tags(_id, _tag_ids, _user_id);
  END IF;
  IF _collection_ids IS NOT NULL THEN
    PERFORM public.set_content_collections(_id, _collection_ids, _user_id);
  END IF;

  RETURN _id;
END;
$$;


--
-- TOC entry 1270 (class 1255 OID 29812)
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- TOC entry 1271 (class 1255 OID 29813)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- TOC entry 479 (class 1255 OID 17206)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- TOC entry 499 (class 1255 OID 17386)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- TOC entry 483 (class 1255 OID 17226)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- TOC entry 474 (class 1255 OID 17155)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- TOC entry 473 (class 1255 OID 17150)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- TOC entry 480 (class 1255 OID 17218)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- TOC entry 486 (class 1255 OID 17271)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- TOC entry 472 (class 1255 OID 17149)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- TOC entry 498 (class 1255 OID 17385)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- TOC entry 471 (class 1255 OID 17147)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- TOC entry 476 (class 1255 OID 17183)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- TOC entry 497 (class 1255 OID 17379)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- TOC entry 492 (class 1255 OID 17327)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- TOC entry 484 (class 1255 OID 17236)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- TOC entry 507 (class 1255 OID 17435)
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- TOC entry 493 (class 1255 OID 17328)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- TOC entry 496 (class 1255 OID 17331)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- TOC entry 504 (class 1255 OID 17414)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- TOC entry 478 (class 1255 OID 17185)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- TOC entry 477 (class 1255 OID 17184)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- TOC entry 475 (class 1255 OID 17182)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- TOC entry 489 (class 1255 OID 17308)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- TOC entry 490 (class 1255 OID 17325)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- TOC entry 491 (class 1255 OID 17326)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- TOC entry 502 (class 1255 OID 17412)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- TOC entry 487 (class 1255 OID 17281)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- TOC entry 485 (class 1255 OID 17242)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- TOC entry 506 (class 1255 OID 17434)
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- TOC entry 508 (class 1255 OID 17436)
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- TOC entry 495 (class 1255 OID 17330)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- TOC entry 509 (class 1255 OID 17437)
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- TOC entry 511 (class 1255 OID 17442)
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 503 (class 1255 OID 17413)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- TOC entry 488 (class 1255 OID 17306)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- TOC entry 510 (class 1255 OID 17438)
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- TOC entry 494 (class 1255 OID 17329)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- TOC entry 481 (class 1255 OID 17220)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- TOC entry 501 (class 1255 OID 17410)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- TOC entry 500 (class 1255 OID 17409)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- TOC entry 505 (class 1255 OID 17433)
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- TOC entry 482 (class 1255 OID 17222)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- TOC entry 284 (class 1259 OID 16525)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 6102 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 301 (class 1259 OID 16929)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- TOC entry 6103 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 292 (class 1259 OID 16727)
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 6104 (class 0 OID 0)
-- Dependencies: 292
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 6105 (class 0 OID 0)
-- Dependencies: 292
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 283 (class 1259 OID 16518)
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- TOC entry 6106 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 296 (class 1259 OID 16816)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- TOC entry 6107 (class 0 OID 0)
-- Dependencies: 296
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 295 (class 1259 OID 16804)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- TOC entry 6108 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 294 (class 1259 OID 16791)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- TOC entry 6109 (class 0 OID 0)
-- Dependencies: 294
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 6110 (class 0 OID 0)
-- Dependencies: 294
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 304 (class 1259 OID 17041)
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- TOC entry 303 (class 1259 OID 17011)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- TOC entry 305 (class 1259 OID 17074)
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- TOC entry 302 (class 1259 OID 16979)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- TOC entry 282 (class 1259 OID 16507)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- TOC entry 6111 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 281 (class 1259 OID 16506)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6112 (class 0 OID 0)
-- Dependencies: 281
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 299 (class 1259 OID 16858)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- TOC entry 6113 (class 0 OID 0)
-- Dependencies: 299
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 300 (class 1259 OID 16876)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- TOC entry 6114 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 285 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- TOC entry 6115 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 293 (class 1259 OID 16757)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint
);


--
-- TOC entry 6116 (class 0 OID 0)
-- Dependencies: 293
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 6117 (class 0 OID 0)
-- Dependencies: 293
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 6118 (class 0 OID 0)
-- Dependencies: 293
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 6119 (class 0 OID 0)
-- Dependencies: 293
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 298 (class 1259 OID 16843)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- TOC entry 6120 (class 0 OID 0)
-- Dependencies: 298
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 297 (class 1259 OID 16834)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- TOC entry 6121 (class 0 OID 0)
-- Dependencies: 297
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 6122 (class 0 OID 0)
-- Dependencies: 297
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 280 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- TOC entry 6123 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 6124 (class 0 OID 0)
-- Dependencies: 280
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 324 (class 1259 OID 28801)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    organization_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 361 (class 1259 OID 29952)
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id uuid NOT NULL,
    body_html text,
    body_json jsonb,
    byline text,
    source text,
    announcement_date date,
    document_url text
);


--
-- TOC entry 325 (class 1259 OID 28809)
-- Name: auth_organization_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_organization_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    roles public.user_role[] DEFAULT ARRAY['viewer'::public.user_role] NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 326 (class 1259 OID 28818)
-- Name: auth_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text,
    type text,
    status text DEFAULT 'Active'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 327 (class 1259 OID 28828)
-- Name: auth_user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    organization_id uuid,
    role text DEFAULT 'viewer'::text,
    profile_data jsonb DEFAULT '{}'::jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_segment text NOT NULL,
    CONSTRAINT role_check CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text, 'approver'::text, 'viewer'::text]))),
    CONSTRAINT user_segment_check CHECK ((user_segment = ANY (ARRAY['internal'::text, 'partner'::text, 'customer'::text, 'advisor'::text])))
);


--
-- TOC entry 328 (class 1259 OID 28839)
-- Name: auth_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    name text,
    phone text,
    role text DEFAULT 'user'::text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    azure_sub text,
    azure_oid text
);


--
-- TOC entry 387 (class 1259 OID 30659)
-- Name: cnt_contents_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_contents_collections (
    content_id uuid NOT NULL,
    collection_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- TOC entry 386 (class 1259 OID 30646)
-- Name: cnt_contents_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_contents_tags (
    content_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- TOC entry 330 (class 1259 OID 28871)
-- Name: cnt_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text,
    event_type text,
    date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    location_id uuid,
    description text,
    organizer text,
    organizer_id uuid,
    link text,
    price text,
    is_free boolean DEFAULT true,
    capacity integer,
    registered_count integer DEFAULT 0,
    category text,
    speakers text[] DEFAULT '{}'::text[],
    topics text[] DEFAULT '{}'::text[],
    image_url text,
    status text DEFAULT 'Upcoming'::text,
    primary_sector_id uuid,
    target_stage_id uuid,
    is_virtual boolean DEFAULT false,
    virtual_link text,
    recording_url text,
    timezone text DEFAULT 'Asia/Dubai'::text,
    attendance_count integer,
    feedback_score numeric,
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- TOC entry 331 (class 1259 OID 28888)
-- Name: cnt_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_experiences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text,
    description text,
    image_url text,
    category text,
    duration text,
    price_range text,
    location text,
    location_id uuid,
    provider_id uuid,
    rating numeric,
    review_count integer DEFAULT 0,
    highlights text[] DEFAULT '{}'::text[],
    included_items text[] DEFAULT '{}'::text[],
    excluded_items text[] DEFAULT '{}'::text[],
    booking_link text,
    availability text,
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid
);


--
-- TOC entry 332 (class 1259 OID 28902)
-- Name: cnt_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    metric_code text NOT NULL,
    metric_name text NOT NULL,
    metric_type text NOT NULL,
    value_numeric numeric,
    value_text text,
    value_display text NOT NULL,
    unit text,
    category text,
    sector text,
    year integer,
    quarter integer,
    month integer,
    date date,
    period_label text,
    trend text,
    previous_value numeric,
    change_value numeric,
    change_percentage numeric,
    icon_name text,
    icon_color text,
    icon_bg_color text,
    chart_type text,
    source text,
    source_url text,
    calculation_method text,
    last_calculated timestamp with time zone,
    display_order integer,
    is_featured boolean DEFAULT false,
    label text,
    description text,
    emirate_id uuid,
    location_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT metrics_metric_type_check CHECK ((metric_type = ANY (ARRAY['economic_indicator'::text, 'impact_statistic'::text, 'regional_metric'::text, 'performance_metric'::text]))),
    CONSTRAINT metrics_trend_check CHECK ((trend = ANY (ARRAY['increasing'::text, 'decreasing'::text, 'stable'::text])))
);


--
-- TOC entry 333 (class 1259 OID 28913)
-- Name: cnt_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cnt_resources (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text,
    resource_type text,
    category text,
    description text,
    organization_id uuid,
    link text,
    file_url text,
    file_type text,
    file_size text,
    primary_sector_id uuid,
    primary_support_category_id uuid,
    target_stage_id uuid,
    language text DEFAULT 'en'::text,
    difficulty_level text,
    estimated_time text,
    download_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    completion_count integer DEFAULT 0,
    rating numeric,
    tags text[] DEFAULT '{}'::text[],
    is_free boolean DEFAULT true,
    access_level text DEFAULT 'Public'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT resources_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT resources_resource_type_check CHECK ((resource_type = ANY (ARRAY['Communities'::text, 'Resources'::text, 'Services'::text, 'Tools'::text, 'Templates'::text])))
);


--
-- TOC entry 334 (class 1259 OID 28929)
-- Name: comm_mentors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comm_mentors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    slug text,
    title text,
    organization_id uuid,
    experience text,
    expertise text[] DEFAULT '{}'::text[],
    description text,
    bio text,
    availability text,
    max_mentees integer,
    current_mentees integer DEFAULT 0,
    location text,
    languages text[] DEFAULT '{}'::text[],
    linkedin_url text,
    image_url text,
    rating numeric,
    review_count integer DEFAULT 0,
    is_available boolean DEFAULT true,
    mentorship_areas text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 355 (class 1259 OID 29182)
-- Name: wf_review_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wf_review_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_cycle_id uuid NOT NULL,
    content_id uuid NOT NULL,
    action_type character varying(50) NOT NULL,
    action_by uuid NOT NULL,
    action_by_name character varying(255) NOT NULL,
    action_reason text,
    action_notes text,
    previous_status character varying(50),
    new_status character varying(50),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT review_approval_actions_action_type_check CHECK (((action_type)::text = ANY (ARRAY[('Submit'::character varying)::text, ('Resubmit'::character varying)::text, ('Approve'::character varying)::text, ('Reject'::character varying)::text, ('Send Back'::character varying)::text, ('Publish'::character varying)::text, ('Unpublish'::character varying)::text, ('Archive'::character varying)::text, ('Restore'::character varying)::text, ('Flag for Review'::character varying)::text, ('Assign'::character varying)::text, ('Reassign'::character varying)::text])))
);


--
-- TOC entry 357 (class 1259 OID 29200)
-- Name: wf_review_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wf_review_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_cycle_id uuid NOT NULL,
    content_id uuid NOT NULL,
    author_id uuid NOT NULL,
    author_name character varying(255) NOT NULL,
    author_role character varying(50) NOT NULL,
    comment_type character varying(20) DEFAULT 'Review'::character varying NOT NULL,
    comment_text text NOT NULL,
    is_internal boolean DEFAULT false,
    mentions text[],
    attachments jsonb,
    parent_comment_id uuid,
    is_resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT review_comments_comment_type_check CHECK (((comment_type)::text = ANY (ARRAY[('Review'::character varying)::text, ('Approval'::character varying)::text, ('Rejection'::character varying)::text, ('General'::character varying)::text, ('System'::character varying)::text])))
);


--
-- TOC entry 358 (class 1259 OID 29211)
-- Name: wf_review_cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wf_review_cycles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    cycle_number integer DEFAULT 1 NOT NULL,
    status character varying(50) NOT NULL,
    assigned_reviewer_id uuid,
    assigned_reviewer_name character varying(255),
    submitted_by uuid,
    submitted_by_name character varying(255),
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejection_reason text,
    notes text,
    priority character varying(20) DEFAULT 'Normal'::character varying,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT content_review_cycles_priority_check CHECK (((priority)::text = ANY (ARRAY[('Low'::character varying)::text, ('Normal'::character varying)::text, ('High'::character varying)::text, ('Urgent'::character varying)::text]))),
    CONSTRAINT content_review_cycles_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Pending Review'::character varying)::text, ('Under Review'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Sent Back'::character varying)::text, ('Published'::character varying)::text, ('Unpublished'::character varying)::text, ('Archived'::character varying)::text])))
);


--
-- TOC entry 380 (class 1259 OID 30584)
-- Name: content_review_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.content_review_status AS
 SELECT c.id AS content_id,
    c.title,
    c.status AS content_status,
    c.created_by AS content_creator_id,
    c.created_at AS content_created_at,
    crc.id AS current_review_cycle_id,
    crc.status AS review_status,
    crc.assigned_reviewer_id,
    crc.assigned_reviewer_name,
    crc.submitted_at,
    crc.due_date,
    crc.priority,
    count(rc.id) AS comment_count,
    count(raa.id) AS action_count
   FROM (((public.cnt_contents c
     LEFT JOIN public.wf_review_cycles crc ON (((c.id = crc.content_id) AND (crc.id = ( SELECT wf_review_cycles.id
           FROM public.wf_review_cycles
          WHERE (wf_review_cycles.content_id = c.id)
          ORDER BY wf_review_cycles.cycle_number DESC
         LIMIT 1)))))
     LEFT JOIN public.wf_review_comments rc ON ((crc.id = rc.review_cycle_id)))
     LEFT JOIN public.wf_review_actions raa ON ((crc.id = raa.review_cycle_id)))
  GROUP BY c.id, c.title, c.status, c.created_by, c.created_at, crc.id, crc.status, crc.assigned_reviewer_id, crc.assigned_reviewer_name, crc.submitted_at, crc.due_date, crc.priority;


--
-- TOC entry 335 (class 1259 OID 28944)
-- Name: dim_business_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_business_stages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    stage_code text NOT NULL,
    stage_name text NOT NULL,
    description text,
    typical_characteristics jsonb DEFAULT '{}'::jsonb,
    display_order integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 336 (class 1259 OID 28954)
-- Name: dim_program_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_program_types (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    type_code text NOT NULL,
    type_name text NOT NULL,
    description text,
    target_audience text,
    typical_duration text,
    icon text,
    color text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 337 (class 1259 OID 28963)
-- Name: dim_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    sector_code text NOT NULL,
    sector_name text NOT NULL,
    description text,
    parent_sector_id uuid,
    icon text,
    color text,
    display_order integer,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 338 (class 1259 OID 28973)
-- Name: dim_support_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_support_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    category_code text NOT NULL,
    category_name text NOT NULL,
    description text,
    parent_category_id uuid,
    icon text,
    color text,
    display_order integer,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 339 (class 1259 OID 28983)
-- Name: eco_business_directory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eco_business_directory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'Private'::text,
    industry text,
    size text DEFAULT 'Medium'::text,
    status text DEFAULT 'Active'::text,
    founded_year integer,
    location text,
    website text,
    contact_email text,
    contact_phone text,
    description text,
    logo_url text,
    address jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid,
    organization_type text DEFAULT 'business'::text,
    slug text,
    logo text,
    products jsonb DEFAULT '[]'::jsonb,
    certifications text[] DEFAULT '{}'::text[],
    financials jsonb DEFAULT '{}'::jsonb,
    license_info jsonb DEFAULT '{}'::jsonb,
    business_hours jsonb DEFAULT '{}'::jsonb,
    key_people jsonb DEFAULT '[]'::jsonb,
    employees text,
    social_media jsonb DEFAULT '{}'::jsonb,
    target_markets text[] DEFAULT '{}'::text[],
    additional_locations jsonb DEFAULT '[]'::jsonb,
    members integer DEFAULT 0,
    services_offered text[] DEFAULT '{}'::text[],
    supported_emirates text[] DEFAULT '{}'::text[],
    primary_sector_id uuid,
    primary_support_category_id uuid,
    rating numeric,
    review_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    tags text[] DEFAULT '{}'::text[],
    revenue text,
    CONSTRAINT business_directory_organization_type_check CHECK ((organization_type = ANY (ARRAY['business'::text, 'support_entity'::text, 'association'::text, 'government'::text, 'ngo'::text]))),
    CONSTRAINT business_directory_size_check CHECK ((size = ANY (ARRAY['Small'::text, 'Medium'::text, 'Large'::text, 'Enterprise'::text]))),
    CONSTRAINT business_directory_status_check CHECK ((status = ANY (ARRAY['Active'::text, 'Inactive'::text, 'Pending'::text, 'Featured'::text]))),
    CONSTRAINT business_directory_type_check CHECK ((type = ANY (ARRAY['Government'::text, 'Private'::text, 'Semi-Government'::text])))
);


--
-- TOC entry 6125 (class 0 OID 0)
-- Dependencies: 339
-- Name: COLUMN eco_business_directory.revenue; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.eco_business_directory.revenue IS 'Business revenue information (nullable)';


--
-- TOC entry 340 (class 1259 OID 29011)
-- Name: eco_growth_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eco_growth_areas (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    zone_id uuid,
    description text,
    growth_type text,
    status text DEFAULT 'Active'::text,
    priority text DEFAULT 'Medium'::text,
    investment_required numeric(15,2),
    current_investment numeric(15,2) DEFAULT 0,
    timeline_months integer,
    expected_roi numeric(5,2),
    metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid,
    icon jsonb DEFAULT '{}'::jsonb,
    icon_color text,
    icon_bg_color text,
    key_statistics jsonb DEFAULT '[]'::jsonb,
    growth_projection jsonb DEFAULT '{}'::jsonb,
    associated_zones text[] DEFAULT '{}'::text[],
    key_players text[] DEFAULT '{}'::text[],
    associated_businesses text[] DEFAULT '{}'::text[],
    economic_impact jsonb DEFAULT '[]'::jsonb,
    employment jsonb DEFAULT '[]'::jsonb,
    market_trends jsonb DEFAULT '[]'::jsonb,
    comparative_analysis jsonb DEFAULT '{}'::jsonb,
    industry_breakdown jsonb DEFAULT '[]'::jsonb,
    investment_opportunities jsonb DEFAULT '[]'::jsonb,
    support_programs jsonb DEFAULT '[]'::jsonb,
    contact_information jsonb DEFAULT '{}'::jsonb,
    category text,
    growth_rate numeric,
    submitted_on timestamp with time zone,
    tags text[] DEFAULT '{}'::text[],
    CONSTRAINT growth_areas_priority_check CHECK ((priority = ANY (ARRAY['High'::text, 'Medium'::text, 'Low'::text]))),
    CONSTRAINT growth_areas_status_check CHECK ((status = ANY (ARRAY['Active'::text, 'Inactive'::text, 'Planning'::text, 'Completed'::text])))
);


--
-- TOC entry 341 (class 1259 OID 29039)
-- Name: eco_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eco_programs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    program_name text NOT NULL,
    slug text,
    organization_id uuid,
    emirate_id uuid,
    action_label text,
    link text,
    description text,
    eligibility text,
    duration text,
    program_type_id uuid,
    status text DEFAULT 'Active'::text,
    application_deadline timestamp with time zone,
    benefits text[] DEFAULT '{}'::text[],
    requirements text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- TOC entry 342 (class 1259 OID 29052)
-- Name: eco_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eco_zones (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    cluster_id uuid,
    description text,
    zone_type text,
    status text DEFAULT 'Active'::text,
    area_km2 numeric(10,2),
    capacity integer,
    current_occupancy integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid,
    location_type text DEFAULT 'economic_zone'::text,
    slug text,
    industries text[] DEFAULT '{}'::text[],
    location_details jsonb DEFAULT '{}'::jsonb,
    established_date date,
    total_area text,
    logo text,
    phone text,
    email text,
    website text,
    image_url text,
    key_features text[] DEFAULT '{}'::text[],
    regulatory_authority jsonb DEFAULT '{}'::jsonb,
    associated_businesses text[] DEFAULT '{}'::text[],
    incentives jsonb DEFAULT '[]'::jsonb,
    comparison_with_other_zones jsonb DEFAULT '{}'::jsonb,
    customer_service_center jsonb DEFAULT '{}'::jsonb,
    office_hours jsonb DEFAULT '{}'::jsonb,
    coordinates point,
    admission_fee text,
    rating numeric,
    review_count integer DEFAULT 0,
    office_services text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    zone_category text,
    parent_zone_id uuid,
    CONSTRAINT zones_location_type_check CHECK ((location_type = ANY (ARRAY['economic_zone'::text, 'office'::text, 'attraction'::text, 'landmark'::text, 'facility'::text, 'experience'::text]))),
    CONSTRAINT zones_status_check CHECK ((status = ANY (ARRAY['Active'::text, 'Inactive'::text, 'Planning'::text])))
);


--
-- TOC entry 366 (class 1259 OID 30013)
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    venue text,
    registration_url text,
    timezone text,
    mode text,
    agenda jsonb
);


--
-- TOC entry 343 (class 1259 OID 29076)
-- Name: geo_emirates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geo_emirates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    emirate_id text NOT NULL,
    emirate_name text NOT NULL,
    coordinates point,
    zoom_level integer DEFAULT 9,
    bounding_box jsonb,
    overview jsonb DEFAULT '{}'::jsonb,
    federal_enablers text[] DEFAULT '{}'::text[],
    local_enablers text[] DEFAULT '{}'::text[],
    sme_operators text[] DEFAULT '{}'::text[],
    private_sector text[] DEFAULT '{}'::text[],
    academic_partners text[] DEFAULT '{}'::text[],
    tech_support text[] DEFAULT '{}'::text[],
    geojson jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 344 (class 1259 OID 29093)
-- Name: jct_business_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_business_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    business_id uuid NOT NULL,
    sector_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 345 (class 1259 OID 29099)
-- Name: jct_business_support_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_business_support_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    business_id uuid NOT NULL,
    support_category_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    notes text,
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 346 (class 1259 OID 29108)
-- Name: jct_content_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_content_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    content_id uuid NOT NULL,
    sector_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 347 (class 1259 OID 29114)
-- Name: jct_event_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_event_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    sector_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 348 (class 1259 OID 29120)
-- Name: jct_event_support_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_event_support_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    support_category_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 349 (class 1259 OID 29125)
-- Name: jct_investment_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_investment_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    investment_id uuid NOT NULL,
    sector_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 350 (class 1259 OID 29131)
-- Name: jct_program_support_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_program_support_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    program_id uuid NOT NULL,
    support_category_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 351 (class 1259 OID 29137)
-- Name: jct_program_target_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_program_target_stages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    program_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 352 (class 1259 OID 29142)
-- Name: jct_resource_sectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jct_resource_sectors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    resource_id uuid NOT NULL,
    sector_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 369 (class 1259 OID 30053)
-- Name: media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_id uuid NOT NULL,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    kind text,
    mime text,
    size_bytes bigint,
    width integer,
    height integer,
    duration_sec integer,
    checksum text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_assets_kind_check CHECK ((kind = ANY (ARRAY['Image'::text, 'Video'::text, 'Audio'::text, 'Doc'::text])))
);


--
-- TOC entry 360 (class 1259 OID 29928)
-- Name: media_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text,
    summary text,
    status text DEFAULT 'Draft'::text NOT NULL,
    visibility text DEFAULT 'Public'::text NOT NULL,
    language text DEFAULT 'en'::text,
    published_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    seo_title text,
    seo_description text,
    canonical_url text,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    thumbnail_url text,
    domain text,
    format text,
    popularity text,
    authors jsonb DEFAULT '[]'::jsonb,
    author_slugs text[] DEFAULT '{}'::text[],
    event_time text,
    event_location_details text,
    event_registration_info text
);


--
-- TOC entry 368 (class 1259 OID 30037)
-- Name: media_taxonomies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_taxonomies (
    media_id uuid NOT NULL,
    taxonomy_id uuid NOT NULL
);


--
-- TOC entry 370 (class 1259 OID 30071)
-- Name: media_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 353 (class 1259 OID 29148)
-- Name: mktplc_investment_opportunities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mktplc_investment_opportunities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    slug text,
    sector text,
    location text,
    location_id uuid,
    investment_amount numeric,
    currency text DEFAULT 'USD'::text,
    expected_return text,
    duration text,
    description text,
    highlights text[] DEFAULT '{}'::text[],
    status text DEFAULT 'Seeking Investors'::text,
    minimum_investment numeric,
    maximum_investment numeric,
    primary_sector_id uuid,
    documents jsonb DEFAULT '[]'::jsonb,
    contact_info jsonb DEFAULT '{}'::jsonb,
    deadline timestamp with time zone,
    stage text,
    risk_level text,
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    organization_id uuid
);


--
-- TOC entry 371 (class 1259 OID 30439)
-- Name: mktplc_service_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mktplc_service_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    comment_text text NOT NULL,
    comment_type character varying(20) DEFAULT 'Review'::character varying NOT NULL,
    author_id uuid NOT NULL,
    author_name character varying(255) NOT NULL,
    author_role character varying(50) NOT NULL,
    author_email character varying(255),
    review_cycle_id uuid,
    is_internal boolean DEFAULT false,
    visibility character varying(20) DEFAULT 'All'::character varying,
    parent_comment_id uuid,
    mentions text[],
    is_resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    attachments jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    related_status_change character varying(50),
    action_type character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    organization_id uuid,
    CONSTRAINT mktplc_service_comments_comment_type_check CHECK (((comment_type)::text = ANY ((ARRAY['Review'::character varying, 'Approval'::character varying, 'Rejection'::character varying, 'General'::character varying, 'System'::character varying, 'action_note'::character varying, 'Revision'::character varying])::text[]))),
    CONSTRAINT mktplc_service_comments_visibility_check CHECK ((lower((visibility)::text) = ANY (ARRAY['all'::text, 'internal'::text, 'partner'::text, 'approver'::text])))
);


--
-- TOC entry 6126 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE mktplc_service_comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.mktplc_service_comments IS 'Stores review comments and feedback for marketplace services';


--
-- TOC entry 6127 (class 0 OID 0)
-- Dependencies: 371
-- Name: COLUMN mktplc_service_comments.is_resolved; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mktplc_service_comments.is_resolved IS 'Indicates if a rejection comment has been resolved by the service creator';


--
-- TOC entry 6128 (class 0 OID 0)
-- Dependencies: 371
-- Name: COLUMN mktplc_service_comments.resolved_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mktplc_service_comments.resolved_by IS 'User ID who resolved the rejection comment';


--
-- TOC entry 6129 (class 0 OID 0)
-- Dependencies: 371
-- Name: COLUMN mktplc_service_comments.resolved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mktplc_service_comments.resolved_at IS 'Timestamp when the rejection comment was resolved';


--
-- TOC entry 354 (class 1259 OID 29164)
-- Name: mktplc_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mktplc_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    type text DEFAULT 'Non-Financial'::text,
    partner_id uuid,
    partner_name text,
    category text,
    processing_time text,
    status text DEFAULT 'Draft'::text,
    applicants integer DEFAULT 0,
    feedback jsonb DEFAULT '{}'::jsonb,
    submitted_on timestamp with time zone,
    published_on timestamp with time zone,
    description text,
    eligibility text[],
    application_requirements text[],
    fee text,
    regulatory_category text,
    documents_required text[],
    outcome text,
    partner_info jsonb DEFAULT '{}'::jsonb,
    comments jsonb DEFAULT '[]'::jsonb,
    activity_log jsonb DEFAULT '[]'::jsonb,
    created_by uuid,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid,
    service_category text,
    service_subtype text,
    price_range text,
    features text[] DEFAULT '{}'::text[],
    rating numeric,
    review_count integer DEFAULT 0,
    provider_id uuid,
    tags text[] DEFAULT '{}'::text[],
    empowerment_and_leadership text[],
    industry text[],
    key_terms_of_service text,
    service_mode text[],
    registration_validity text,
    related_services text[],
    CONSTRAINT services_status_check CHECK ((status = ANY (ARRAY['Draft'::text, 'Pending'::text, 'Published'::text, 'Rejected'::text, 'Sent Back'::text, 'Unpublished'::text, 'Archived'::text]))),
    CONSTRAINT services_type_check CHECK ((type = ANY (ARRAY['Financial'::text, 'Non-Financial'::text])))
);


--
-- TOC entry 363 (class 1259 OID 29976)
-- Name: podcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcasts (
    id uuid NOT NULL,
    audio_url text,
    is_video_episode boolean DEFAULT false,
    episode_no integer,
    duration_sec integer,
    transcript_url text
);


--
-- TOC entry 364 (class 1259 OID 29989)
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid NOT NULL,
    document_url text,
    pages integer,
    file_size_mb numeric,
    highlights jsonb,
    toc jsonb
);


--
-- TOC entry 367 (class 1259 OID 30025)
-- Name: taxonomies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taxonomies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kind text NOT NULL,
    label text NOT NULL,
    key text NOT NULL,
    description text,
    archived boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    allowed_media_types jsonb,
    CONSTRAINT taxonomies_kind_check CHECK ((kind = ANY (ARRAY['Domain'::text, 'Stage'::text, 'Format'::text, 'Tag'::text, 'Popularity'::text])))
);


--
-- TOC entry 365 (class 1259 OID 30001)
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id uuid NOT NULL,
    document_url text,
    requirements text,
    file_size_mb numeric
);


--
-- TOC entry 378 (class 1259 OID 30569)
-- Name: txn_collection_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_collection_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    language_code character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    base_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 377 (class 1259 OID 30558)
-- Name: txn_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_root boolean DEFAULT false NOT NULL,
    "position" integer NOT NULL,
    is_private boolean DEFAULT false NOT NULL,
    filters text NOT NULL,
    inherit_filters boolean DEFAULT true NOT NULL,
    parent_id uuid,
    featured_asset_id uuid,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 374 (class 1259 OID 30540)
-- Name: txn_facet_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_facet_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    language_code character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    base_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 372 (class 1259 OID 30527)
-- Name: txn_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.txn_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    value character varying(255) NOT NULL,
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 381 (class 1259 OID 30589)
-- Name: v_cnt_active_events; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_cnt_active_events AS
 SELECT id,
    title,
    slug,
    event_type,
    date,
    end_date,
    location,
    location_id,
    description,
    organizer,
    organizer_id,
    link,
    price,
    is_free,
    capacity,
    registered_count,
    category,
    speakers,
    topics,
    image_url,
    status,
    primary_sector_id,
    target_stage_id,
    is_virtual,
    virtual_link,
    recording_url,
    timezone,
    attendance_count,
    feedback_score,
    metadata,
    tags,
    created_at,
    updated_at,
    created_by
   FROM public.cnt_events
  WHERE ((status = 'Upcoming'::text) AND (date >= CURRENT_DATE))
  ORDER BY date;


--
-- TOC entry 382 (class 1259 OID 30594)
-- Name: v_cnt_metrics_latest; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_cnt_metrics_latest AS
 SELECT DISTINCT ON (metric_code) id,
    metric_code,
    metric_name,
    metric_type,
    value_numeric,
    value_text,
    value_display,
    unit,
    category,
    sector,
    year,
    quarter,
    month,
    date,
    period_label,
    trend,
    previous_value,
    change_value,
    change_percentage,
    icon_name,
    icon_color,
    icon_bg_color,
    chart_type,
    source,
    source_url,
    calculation_method,
    last_calculated,
    display_order,
    is_featured,
    label,
    description,
    emirate_id,
    location_id,
    metadata,
    tags,
    created_at,
    updated_at
   FROM public.cnt_metrics
  ORDER BY metric_code, year DESC NULLS LAST, quarter DESC NULLS LAST, month DESC NULLS LAST, date DESC NULLS LAST;


--
-- TOC entry 383 (class 1259 OID 30599)
-- Name: v_media_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_media_public AS
 SELECT id,
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
    event_mode,
    event_agenda,
    domain,
    authors,
    author_slugs
   FROM public.v_media_all
  WHERE ((status = 'Published'::text) AND (visibility = 'Public'::text) AND ((published_at IS NULL) OR (published_at <= now())));


--
-- TOC entry 384 (class 1259 OID 30604)
-- Name: v_media_public_grid; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_media_public_grid AS
 SELECT id,
    title,
    COALESCE(NULLIF(summary, ''::text), NULLIF("left"(regexp_replace(COALESCE(body_html, ''::text), '<[^>]*>'::text, ''::text, 'g'::text), 240), ''::text)) AS summary,
    thumbnail_url,
    type,
    tags,
    published_at,
    start_at,
    registration_url,
    COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
   FROM public.v_media_public;


--
-- TOC entry 362 (class 1259 OID 29964)
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid NOT NULL,
    video_url text,
    platform text,
    duration_sec integer,
    transcript_url text
);


--
-- TOC entry 356 (class 1259 OID 29189)
-- Name: wf_review_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wf_review_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_cycle_id uuid NOT NULL,
    content_id uuid NOT NULL,
    assigned_reviewer_id uuid NOT NULL,
    assigned_reviewer_name character varying(255) NOT NULL,
    assignment_type character varying(20) DEFAULT 'Primary'::character varying NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_by_name character varying(255) NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    due_date timestamp with time zone,
    status character varying(20) DEFAULT 'Assigned'::character varying NOT NULL,
    completion_notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT review_assignments_assignment_type_check CHECK (((assignment_type)::text = ANY (ARRAY[('Primary'::character varying)::text, ('Secondary'::character varying)::text, ('Backup'::character varying)::text]))),
    CONSTRAINT review_assignments_status_check CHECK (((status)::text = ANY (ARRAY[('Assigned'::character varying)::text, ('Accepted'::character varying)::text, ('In Progress'::character varying)::text, ('Completed'::character varying)::text, ('Declined'::character varying)::text, ('Reassigned'::character varying)::text])))
);


--
-- TOC entry 359 (class 1259 OID 29222)
-- Name: wf_review_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wf_review_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_name character varying(255) NOT NULL,
    content_type character varying(50) NOT NULL,
    workflow_steps jsonb NOT NULL,
    approval_threshold integer DEFAULT 1,
    auto_approve_after_days integer,
    requires_editor_approval boolean DEFAULT true,
    requires_admin_approval boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- TOC entry 315 (class 1259 OID 17389)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- TOC entry 306 (class 1259 OID 17112)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- TOC entry 309 (class 1259 OID 17135)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- TOC entry 308 (class 1259 OID 17134)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 286 (class 1259 OID 16546)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- TOC entry 6130 (class 0 OID 0)
-- Dependencies: 286
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 316 (class 1259 OID 17422)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 288 (class 1259 OID 16588)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 287 (class 1259 OID 16561)
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- TOC entry 6131 (class 0 OID 0)
-- Dependencies: 287
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 314 (class 1259 OID 17309)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 312 (class 1259 OID 17245)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- TOC entry 313 (class 1259 OID 17259)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 317 (class 1259 OID 17455)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- TOC entry 318 (class 1259 OID 17462)
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- TOC entry 4801 (class 2604 OID 16510)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 5295 (class 2606 OID 16829)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 5249 (class 2606 OID 16531)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5318 (class 2606 OID 16935)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 5273 (class 2606 OID 16953)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 5275 (class 2606 OID 16963)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 5247 (class 2606 OID 16524)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 5297 (class 2606 OID 16822)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 5293 (class 2606 OID 16810)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 5285 (class 2606 OID 17003)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 5287 (class 2606 OID 16797)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 5331 (class 2606 OID 17062)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 5333 (class 2606 OID 17060)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 5335 (class 2606 OID 17058)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 5328 (class 2606 OID 17022)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 5339 (class 2606 OID 17084)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 5341 (class 2606 OID 17086)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 5322 (class 2606 OID 16988)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5241 (class 2606 OID 16514)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5244 (class 2606 OID 16740)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 5307 (class 2606 OID 16869)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 5309 (class 2606 OID 16867)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5314 (class 2606 OID 16883)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 5252 (class 2606 OID 16537)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 5280 (class 2606 OID 16761)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5304 (class 2606 OID 16850)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 5299 (class 2606 OID 16841)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5234 (class 2606 OID 16923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 5236 (class 2606 OID 16501)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5369 (class 2606 OID 29397)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5602 (class 2606 OID 29958)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- TOC entry 5375 (class 2606 OID 29398)
-- Name: auth_organization_members auth_organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_organization_members
    ADD CONSTRAINT auth_organization_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5377 (class 2606 OID 29438)
-- Name: auth_organization_members auth_organization_members_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_organization_members
    ADD CONSTRAINT auth_organization_members_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- TOC entry 5382 (class 2606 OID 29399)
-- Name: auth_organizations auth_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_organizations
    ADD CONSTRAINT auth_organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 5384 (class 2606 OID 29400)
-- Name: auth_user_profiles auth_user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_profiles
    ADD CONSTRAINT auth_user_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5386 (class 2606 OID 29449)
-- Name: auth_user_profiles auth_user_profiles_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_profiles
    ADD CONSTRAINT auth_user_profiles_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- TOC entry 5391 (class 2606 OID 29452)
-- Name: auth_users auth_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_email_key UNIQUE (email);


--
-- TOC entry 5393 (class 2606 OID 29401)
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5474 (class 2606 OID 29412)
-- Name: eco_business_directory business_directory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_business_directory
    ADD CONSTRAINT business_directory_pkey PRIMARY KEY (id);


--
-- TOC entry 5504 (class 2606 OID 29634)
-- Name: jct_business_sectors business_sectors_business_id_sector_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_sectors
    ADD CONSTRAINT business_sectors_business_id_sector_id_key UNIQUE (business_id, sector_id);


--
-- TOC entry 5506 (class 2606 OID 29417)
-- Name: jct_business_sectors business_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_sectors
    ADD CONSTRAINT business_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5510 (class 2606 OID 29640)
-- Name: jct_business_support_categories business_support_categories_business_id_support_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_support_categories
    ADD CONSTRAINT business_support_categories_business_id_support_category_id_key UNIQUE (business_id, support_category_id);


--
-- TOC entry 5512 (class 2606 OID 29418)
-- Name: jct_business_support_categories business_support_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_support_categories
    ADD CONSTRAINT business_support_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5645 (class 2606 OID 30664)
-- Name: cnt_contents_collections cnt_contents_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_collections
    ADD CONSTRAINT cnt_contents_collections_pkey PRIMARY KEY (content_id, collection_id);


--
-- TOC entry 5637 (class 2606 OID 30638)
-- Name: cnt_contents_facet_values cnt_contents_facet_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_facet_values
    ADD CONSTRAINT cnt_contents_facet_values_pkey PRIMARY KEY (content_id, facet_value_id);


--
-- TOC entry 5641 (class 2606 OID 30651)
-- Name: cnt_contents_tags cnt_contents_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_tags
    ADD CONSTRAINT cnt_contents_tags_pkey PRIMARY KEY (content_id, tag_id);


--
-- TOC entry 5583 (class 2606 OID 29431)
-- Name: wf_review_cycles content_review_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_cycles
    ADD CONSTRAINT content_review_cycles_pkey PRIMARY KEY (id);


--
-- TOC entry 5516 (class 2606 OID 29646)
-- Name: jct_content_sectors content_sectors_content_id_sector_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_content_sectors
    ADD CONSTRAINT content_sectors_content_id_sector_id_key UNIQUE (content_id, sector_id);


--
-- TOC entry 5518 (class 2606 OID 29419)
-- Name: jct_content_sectors content_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_content_sectors
    ADD CONSTRAINT content_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5398 (class 2606 OID 29402)
-- Name: cnt_contents contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id);


--
-- TOC entry 5452 (class 2606 OID 29408)
-- Name: dim_business_stages dim_business_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_business_stages
    ADD CONSTRAINT dim_business_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 5454 (class 2606 OID 29560)
-- Name: dim_business_stages dim_business_stages_stage_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_business_stages
    ADD CONSTRAINT dim_business_stages_stage_code_key UNIQUE (stage_code);


--
-- TOC entry 5457 (class 2606 OID 29409)
-- Name: dim_program_types dim_program_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_program_types
    ADD CONSTRAINT dim_program_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5459 (class 2606 OID 29561)
-- Name: dim_program_types dim_program_types_type_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_program_types
    ADD CONSTRAINT dim_program_types_type_code_key UNIQUE (type_code);


--
-- TOC entry 5462 (class 2606 OID 29410)
-- Name: dim_sectors dim_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_sectors
    ADD CONSTRAINT dim_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5464 (class 2606 OID 29567)
-- Name: dim_sectors dim_sectors_sector_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_sectors
    ADD CONSTRAINT dim_sectors_sector_code_key UNIQUE (sector_code);


--
-- TOC entry 5468 (class 2606 OID 29568)
-- Name: dim_support_categories dim_support_categories_category_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_support_categories
    ADD CONSTRAINT dim_support_categories_category_code_key UNIQUE (category_code);


--
-- TOC entry 5470 (class 2606 OID 29411)
-- Name: dim_support_categories dim_support_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_support_categories
    ADD CONSTRAINT dim_support_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5500 (class 2606 OID 29633)
-- Name: geo_emirates emirates_emirate_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geo_emirates
    ADD CONSTRAINT emirates_emirate_id_key UNIQUE (emirate_id);


--
-- TOC entry 5502 (class 2606 OID 29416)
-- Name: geo_emirates emirates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geo_emirates
    ADD CONSTRAINT emirates_pkey PRIMARY KEY (id);


--
-- TOC entry 5520 (class 2606 OID 29652)
-- Name: jct_event_sectors event_sectors_event_id_sector_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_sectors
    ADD CONSTRAINT event_sectors_event_id_sector_id_key UNIQUE (event_id, sector_id);


--
-- TOC entry 5522 (class 2606 OID 29420)
-- Name: jct_event_sectors event_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_sectors
    ADD CONSTRAINT event_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5524 (class 2606 OID 29658)
-- Name: jct_event_support_categories event_support_categories_event_id_support_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_support_categories
    ADD CONSTRAINT event_support_categories_event_id_support_category_id_key UNIQUE (event_id, support_category_id);


--
-- TOC entry 5526 (class 2606 OID 29421)
-- Name: jct_event_support_categories event_support_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_support_categories
    ADD CONSTRAINT event_support_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5419 (class 2606 OID 29403)
-- Name: cnt_events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5612 (class 2606 OID 30019)
-- Name: events events_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5421 (class 2606 OID 29496)
-- Name: cnt_events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- TOC entry 5427 (class 2606 OID 29404)
-- Name: cnt_experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- TOC entry 5429 (class 2606 OID 29517)
-- Name: cnt_experiences experiences_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_experiences
    ADD CONSTRAINT experiences_slug_key UNIQUE (slug);


--
-- TOC entry 5482 (class 2606 OID 29413)
-- Name: eco_growth_areas growth_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_growth_areas
    ADD CONSTRAINT growth_areas_pkey PRIMARY KEY (id);


--
-- TOC entry 5550 (class 2606 OID 29426)
-- Name: mktplc_investment_opportunities investment_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_investment_opportunities
    ADD CONSTRAINT investment_opportunities_pkey PRIMARY KEY (id);


--
-- TOC entry 5552 (class 2606 OID 29698)
-- Name: mktplc_investment_opportunities investment_opportunities_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_investment_opportunities
    ADD CONSTRAINT investment_opportunities_slug_key UNIQUE (slug);


--
-- TOC entry 5528 (class 2606 OID 29664)
-- Name: jct_investment_sectors investment_sectors_investment_id_sector_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_investment_sectors
    ADD CONSTRAINT investment_sectors_investment_id_sector_id_key UNIQUE (investment_id, sector_id);


--
-- TOC entry 5530 (class 2606 OID 29422)
-- Name: jct_investment_sectors investment_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_investment_sectors
    ADD CONSTRAINT investment_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5623 (class 2606 OID 30062)
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 5598 (class 2606 OID 29943)
-- Name: media_items media_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5600 (class 2606 OID 29945)
-- Name: media_items media_items_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_slug_key UNIQUE (slug);


--
-- TOC entry 5618 (class 2606 OID 30041)
-- Name: media_taxonomies media_taxonomies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_taxonomies
    ADD CONSTRAINT media_taxonomies_pkey PRIMARY KEY (media_id, taxonomy_id);


--
-- TOC entry 5627 (class 2606 OID 30077)
-- Name: media_views media_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_views
    ADD CONSTRAINT media_views_pkey PRIMARY KEY (id);


--
-- TOC entry 5448 (class 2606 OID 29407)
-- Name: comm_mentors mentors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comm_mentors
    ADD CONSTRAINT mentors_pkey PRIMARY KEY (id);


--
-- TOC entry 5450 (class 2606 OID 29559)
-- Name: comm_mentors mentors_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comm_mentors
    ADD CONSTRAINT mentors_slug_key UNIQUE (slug);


--
-- TOC entry 5437 (class 2606 OID 29405)
-- Name: cnt_metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 5439 (class 2606 OID 29530)
-- Name: cnt_metrics metrics_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_metrics
    ADD CONSTRAINT metrics_unique UNIQUE NULLS NOT DISTINCT (metric_code, year, quarter, month, date);


--
-- TOC entry 5635 (class 2606 OID 30456)
-- Name: mktplc_service_comments mktplc_service_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_service_comments
    ADD CONSTRAINT mktplc_service_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5606 (class 2606 OID 29983)
-- Name: podcasts podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_pkey PRIMARY KEY (id);


--
-- TOC entry 5534 (class 2606 OID 29423)
-- Name: jct_program_support_categories program_support_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_support_categories
    ADD CONSTRAINT program_support_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5536 (class 2606 OID 29680)
-- Name: jct_program_support_categories program_support_categories_program_id_support_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_support_categories
    ADD CONSTRAINT program_support_categories_program_id_support_category_id_key UNIQUE (program_id, support_category_id);


--
-- TOC entry 5540 (class 2606 OID 29424)
-- Name: jct_program_target_stages program_target_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_target_stages
    ADD CONSTRAINT program_target_stages_pkey PRIMARY KEY (id);


--
-- TOC entry 5542 (class 2606 OID 29686)
-- Name: jct_program_target_stages program_target_stages_program_id_stage_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_target_stages
    ADD CONSTRAINT program_target_stages_program_id_stage_id_key UNIQUE (program_id, stage_id);


--
-- TOC entry 5489 (class 2606 OID 29414)
-- Name: eco_programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- TOC entry 5491 (class 2606 OID 29620)
-- Name: eco_programs programs_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_programs
    ADD CONSTRAINT programs_slug_key UNIQUE (slug);


--
-- TOC entry 5608 (class 2606 OID 29995)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5544 (class 2606 OID 29425)
-- Name: jct_resource_sectors resource_sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_resource_sectors
    ADD CONSTRAINT resource_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5546 (class 2606 OID 29692)
-- Name: jct_resource_sectors resource_sectors_resource_id_sector_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_resource_sectors
    ADD CONSTRAINT resource_sectors_resource_id_sector_id_key UNIQUE (resource_id, sector_id);


--
-- TOC entry 5444 (class 2606 OID 29406)
-- Name: cnt_resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- TOC entry 5446 (class 2606 OID 29548)
-- Name: cnt_resources resources_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT resources_slug_key UNIQUE (slug);


--
-- TOC entry 5567 (class 2606 OID 29428)
-- Name: wf_review_actions review_approval_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_actions
    ADD CONSTRAINT review_approval_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5574 (class 2606 OID 29429)
-- Name: wf_review_assignments review_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_assignments
    ADD CONSTRAINT review_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5581 (class 2606 OID 29430)
-- Name: wf_review_comments review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_comments
    ADD CONSTRAINT review_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5590 (class 2606 OID 29432)
-- Name: wf_review_templates review_workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_templates
    ADD CONSTRAINT review_workflow_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5560 (class 2606 OID 29427)
-- Name: mktplc_services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 5614 (class 2606 OID 30035)
-- Name: taxonomies taxonomies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxonomies
    ADD CONSTRAINT taxonomies_pkey PRIMARY KEY (id);


--
-- TOC entry 5610 (class 2606 OID 30007)
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- TOC entry 5604 (class 2606 OID 29970)
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- TOC entry 5498 (class 2606 OID 29415)
-- Name: eco_zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5359 (class 2606 OID 17403)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5347 (class 2606 OID 17143)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 5344 (class 2606 OID 17116)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 5361 (class 2606 OID 17432)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5255 (class 2606 OID 16554)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 16595)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 5267 (class 2606 OID 16593)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5263 (class 2606 OID 16571)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 5356 (class 2606 OID 17319)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 5353 (class 2606 OID 17268)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 5351 (class 2606 OID 17253)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 5363 (class 2606 OID 17461)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 5365 (class 2606 OID 17468)
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- TOC entry 5250 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 5224 (class 1259 OID 16750)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 5225 (class 1259 OID 16752)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 5226 (class 1259 OID 16753)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 5283 (class 1259 OID 16831)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 5316 (class 1259 OID 16939)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 5271 (class 1259 OID 16919)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 6132 (class 0 OID 0)
-- Dependencies: 5271
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 5276 (class 1259 OID 16747)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 5319 (class 1259 OID 16936)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 5320 (class 1259 OID 16937)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 5291 (class 1259 OID 16942)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 5288 (class 1259 OID 16803)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 5289 (class 1259 OID 16948)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 5329 (class 1259 OID 17073)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 5326 (class 1259 OID 17026)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 5336 (class 1259 OID 17099)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 5337 (class 1259 OID 17097)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 5342 (class 1259 OID 17098)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 5323 (class 1259 OID 16995)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 5324 (class 1259 OID 16994)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 5325 (class 1259 OID 16996)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 5227 (class 1259 OID 16754)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 5228 (class 1259 OID 16751)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 5237 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 5238 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 5239 (class 1259 OID 16746)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 5242 (class 1259 OID 16833)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 5245 (class 1259 OID 16938)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 5310 (class 1259 OID 16875)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 5311 (class 1259 OID 16940)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 5312 (class 1259 OID 16890)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 5315 (class 1259 OID 16889)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 5277 (class 1259 OID 16941)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 5278 (class 1259 OID 17111)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 5281 (class 1259 OID 16832)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 5302 (class 1259 OID 16857)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 5305 (class 1259 OID 16856)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 5300 (class 1259 OID 16842)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 5301 (class 1259 OID 17004)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 5290 (class 1259 OID 17001)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 5282 (class 1259 OID 16830)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 5229 (class 1259 OID 16910)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 6133 (class 0 OID 0)
-- Dependencies: 5229
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 5230 (class 1259 OID 16748)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 5231 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 5232 (class 1259 OID 16965)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 5370 (class 1259 OID 29270)
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- TOC entry 5371 (class 1259 OID 29271)
-- Name: idx_activity_logs_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs USING btree (entity_type);


--
-- TOC entry 5372 (class 1259 OID 29272)
-- Name: idx_activity_logs_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_organisation_id ON public.activity_logs USING btree (organization_id);


--
-- TOC entry 5373 (class 1259 OID 29273)
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- TOC entry 5378 (class 1259 OID 29274)
-- Name: idx_aom_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aom_org ON public.auth_organization_members USING btree (organization_id);


--
-- TOC entry 5379 (class 1259 OID 29275)
-- Name: idx_aom_roles_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aom_roles_gin ON public.auth_organization_members USING gin (roles);


--
-- TOC entry 5380 (class 1259 OID 29276)
-- Name: idx_aom_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aom_user ON public.auth_organization_members USING btree (user_id);


--
-- TOC entry 5387 (class 1259 OID 29277)
-- Name: idx_auth_user_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_user_profiles_role ON public.auth_user_profiles USING btree (role);


--
-- TOC entry 5388 (class 1259 OID 29278)
-- Name: idx_auth_user_profiles_segment_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_user_profiles_segment_role ON public.auth_user_profiles USING btree (user_segment, role);


--
-- TOC entry 5389 (class 1259 OID 29279)
-- Name: idx_auth_user_profiles_user_segment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_user_profiles_user_segment ON public.auth_user_profiles USING btree (user_segment);


--
-- TOC entry 5394 (class 1259 OID 29280)
-- Name: idx_auth_users_azure_oid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_auth_users_azure_oid ON public.auth_users USING btree (azure_oid) WHERE (azure_oid IS NOT NULL);


--
-- TOC entry 5395 (class 1259 OID 29281)
-- Name: idx_auth_users_azure_sub; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_auth_users_azure_sub ON public.auth_users USING btree (azure_sub) WHERE (azure_sub IS NOT NULL);


--
-- TOC entry 5396 (class 1259 OID 29282)
-- Name: idx_auth_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_users_email ON public.auth_users USING btree (email);


--
-- TOC entry 5507 (class 1259 OID 29283)
-- Name: idx_bus_sectors_business; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bus_sectors_business ON public.jct_business_sectors USING btree (business_id);


--
-- TOC entry 5508 (class 1259 OID 29284)
-- Name: idx_bus_sectors_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bus_sectors_sector ON public.jct_business_sectors USING btree (sector_id);


--
-- TOC entry 5513 (class 1259 OID 29285)
-- Name: idx_bus_support_business; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bus_support_business ON public.jct_business_support_categories USING btree (business_id);


--
-- TOC entry 5514 (class 1259 OID 29286)
-- Name: idx_bus_support_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bus_support_category ON public.jct_business_support_categories USING btree (support_category_id);


--
-- TOC entry 5646 (class 1259 OID 30671)
-- Name: idx_cnt_contents_collections_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_collections_collection_id ON public.cnt_contents_collections USING btree (collection_id);


--
-- TOC entry 5647 (class 1259 OID 30670)
-- Name: idx_cnt_contents_collections_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_collections_content_id ON public.cnt_contents_collections USING btree (content_id);


--
-- TOC entry 5638 (class 1259 OID 30644)
-- Name: idx_cnt_contents_facet_values_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_facet_values_content_id ON public.cnt_contents_facet_values USING btree (content_id);


--
-- TOC entry 5639 (class 1259 OID 30645)
-- Name: idx_cnt_contents_facet_values_facet_value_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_facet_values_facet_value_id ON public.cnt_contents_facet_values USING btree (facet_value_id);


--
-- TOC entry 5399 (class 1259 OID 29287)
-- Name: idx_cnt_contents_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_featured ON public.cnt_contents USING btree (is_featured);


--
-- TOC entry 5400 (class 1259 OID 29288)
-- Name: idx_cnt_contents_flag_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_flag_count ON public.cnt_contents USING btree (flag_count);


--
-- TOC entry 5401 (class 1259 OID 29289)
-- Name: idx_cnt_contents_flagged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_flagged_at ON public.cnt_contents USING btree (flagged_at);


--
-- TOC entry 5402 (class 1259 OID 29290)
-- Name: idx_cnt_contents_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_organisation_id ON public.cnt_contents USING btree (organization_id);


--
-- TOC entry 5403 (class 1259 OID 29291)
-- Name: idx_cnt_contents_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_published ON public.cnt_contents USING btree (published_at);


--
-- TOC entry 5404 (class 1259 OID 29292)
-- Name: idx_cnt_contents_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_sector ON public.cnt_contents USING btree (primary_sector_id);


--
-- TOC entry 5405 (class 1259 OID 29293)
-- Name: idx_cnt_contents_subtype; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_subtype ON public.cnt_contents USING btree (content_subtype);


--
-- TOC entry 5642 (class 1259 OID 30657)
-- Name: idx_cnt_contents_tags_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_tags_content_id ON public.cnt_contents_tags USING btree (content_id);


--
-- TOC entry 5643 (class 1259 OID 30658)
-- Name: idx_cnt_contents_tags_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_tags_tag_id ON public.cnt_contents_tags USING btree (tag_id);


--
-- TOC entry 5406 (class 1259 OID 29294)
-- Name: idx_cnt_contents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_contents_type ON public.cnt_contents USING btree (content_type);


--
-- TOC entry 5422 (class 1259 OID 29295)
-- Name: idx_cnt_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_events_date ON public.cnt_events USING btree (date);


--
-- TOC entry 5423 (class 1259 OID 29296)
-- Name: idx_cnt_events_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_events_location ON public.cnt_events USING btree (location_id);


--
-- TOC entry 5424 (class 1259 OID 29297)
-- Name: idx_cnt_events_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_events_org ON public.cnt_events USING btree (organizer_id);


--
-- TOC entry 5425 (class 1259 OID 29298)
-- Name: idx_cnt_events_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_events_sector ON public.cnt_events USING btree (primary_sector_id);


--
-- TOC entry 5430 (class 1259 OID 29299)
-- Name: idx_cnt_metrics_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_category ON public.cnt_metrics USING btree (category);


--
-- TOC entry 5431 (class 1259 OID 29300)
-- Name: idx_cnt_metrics_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_code ON public.cnt_metrics USING btree (metric_code);


--
-- TOC entry 5432 (class 1259 OID 29301)
-- Name: idx_cnt_metrics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_date ON public.cnt_metrics USING btree (date);


--
-- TOC entry 5433 (class 1259 OID 29302)
-- Name: idx_cnt_metrics_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_featured ON public.cnt_metrics USING btree (is_featured);


--
-- TOC entry 5434 (class 1259 OID 29303)
-- Name: idx_cnt_metrics_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_type ON public.cnt_metrics USING btree (metric_type);


--
-- TOC entry 5435 (class 1259 OID 29304)
-- Name: idx_cnt_metrics_year_quarter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_metrics_year_quarter ON public.cnt_metrics USING btree (year, quarter);


--
-- TOC entry 5440 (class 1259 OID 29305)
-- Name: idx_cnt_resources_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_resources_org ON public.cnt_resources USING btree (organization_id);


--
-- TOC entry 5441 (class 1259 OID 29306)
-- Name: idx_cnt_resources_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_resources_sector ON public.cnt_resources USING btree (primary_sector_id);


--
-- TOC entry 5442 (class 1259 OID 29307)
-- Name: idx_cnt_resources_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cnt_resources_type ON public.cnt_resources USING btree (resource_type);


--
-- TOC entry 5584 (class 1259 OID 29308)
-- Name: idx_content_review_cycles_assigned_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_review_cycles_assigned_reviewer ON public.wf_review_cycles USING btree (assigned_reviewer_id);


--
-- TOC entry 5585 (class 1259 OID 29309)
-- Name: idx_content_review_cycles_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_review_cycles_content_id ON public.wf_review_cycles USING btree (content_id);


--
-- TOC entry 5586 (class 1259 OID 29310)
-- Name: idx_content_review_cycles_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_review_cycles_due_date ON public.wf_review_cycles USING btree (due_date);


--
-- TOC entry 5587 (class 1259 OID 29311)
-- Name: idx_content_review_cycles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_review_cycles_status ON public.wf_review_cycles USING btree (status);


--
-- TOC entry 5588 (class 1259 OID 29312)
-- Name: idx_content_review_cycles_submitted_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_review_cycles_submitted_by ON public.wf_review_cycles USING btree (submitted_by);


--
-- TOC entry 5407 (class 1259 OID 29313)
-- Name: idx_contents_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_author_id ON public.cnt_contents USING btree (author_id);


--
-- TOC entry 5408 (class 1259 OID 29314)
-- Name: idx_contents_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_category ON public.cnt_contents USING btree (category);


--
-- TOC entry 5409 (class 1259 OID 29315)
-- Name: idx_contents_content_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_content_type ON public.cnt_contents USING btree (content_type);


--
-- TOC entry 5410 (class 1259 OID 29316)
-- Name: idx_contents_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_featured ON public.cnt_contents USING btree (is_featured);


--
-- TOC entry 5411 (class 1259 OID 29317)
-- Name: idx_contents_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_organisation_id ON public.cnt_contents USING btree (organization_id);


--
-- TOC entry 5412 (class 1259 OID 29318)
-- Name: idx_contents_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_published_at ON public.cnt_contents USING btree (published_at);


--
-- TOC entry 5413 (class 1259 OID 29319)
-- Name: idx_contents_sector_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_sector_id ON public.cnt_contents USING btree (primary_sector_id);


--
-- TOC entry 5414 (class 1259 OID 29320)
-- Name: idx_contents_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_contents_slug ON public.cnt_contents USING btree (slug) WHERE (slug IS NOT NULL);


--
-- TOC entry 5415 (class 1259 OID 29321)
-- Name: idx_contents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_status ON public.cnt_contents USING btree (status);


--
-- TOC entry 5416 (class 1259 OID 29322)
-- Name: idx_contents_subtype; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_subtype ON public.cnt_contents USING btree (content_subtype);


--
-- TOC entry 5417 (class 1259 OID 29323)
-- Name: idx_contents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contents_type ON public.cnt_contents USING btree (content_type);


--
-- TOC entry 5455 (class 1259 OID 29324)
-- Name: idx_dim_business_stages_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_business_stages_code ON public.dim_business_stages USING btree (stage_code);


--
-- TOC entry 5460 (class 1259 OID 29325)
-- Name: idx_dim_program_types_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_program_types_code ON public.dim_program_types USING btree (type_code);


--
-- TOC entry 5465 (class 1259 OID 29326)
-- Name: idx_dim_sectors_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_sectors_code ON public.dim_sectors USING btree (sector_code);


--
-- TOC entry 5466 (class 1259 OID 29327)
-- Name: idx_dim_sectors_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_sectors_parent ON public.dim_sectors USING btree (parent_sector_id);


--
-- TOC entry 5471 (class 1259 OID 29328)
-- Name: idx_dim_support_categories_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_support_categories_code ON public.dim_support_categories USING btree (category_code);


--
-- TOC entry 5472 (class 1259 OID 29329)
-- Name: idx_dim_support_categories_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_support_categories_parent ON public.dim_support_categories USING btree (parent_category_id);


--
-- TOC entry 5475 (class 1259 OID 29330)
-- Name: idx_eco_business_directory_org_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_org_type ON public.eco_business_directory USING btree (organization_type);


--
-- TOC entry 5476 (class 1259 OID 29331)
-- Name: idx_eco_business_directory_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_organisation_id ON public.eco_business_directory USING btree (organization_id);


--
-- TOC entry 5477 (class 1259 OID 29332)
-- Name: idx_eco_business_directory_primary_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_primary_sector ON public.eco_business_directory USING btree (primary_sector_id);


--
-- TOC entry 5478 (class 1259 OID 29333)
-- Name: idx_eco_business_directory_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_slug ON public.eco_business_directory USING btree (slug) WHERE (slug IS NOT NULL);


--
-- TOC entry 5479 (class 1259 OID 29334)
-- Name: idx_eco_business_directory_support_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_support_cat ON public.eco_business_directory USING btree (primary_support_category_id);


--
-- TOC entry 5480 (class 1259 OID 29335)
-- Name: idx_eco_business_directory_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_business_directory_tags ON public.eco_business_directory USING gin (tags);


--
-- TOC entry 5483 (class 1259 OID 29336)
-- Name: idx_eco_growth_areas_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_growth_areas_organisation_id ON public.eco_growth_areas USING btree (organization_id);


--
-- TOC entry 5485 (class 1259 OID 29337)
-- Name: idx_eco_programs_emirate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_programs_emirate ON public.eco_programs USING btree (emirate_id);


--
-- TOC entry 5486 (class 1259 OID 29338)
-- Name: idx_eco_programs_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_programs_org ON public.eco_programs USING btree (organization_id);


--
-- TOC entry 5487 (class 1259 OID 29339)
-- Name: idx_eco_programs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_programs_type ON public.eco_programs USING btree (program_type_id);


--
-- TOC entry 5492 (class 1259 OID 29340)
-- Name: idx_eco_zones_coordinates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_zones_coordinates ON public.eco_zones USING gist (coordinates);


--
-- TOC entry 5493 (class 1259 OID 29341)
-- Name: idx_eco_zones_location_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_zones_location_type ON public.eco_zones USING btree (location_type);


--
-- TOC entry 5494 (class 1259 OID 29342)
-- Name: idx_eco_zones_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_zones_organisation_id ON public.eco_zones USING btree (organization_id);


--
-- TOC entry 5495 (class 1259 OID 29343)
-- Name: idx_eco_zones_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_zones_slug ON public.eco_zones USING btree (slug) WHERE (slug IS NOT NULL);


--
-- TOC entry 5496 (class 1259 OID 29344)
-- Name: idx_eco_zones_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eco_zones_tags ON public.eco_zones USING gin (tags);


--
-- TOC entry 5484 (class 1259 OID 29345)
-- Name: idx_growth_areas_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_growth_areas_organisation_id ON public.eco_growth_areas USING btree (organization_id);


--
-- TOC entry 5619 (class 1259 OID 30069)
-- Name: idx_media_assets_kind; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_assets_kind ON public.media_assets USING btree (kind);


--
-- TOC entry 5620 (class 1259 OID 30070)
-- Name: idx_media_assets_public_url_not_null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_assets_public_url_not_null ON public.media_assets USING btree (public_url) WHERE (public_url IS NOT NULL);


--
-- TOC entry 5591 (class 1259 OID 29948)
-- Name: idx_media_items_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_domain ON public.media_items USING btree (domain) WHERE (domain IS NOT NULL);


--
-- TOC entry 5592 (class 1259 OID 29949)
-- Name: idx_media_items_format; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_format ON public.media_items USING btree (format) WHERE (format IS NOT NULL);


--
-- TOC entry 5593 (class 1259 OID 29950)
-- Name: idx_media_items_popularity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_popularity ON public.media_items USING btree (popularity) WHERE (popularity IS NOT NULL);


--
-- TOC entry 5594 (class 1259 OID 29946)
-- Name: idx_media_items_pub_grid_keyset; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_pub_grid_keyset ON public.media_items USING btree (published_at DESC, id DESC) WHERE ((status = 'Published'::text) AND (visibility = 'Public'::text) AND (published_at IS NOT NULL));


--
-- TOC entry 5595 (class 1259 OID 29947)
-- Name: idx_media_items_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_published_at ON public.media_items USING btree (published_at DESC);


--
-- TOC entry 5596 (class 1259 OID 29951)
-- Name: idx_media_items_tags_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_items_tags_gin ON public.media_items USING gin (tags);


--
-- TOC entry 5616 (class 1259 OID 30052)
-- Name: idx_media_taxonomies_taxonomy_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_taxonomies_taxonomy_id ON public.media_taxonomies USING btree (taxonomy_id);


--
-- TOC entry 5624 (class 1259 OID 30083)
-- Name: idx_media_views_media_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_views_media_id ON public.media_views USING btree (media_id);


--
-- TOC entry 5625 (class 1259 OID 30084)
-- Name: idx_media_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_views_viewed_at ON public.media_views USING btree (viewed_at DESC);


--
-- TOC entry 5547 (class 1259 OID 29346)
-- Name: idx_mktplc_investment_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mktplc_investment_location ON public.mktplc_investment_opportunities USING btree (location_id);


--
-- TOC entry 5548 (class 1259 OID 29347)
-- Name: idx_mktplc_investment_sector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mktplc_investment_sector ON public.mktplc_investment_opportunities USING btree (primary_sector_id);


--
-- TOC entry 5553 (class 1259 OID 29348)
-- Name: idx_mktplc_services_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mktplc_services_organisation_id ON public.mktplc_services USING btree (organization_id);


--
-- TOC entry 5537 (class 1259 OID 29349)
-- Name: idx_prog_stages_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prog_stages_program ON public.jct_program_target_stages USING btree (program_id);


--
-- TOC entry 5538 (class 1259 OID 29350)
-- Name: idx_prog_stages_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prog_stages_stage ON public.jct_program_target_stages USING btree (stage_id);


--
-- TOC entry 5531 (class 1259 OID 29351)
-- Name: idx_prog_support_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prog_support_category ON public.jct_program_support_categories USING btree (support_category_id);


--
-- TOC entry 5532 (class 1259 OID 29352)
-- Name: idx_prog_support_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prog_support_program ON public.jct_program_support_categories USING btree (program_id);


--
-- TOC entry 5561 (class 1259 OID 29353)
-- Name: idx_review_approval_actions_action_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_approval_actions_action_by ON public.wf_review_actions USING btree (action_by);


--
-- TOC entry 5562 (class 1259 OID 29354)
-- Name: idx_review_approval_actions_action_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_approval_actions_action_type ON public.wf_review_actions USING btree (action_type);


--
-- TOC entry 5563 (class 1259 OID 29355)
-- Name: idx_review_approval_actions_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_approval_actions_content_id ON public.wf_review_actions USING btree (content_id);


--
-- TOC entry 5564 (class 1259 OID 29356)
-- Name: idx_review_approval_actions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_approval_actions_created_at ON public.wf_review_actions USING btree (created_at);


--
-- TOC entry 5565 (class 1259 OID 29357)
-- Name: idx_review_approval_actions_review_cycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_approval_actions_review_cycle_id ON public.wf_review_actions USING btree (review_cycle_id);


--
-- TOC entry 5568 (class 1259 OID 29358)
-- Name: idx_review_assignments_assigned_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_assignments_assigned_reviewer ON public.wf_review_assignments USING btree (assigned_reviewer_id);


--
-- TOC entry 5569 (class 1259 OID 29359)
-- Name: idx_review_assignments_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_assignments_content_id ON public.wf_review_assignments USING btree (content_id);


--
-- TOC entry 5570 (class 1259 OID 29360)
-- Name: idx_review_assignments_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_assignments_due_date ON public.wf_review_assignments USING btree (due_date);


--
-- TOC entry 5571 (class 1259 OID 29361)
-- Name: idx_review_assignments_review_cycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_assignments_review_cycle_id ON public.wf_review_assignments USING btree (review_cycle_id);


--
-- TOC entry 5572 (class 1259 OID 29362)
-- Name: idx_review_assignments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_assignments_status ON public.wf_review_assignments USING btree (status);


--
-- TOC entry 5575 (class 1259 OID 29363)
-- Name: idx_review_comments_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_comments_author_id ON public.wf_review_comments USING btree (author_id);


--
-- TOC entry 5576 (class 1259 OID 29364)
-- Name: idx_review_comments_comment_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_comments_comment_type ON public.wf_review_comments USING btree (comment_type);


--
-- TOC entry 5577 (class 1259 OID 29365)
-- Name: idx_review_comments_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_comments_content_id ON public.wf_review_comments USING btree (content_id);


--
-- TOC entry 5578 (class 1259 OID 29366)
-- Name: idx_review_comments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_comments_created_at ON public.wf_review_comments USING btree (created_at);


--
-- TOC entry 5579 (class 1259 OID 29367)
-- Name: idx_review_comments_review_cycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_comments_review_cycle_id ON public.wf_review_comments USING btree (review_cycle_id);


--
-- TOC entry 5628 (class 1259 OID 30468)
-- Name: idx_service_comments_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_author_id ON public.mktplc_service_comments USING btree (author_id);


--
-- TOC entry 5629 (class 1259 OID 30469)
-- Name: idx_service_comments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_created_at ON public.mktplc_service_comments USING btree (created_at DESC);


--
-- TOC entry 5630 (class 1259 OID 30470)
-- Name: idx_service_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_parent_id ON public.mktplc_service_comments USING btree (parent_comment_id);


--
-- TOC entry 5631 (class 1259 OID 30471)
-- Name: idx_service_comments_review_cycle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_review_cycle ON public.mktplc_service_comments USING btree (review_cycle_id) WHERE (review_cycle_id IS NOT NULL);


--
-- TOC entry 5632 (class 1259 OID 30467)
-- Name: idx_service_comments_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_service_id ON public.mktplc_service_comments USING btree (service_id);


--
-- TOC entry 5633 (class 1259 OID 30928)
-- Name: idx_service_comments_unresolved_rejections; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_comments_unresolved_rejections ON public.mktplc_service_comments USING btree (service_id, comment_type, is_resolved) WHERE (((comment_type)::text = 'Rejection'::text) AND (is_resolved = false));


--
-- TOC entry 5554 (class 1259 OID 29368)
-- Name: idx_services_organisation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_organisation_id ON public.mktplc_services USING btree (organization_id);


--
-- TOC entry 5555 (class 1259 OID 29369)
-- Name: idx_services_partner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_partner_id ON public.mktplc_services USING btree (partner_id);


--
-- TOC entry 5556 (class 1259 OID 29370)
-- Name: idx_services_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_status ON public.mktplc_services USING btree (status);


--
-- TOC entry 5557 (class 1259 OID 29371)
-- Name: idx_services_submitted_on; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_submitted_on ON public.mktplc_services USING btree (submitted_on);


--
-- TOC entry 5558 (class 1259 OID 29372)
-- Name: idx_services_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_type ON public.mktplc_services USING btree (type);


--
-- TOC entry 5621 (class 1259 OID 30068)
-- Name: media_assets_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_media_id_idx ON public.media_assets USING btree (media_id);


--
-- TOC entry 5615 (class 1259 OID 30036)
-- Name: uq_taxonomies_kind_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_taxonomies_kind_key ON public.taxonomies USING btree (kind, key);


--
-- TOC entry 5345 (class 1259 OID 17404)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 5357 (class 1259 OID 17405)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 5348 (class 1259 OID 17196)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 5253 (class 1259 OID 16560)
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 5256 (class 1259 OID 16582)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 5349 (class 1259 OID 17280)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 5257 (class 1259 OID 17351)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 5258 (class 1259 OID 17243)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 5259 (class 1259 OID 17407)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 5354 (class 1259 OID 17408)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 5260 (class 1259 OID 16583)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 5261 (class 1259 OID 17406)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 5750 (class 2620 OID 30378)
-- Name: cnt_contents trg_cnt_contents_slug_normalize; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cnt_contents_slug_normalize BEFORE INSERT OR UPDATE OF slug, title ON public.cnt_contents FOR EACH ROW EXECUTE FUNCTION public.enforce_slug_normalization();


--
-- TOC entry 5760 (class 2620 OID 30109)
-- Name: media_items trg_media_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_media_items_set_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5761 (class 2620 OID 30110)
-- Name: media_items trg_media_items_slug_normalize; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_media_items_slug_normalize BEFORE INSERT OR UPDATE OF slug, title ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.enforce_slug_normalization();


--
-- TOC entry 5752 (class 2620 OID 29886)
-- Name: eco_business_directory update_business_directory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_directory_updated_at BEFORE UPDATE ON public.eco_business_directory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5758 (class 2620 OID 29892)
-- Name: wf_review_cycles update_content_review_cycles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_review_cycles_updated_at BEFORE UPDATE ON public.wf_review_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5751 (class 2620 OID 29885)
-- Name: cnt_contents update_contents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.cnt_contents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5753 (class 2620 OID 29887)
-- Name: eco_growth_areas update_growth_areas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_growth_areas_updated_at BEFORE UPDATE ON public.eco_growth_areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5756 (class 2620 OID 29890)
-- Name: wf_review_assignments update_review_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_review_assignments_updated_at BEFORE UPDATE ON public.wf_review_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5757 (class 2620 OID 29891)
-- Name: wf_review_comments update_review_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_review_comments_updated_at BEFORE UPDATE ON public.wf_review_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5759 (class 2620 OID 29893)
-- Name: wf_review_templates update_review_workflow_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_review_workflow_templates_updated_at BEFORE UPDATE ON public.wf_review_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5755 (class 2620 OID 29889)
-- Name: mktplc_services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.mktplc_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5754 (class 2620 OID 29888)
-- Name: eco_zones update_zones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.eco_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5747 (class 2620 OID 17148)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 5742 (class 2620 OID 17415)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 5743 (class 2620 OID 17445)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5744 (class 2620 OID 17333)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 5745 (class 2620 OID 17444)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 5748 (class 2620 OID 17411)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 5749 (class 2620 OID 17446)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5746 (class 2620 OID 17223)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 5650 (class 2606 OID 16734)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5655 (class 2606 OID 16823)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5654 (class 2606 OID 16811)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 5653 (class 2606 OID 16798)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5661 (class 2606 OID 17063)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 5662 (class 2606 OID 17068)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5663 (class 2606 OID 17092)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 5664 (class 2606 OID 17087)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5660 (class 2606 OID 16989)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5648 (class 2606 OID 16767)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5657 (class 2606 OID 16870)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5658 (class 2606 OID 16943)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 5659 (class 2606 OID 16884)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5651 (class 2606 OID 17106)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 5652 (class 2606 OID 16762)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5656 (class 2606 OID 16851)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5727 (class 2606 OID 29959)
-- Name: articles articles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5669 (class 2606 OID 29433)
-- Name: auth_organization_members auth_organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_organization_members
    ADD CONSTRAINT auth_organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5670 (class 2606 OID 29439)
-- Name: auth_user_profiles auth_user_profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_profiles
    ADD CONSTRAINT auth_user_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5671 (class 2606 OID 29444)
-- Name: auth_user_profiles auth_user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_profiles
    ADD CONSTRAINT auth_user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- TOC entry 5693 (class 2606 OID 29575)
-- Name: eco_business_directory business_directory_primary_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_business_directory
    ADD CONSTRAINT business_directory_primary_sector_id_fkey FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5694 (class 2606 OID 29580)
-- Name: eco_business_directory business_directory_primary_support_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_business_directory
    ADD CONSTRAINT business_directory_primary_support_category_id_fkey FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id);


--
-- TOC entry 5741 (class 2606 OID 30665)
-- Name: cnt_contents_collections cnt_contents_collections_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_collections
    ADD CONSTRAINT cnt_contents_collections_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5672 (class 2606 OID 29453)
-- Name: cnt_contents cnt_contents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT cnt_contents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.auth_users(id) ON DELETE SET NULL;


--
-- TOC entry 5739 (class 2606 OID 30639)
-- Name: cnt_contents_facet_values cnt_contents_facet_values_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_facet_values
    ADD CONSTRAINT cnt_contents_facet_values_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5673 (class 2606 OID 29458)
-- Name: cnt_contents cnt_contents_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT cnt_contents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5740 (class 2606 OID 30652)
-- Name: cnt_contents_tags cnt_contents_tags_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents_tags
    ADD CONSTRAINT cnt_contents_tags_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5677 (class 2606 OID 29481)
-- Name: cnt_events cnt_events_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT cnt_events_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);


--
-- TOC entry 5678 (class 2606 OID 29486)
-- Name: cnt_events cnt_events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT cnt_events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.eco_business_directory(id);


--
-- TOC entry 5681 (class 2606 OID 29502)
-- Name: cnt_experiences cnt_experiences_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_experiences
    ADD CONSTRAINT cnt_experiences_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);


--
-- TOC entry 5682 (class 2606 OID 29507)
-- Name: cnt_experiences cnt_experiences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_experiences
    ADD CONSTRAINT cnt_experiences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5683 (class 2606 OID 29512)
-- Name: cnt_experiences cnt_experiences_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_experiences
    ADD CONSTRAINT cnt_experiences_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.eco_business_directory(id);


--
-- TOC entry 5684 (class 2606 OID 29518)
-- Name: cnt_metrics cnt_metrics_emirate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_metrics
    ADD CONSTRAINT cnt_metrics_emirate_id_fkey FOREIGN KEY (emirate_id) REFERENCES public.geo_emirates(id);


--
-- TOC entry 5685 (class 2606 OID 29523)
-- Name: cnt_metrics cnt_metrics_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_metrics
    ADD CONSTRAINT cnt_metrics_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);


--
-- TOC entry 5686 (class 2606 OID 29531)
-- Name: cnt_resources cnt_resources_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT cnt_resources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5690 (class 2606 OID 29554)
-- Name: comm_mentors comm_mentors_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comm_mentors
    ADD CONSTRAINT comm_mentors_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5726 (class 2606 OID 29765)
-- Name: wf_review_cycles content_review_cycles_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_cycles
    ADD CONSTRAINT content_review_cycles_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5674 (class 2606 OID 29465)
-- Name: cnt_contents contents_primary_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT contents_primary_sector_id_fkey FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5675 (class 2606 OID 29470)
-- Name: cnt_contents contents_primary_support_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT contents_primary_support_category_id_fkey FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id);


--
-- TOC entry 5676 (class 2606 OID 29476)
-- Name: cnt_contents contents_target_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_contents
    ADD CONSTRAINT contents_target_stage_id_fkey FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id);


--
-- TOC entry 5691 (class 2606 OID 29562)
-- Name: dim_sectors dim_sectors_parent_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_sectors
    ADD CONSTRAINT dim_sectors_parent_sector_id_fkey FOREIGN KEY (parent_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5692 (class 2606 OID 29569)
-- Name: dim_support_categories dim_support_categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_support_categories
    ADD CONSTRAINT dim_support_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.dim_support_categories(id);


--
-- TOC entry 5695 (class 2606 OID 29588)
-- Name: eco_business_directory eco_business_directory_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_business_directory
    ADD CONSTRAINT eco_business_directory_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5696 (class 2606 OID 29593)
-- Name: eco_growth_areas eco_growth_areas_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_growth_areas
    ADD CONSTRAINT eco_growth_areas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5698 (class 2606 OID 29605)
-- Name: eco_programs eco_programs_emirate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_programs
    ADD CONSTRAINT eco_programs_emirate_id_fkey FOREIGN KEY (emirate_id) REFERENCES public.geo_emirates(id);


--
-- TOC entry 5699 (class 2606 OID 29610)
-- Name: eco_programs eco_programs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_programs
    ADD CONSTRAINT eco_programs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5701 (class 2606 OID 29621)
-- Name: eco_zones eco_zones_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_zones
    ADD CONSTRAINT eco_zones_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5702 (class 2606 OID 29626)
-- Name: eco_zones eco_zones_parent_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_zones
    ADD CONSTRAINT eco_zones_parent_zone_id_fkey FOREIGN KEY (parent_zone_id) REFERENCES public.eco_zones(id);


--
-- TOC entry 5732 (class 2606 OID 30020)
-- Name: events events_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5679 (class 2606 OID 29491)
-- Name: cnt_events events_primary_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT events_primary_sector_id_fkey FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5680 (class 2606 OID 29497)
-- Name: cnt_events events_target_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_events
    ADD CONSTRAINT events_target_stage_id_fkey FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id);


--
-- TOC entry 5697 (class 2606 OID 29600)
-- Name: eco_growth_areas growth_areas_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_growth_areas
    ADD CONSTRAINT growth_areas_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.eco_zones(id) ON DELETE SET NULL;


--
-- TOC entry 5713 (class 2606 OID 29693)
-- Name: mktplc_investment_opportunities investment_opportunities_primary_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_investment_opportunities
    ADD CONSTRAINT investment_opportunities_primary_sector_id_fkey FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5703 (class 2606 OID 29635)
-- Name: jct_business_sectors jct_business_sectors_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_sectors
    ADD CONSTRAINT jct_business_sectors_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.eco_business_directory(id) ON DELETE CASCADE;


--
-- TOC entry 5704 (class 2606 OID 29641)
-- Name: jct_business_support_categories jct_business_support_categories_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_business_support_categories
    ADD CONSTRAINT jct_business_support_categories_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.eco_business_directory(id) ON DELETE CASCADE;


--
-- TOC entry 5705 (class 2606 OID 29647)
-- Name: jct_content_sectors jct_content_sectors_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_content_sectors
    ADD CONSTRAINT jct_content_sectors_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5706 (class 2606 OID 29653)
-- Name: jct_event_sectors jct_event_sectors_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_sectors
    ADD CONSTRAINT jct_event_sectors_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.cnt_events(id) ON DELETE CASCADE;


--
-- TOC entry 5707 (class 2606 OID 29659)
-- Name: jct_event_support_categories jct_event_support_categories_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_event_support_categories
    ADD CONSTRAINT jct_event_support_categories_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.cnt_events(id) ON DELETE CASCADE;


--
-- TOC entry 5708 (class 2606 OID 29665)
-- Name: jct_investment_sectors jct_investment_sectors_investment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_investment_sectors
    ADD CONSTRAINT jct_investment_sectors_investment_id_fkey FOREIGN KEY (investment_id) REFERENCES public.mktplc_investment_opportunities(id) ON DELETE CASCADE;


--
-- TOC entry 5709 (class 2606 OID 29670)
-- Name: jct_investment_sectors jct_investment_sectors_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_investment_sectors
    ADD CONSTRAINT jct_investment_sectors_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.dim_sectors(id) ON DELETE CASCADE;


--
-- TOC entry 5710 (class 2606 OID 29675)
-- Name: jct_program_support_categories jct_program_support_categories_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_support_categories
    ADD CONSTRAINT jct_program_support_categories_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.eco_programs(id) ON DELETE CASCADE;


--
-- TOC entry 5711 (class 2606 OID 29681)
-- Name: jct_program_target_stages jct_program_target_stages_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_program_target_stages
    ADD CONSTRAINT jct_program_target_stages_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.eco_programs(id) ON DELETE CASCADE;


--
-- TOC entry 5712 (class 2606 OID 29687)
-- Name: jct_resource_sectors jct_resource_sectors_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jct_resource_sectors
    ADD CONSTRAINT jct_resource_sectors_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.cnt_resources(id) ON DELETE CASCADE;


--
-- TOC entry 5735 (class 2606 OID 30063)
-- Name: media_assets media_assets_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5733 (class 2606 OID 30042)
-- Name: media_taxonomies media_taxonomies_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_taxonomies
    ADD CONSTRAINT media_taxonomies_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5734 (class 2606 OID 30047)
-- Name: media_taxonomies media_taxonomies_taxonomy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_taxonomies
    ADD CONSTRAINT media_taxonomies_taxonomy_id_fkey FOREIGN KEY (taxonomy_id) REFERENCES public.taxonomies(id) ON DELETE CASCADE;


--
-- TOC entry 5736 (class 2606 OID 30078)
-- Name: media_views media_views_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_views
    ADD CONSTRAINT media_views_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5714 (class 2606 OID 29699)
-- Name: mktplc_investment_opportunities mktplc_investment_opportunities_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_investment_opportunities
    ADD CONSTRAINT mktplc_investment_opportunities_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.eco_zones(id);


--
-- TOC entry 5715 (class 2606 OID 29704)
-- Name: mktplc_investment_opportunities mktplc_investment_opportunities_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_investment_opportunities
    ADD CONSTRAINT mktplc_investment_opportunities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5737 (class 2606 OID 30462)
-- Name: mktplc_service_comments mktplc_service_comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_service_comments
    ADD CONSTRAINT mktplc_service_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.mktplc_service_comments(id) ON DELETE CASCADE;


--
-- TOC entry 5738 (class 2606 OID 30457)
-- Name: mktplc_service_comments mktplc_service_comments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_service_comments
    ADD CONSTRAINT mktplc_service_comments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.mktplc_services(id) ON DELETE CASCADE;


--
-- TOC entry 5716 (class 2606 OID 29709)
-- Name: mktplc_services mktplc_services_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_services
    ADD CONSTRAINT mktplc_services_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5729 (class 2606 OID 29984)
-- Name: podcasts podcasts_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5700 (class 2606 OID 29615)
-- Name: eco_programs programs_program_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eco_programs
    ADD CONSTRAINT programs_program_type_id_fkey FOREIGN KEY (program_type_id) REFERENCES public.dim_program_types(id);


--
-- TOC entry 5730 (class 2606 OID 29996)
-- Name: reports reports_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5687 (class 2606 OID 29537)
-- Name: cnt_resources resources_primary_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT resources_primary_sector_id_fkey FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id);


--
-- TOC entry 5688 (class 2606 OID 29542)
-- Name: cnt_resources resources_primary_support_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT resources_primary_support_category_id_fkey FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id);


--
-- TOC entry 5689 (class 2606 OID 29549)
-- Name: cnt_resources resources_target_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cnt_resources
    ADD CONSTRAINT resources_target_stage_id_fkey FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id);


--
-- TOC entry 5719 (class 2606 OID 29727)
-- Name: wf_review_actions review_approval_actions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_actions
    ADD CONSTRAINT review_approval_actions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5720 (class 2606 OID 29732)
-- Name: wf_review_actions review_approval_actions_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_actions
    ADD CONSTRAINT review_approval_actions_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE;


--
-- TOC entry 5721 (class 2606 OID 29738)
-- Name: wf_review_assignments review_assignments_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_assignments
    ADD CONSTRAINT review_assignments_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5722 (class 2606 OID 29743)
-- Name: wf_review_assignments review_assignments_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_assignments
    ADD CONSTRAINT review_assignments_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE;


--
-- TOC entry 5723 (class 2606 OID 29750)
-- Name: wf_review_comments review_comments_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_comments
    ADD CONSTRAINT review_comments_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE;


--
-- TOC entry 5724 (class 2606 OID 29755)
-- Name: wf_review_comments review_comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_comments
    ADD CONSTRAINT review_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.wf_review_comments(id);


--
-- TOC entry 5725 (class 2606 OID 29760)
-- Name: wf_review_comments review_comments_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wf_review_comments
    ADD CONSTRAINT review_comments_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE;


--
-- TOC entry 5717 (class 2606 OID 29714)
-- Name: mktplc_services services_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_services
    ADD CONSTRAINT services_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.eco_business_directory(id) ON DELETE SET NULL;


--
-- TOC entry 5718 (class 2606 OID 29719)
-- Name: mktplc_services services_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mktplc_services
    ADD CONSTRAINT services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.eco_business_directory(id);


--
-- TOC entry 5731 (class 2606 OID 30008)
-- Name: tools tools_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5728 (class 2606 OID 29971)
-- Name: videos videos_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_id_fkey FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- TOC entry 5649 (class 2606 OID 16572)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5668 (class 2606 OID 17320)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5665 (class 2606 OID 17254)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5666 (class 2606 OID 17275)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5667 (class 2606 OID 17269)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 5924 (class 0 OID 16525)
-- Dependencies: 284
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5938 (class 0 OID 16929)
-- Dependencies: 301
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5929 (class 0 OID 16727)
-- Dependencies: 292
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5923 (class 0 OID 16518)
-- Dependencies: 283
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5933 (class 0 OID 16816)
-- Dependencies: 296
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5932 (class 0 OID 16804)
-- Dependencies: 295
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5931 (class 0 OID 16791)
-- Dependencies: 294
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5939 (class 0 OID 16979)
-- Dependencies: 302
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5922 (class 0 OID 16507)
-- Dependencies: 282
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5936 (class 0 OID 16858)
-- Dependencies: 299
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5937 (class 0 OID 16876)
-- Dependencies: 300
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5925 (class 0 OID 16533)
-- Dependencies: 285
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5930 (class 0 OID 16757)
-- Dependencies: 293
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5935 (class 0 OID 16843)
-- Dependencies: 298
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5934 (class 0 OID 16834)
-- Dependencies: 297
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5921 (class 0 OID 16495)
-- Dependencies: 280
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5979 (class 3256 OID 29825)
-- Name: auth_user_profiles Allow profile lookup during login; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow profile lookup during login" ON public.auth_user_profiles FOR SELECT USING (true);


--
-- TOC entry 5986 (class 3256 OID 29832)
-- Name: cnt_events Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.cnt_events FOR SELECT USING (true);


--
-- TOC entry 5987 (class 3256 OID 29833)
-- Name: cnt_experiences Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.cnt_experiences FOR SELECT USING (true);


--
-- TOC entry 5991 (class 3256 OID 29837)
-- Name: cnt_metrics Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.cnt_metrics FOR SELECT USING (true);


--
-- TOC entry 5992 (class 3256 OID 29838)
-- Name: cnt_resources Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.cnt_resources FOR SELECT USING (true);


--
-- TOC entry 5996 (class 3256 OID 29842)
-- Name: comm_mentors Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.comm_mentors FOR SELECT USING (true);


--
-- TOC entry 6012 (class 3256 OID 29863)
-- Name: eco_programs Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.eco_programs FOR SELECT USING (true);


--
-- TOC entry 6023 (class 3256 OID 29872)
-- Name: mktplc_investment_opportunities Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.mktplc_investment_opportunities FOR SELECT USING (true);


--
-- TOC entry 6040 (class 3256 OID 29884)
-- Name: wf_review_cycles Users can create review cycles for their content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create review cycles for their content" ON public.wf_review_cycles FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cnt_contents c
  WHERE ((c.id = wf_review_cycles.content_id) AND (c.created_by = auth.uid())))));


--
-- TOC entry 5980 (class 3256 OID 29826)
-- Name: auth_user_profiles Users can update their own profile metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile metadata" ON public.auth_user_profiles FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 5981 (class 3256 OID 29827)
-- Name: auth_user_profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.auth_user_profiles FOR SELECT USING (((user_id = auth.uid()) OR (auth.role() = 'service_role'::text)));


--
-- TOC entry 5945 (class 0 OID 28801)
-- Dependencies: 324
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5988 (class 3256 OID 29834)
-- Name: cnt_experiences admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.cnt_experiences USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 5993 (class 3256 OID 29839)
-- Name: cnt_resources admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.cnt_resources USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 5997 (class 3256 OID 29843)
-- Name: comm_mentors admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.comm_mentors USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6001 (class 3256 OID 29847)
-- Name: eco_business_directory admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.eco_business_directory USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6004 (class 3256 OID 29855)
-- Name: eco_growth_areas admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.eco_growth_areas USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6013 (class 3256 OID 29864)
-- Name: eco_programs admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.eco_programs USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6017 (class 3256 OID 29868)
-- Name: eco_zones admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.eco_zones USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6024 (class 3256 OID 29873)
-- Name: mktplc_investment_opportunities admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.mktplc_investment_opportunities USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 6027 (class 3256 OID 29876)
-- Name: mktplc_services admin_override; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_override ON public.mktplc_services USING ((current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text)) WITH CHECK (true);


--
-- TOC entry 5965 (class 0 OID 29952)
-- Dependencies: 361
-- Name: articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5946 (class 0 OID 28828)
-- Dependencies: 327
-- Name: auth_user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auth_user_profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 6018 (class 3256 OID 30123)
-- Name: articles authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.articles FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6056 (class 3256 OID 30133)
-- Name: events authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.events FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6062 (class 3256 OID 30139)
-- Name: media_assets authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.media_assets FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6051 (class 3256 OID 30121)
-- Name: media_items authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.media_items FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6060 (class 3256 OID 30137)
-- Name: media_taxonomies authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.media_taxonomies FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6064 (class 3256 OID 30141)
-- Name: media_views authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.media_views FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6037 (class 3256 OID 30127)
-- Name: podcasts authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.podcasts FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6039 (class 3256 OID 30129)
-- Name: reports authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.reports FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6058 (class 3256 OID 30135)
-- Name: taxonomies authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.taxonomies FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6054 (class 3256 OID 30131)
-- Name: tools authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.tools FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6028 (class 3256 OID 30125)
-- Name: videos authenticated_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all ON public.videos FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6079 (class 3256 OID 30770)
-- Name: cnt_contents_collections authenticated_read_all_collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all_collections ON public.cnt_contents_collections FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6075 (class 3256 OID 30766)
-- Name: cnt_contents_facet_values authenticated_read_all_facets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all_facets ON public.cnt_contents_facet_values FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6077 (class 3256 OID 30768)
-- Name: cnt_contents_tags authenticated_read_all_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_read_all_tags ON public.cnt_contents_tags FOR SELECT USING (public._is_authenticated());


--
-- TOC entry 6019 (class 3256 OID 30124)
-- Name: articles authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.articles USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6057 (class 3256 OID 30134)
-- Name: events authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.events USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6063 (class 3256 OID 30140)
-- Name: media_assets authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.media_assets USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6052 (class 3256 OID 30122)
-- Name: media_items authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.media_items USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6061 (class 3256 OID 30138)
-- Name: media_taxonomies authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.media_taxonomies USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6065 (class 3256 OID 30142)
-- Name: media_views authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.media_views USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6038 (class 3256 OID 30128)
-- Name: podcasts authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.podcasts USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6053 (class 3256 OID 30130)
-- Name: reports authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.reports USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6059 (class 3256 OID 30136)
-- Name: taxonomies authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.taxonomies USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6055 (class 3256 OID 30132)
-- Name: tools authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.tools USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6029 (class 3256 OID 30126)
-- Name: videos authenticated_write_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all ON public.videos USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6080 (class 3256 OID 30771)
-- Name: cnt_contents_collections authenticated_write_all_collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all_collections ON public.cnt_contents_collections USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6076 (class 3256 OID 30767)
-- Name: cnt_contents_facet_values authenticated_write_all_facets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all_facets ON public.cnt_contents_facet_values USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6078 (class 3256 OID 30769)
-- Name: cnt_contents_tags authenticated_write_all_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY authenticated_write_all_tags ON public.cnt_contents_tags USING (public._is_authenticated()) WITH CHECK (public._is_authenticated());


--
-- TOC entry 6070 (class 3256 OID 30291)
-- Name: eco_business_directory business_directory_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_directory_delete_policy ON public.eco_business_directory FOR DELETE USING (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);


--
-- TOC entry 6134 (class 0 OID 0)
-- Dependencies: 6070
-- Name: POLICY business_directory_delete_policy ON eco_business_directory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY business_directory_delete_policy ON public.eco_business_directory IS 'RLS policy for business directory table deletes - staff only';


--
-- TOC entry 6067 (class 3256 OID 30288)
-- Name: eco_business_directory business_directory_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_directory_insert_policy ON public.eco_business_directory FOR INSERT WITH CHECK (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);


--
-- TOC entry 6135 (class 0 OID 0)
-- Dependencies: 6067
-- Name: POLICY business_directory_insert_policy ON eco_business_directory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY business_directory_insert_policy ON public.eco_business_directory IS 'RLS policy for business directory table inserts - uses get_org_id_from_claim() to map organization_name to organization_id';


--
-- TOC entry 6068 (class 3256 OID 30289)
-- Name: eco_business_directory business_directory_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_directory_select_policy ON public.eco_business_directory FOR SELECT USING (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);


--
-- TOC entry 6136 (class 0 OID 0)
-- Dependencies: 6068
-- Name: POLICY business_directory_select_policy ON eco_business_directory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY business_directory_select_policy ON public.eco_business_directory IS 'RLS policy for business directory table selects - organization scoped for partners, all access for staff';


--
-- TOC entry 6069 (class 3256 OID 30290)
-- Name: eco_business_directory business_directory_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY business_directory_update_policy ON public.eco_business_directory FOR UPDATE USING (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END) WITH CHECK (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);


--
-- TOC entry 6137 (class 0 OID 0)
-- Dependencies: 6069
-- Name: POLICY business_directory_update_policy ON eco_business_directory; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY business_directory_update_policy ON public.eco_business_directory IS 'RLS policy for business directory table updates - organization scoped for partners, all access for staff';


--
-- TOC entry 5947 (class 0 OID 28850)
-- Dependencies: 329
-- Name: cnt_contents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_contents ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5977 (class 0 OID 30659)
-- Dependencies: 387
-- Name: cnt_contents_collections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_contents_collections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5975 (class 0 OID 30633)
-- Dependencies: 385
-- Name: cnt_contents_facet_values; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_contents_facet_values ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5976 (class 0 OID 30646)
-- Dependencies: 386
-- Name: cnt_contents_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_contents_tags ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5948 (class 0 OID 28871)
-- Dependencies: 330
-- Name: cnt_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5949 (class 0 OID 28888)
-- Dependencies: 331
-- Name: cnt_experiences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_experiences ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5950 (class 0 OID 28902)
-- Dependencies: 332
-- Name: cnt_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_metrics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5951 (class 0 OID 28913)
-- Dependencies: 333
-- Name: cnt_resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cnt_resources ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5952 (class 0 OID 28929)
-- Dependencies: 334
-- Name: comm_mentors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comm_mentors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5982 (class 3256 OID 29828)
-- Name: cnt_contents contents_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contents_delete_policy ON public.cnt_contents FOR DELETE USING (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);


--
-- TOC entry 5983 (class 3256 OID 29829)
-- Name: cnt_contents contents_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contents_insert_policy ON public.cnt_contents FOR INSERT WITH CHECK (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);


--
-- TOC entry 5984 (class 3256 OID 29830)
-- Name: cnt_contents contents_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contents_update_policy ON public.cnt_contents USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5985 (class 3256 OID 29831)
-- Name: cnt_contents dev_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY dev_read_all ON public.cnt_contents FOR SELECT USING (true);


--
-- TOC entry 5953 (class 0 OID 28983)
-- Dependencies: 339
-- Name: eco_business_directory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eco_business_directory ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5954 (class 0 OID 29011)
-- Dependencies: 340
-- Name: eco_growth_areas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eco_growth_areas ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5955 (class 0 OID 29039)
-- Dependencies: 341
-- Name: eco_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eco_programs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5956 (class 0 OID 29052)
-- Dependencies: 342
-- Name: eco_zones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eco_zones ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5970 (class 0 OID 30013)
-- Dependencies: 366
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 6005 (class 3256 OID 29856)
-- Name: eco_growth_areas growth_areas_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY growth_areas_delete_policy ON public.eco_growth_areas FOR DELETE USING (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);


--
-- TOC entry 6006 (class 3256 OID 29857)
-- Name: eco_growth_areas growth_areas_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY growth_areas_insert_policy ON public.eco_growth_areas FOR INSERT WITH CHECK (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);


--
-- TOC entry 6007 (class 3256 OID 29858)
-- Name: eco_growth_areas growth_areas_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY growth_areas_select_policy ON public.eco_growth_areas USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6008 (class 3256 OID 29859)
-- Name: eco_growth_areas growth_areas_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY growth_areas_update_policy ON public.eco_growth_areas USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5973 (class 0 OID 30053)
-- Dependencies: 369
-- Name: media_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5964 (class 0 OID 29928)
-- Dependencies: 360
-- Name: media_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5972 (class 0 OID 30037)
-- Dependencies: 368
-- Name: media_taxonomies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_taxonomies ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5974 (class 0 OID 30071)
-- Dependencies: 370
-- Name: media_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_views ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5957 (class 0 OID 29148)
-- Dependencies: 353
-- Name: mktplc_investment_opportunities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mktplc_investment_opportunities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5958 (class 0 OID 29164)
-- Dependencies: 354
-- Name: mktplc_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mktplc_services ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5989 (class 3256 OID 29835)
-- Name: cnt_experiences org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.cnt_experiences USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5994 (class 3256 OID 29840)
-- Name: cnt_resources org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.cnt_resources USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5998 (class 3256 OID 29844)
-- Name: comm_mentors org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.comm_mentors USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6002 (class 3256 OID 29852)
-- Name: eco_business_directory org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.eco_business_directory USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6009 (class 3256 OID 29860)
-- Name: eco_growth_areas org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.eco_growth_areas USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6014 (class 3256 OID 29865)
-- Name: eco_programs org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.eco_programs USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6020 (class 3256 OID 29869)
-- Name: eco_zones org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.eco_zones USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6025 (class 3256 OID 29874)
-- Name: mktplc_investment_opportunities org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.mktplc_investment_opportunities USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6030 (class 3256 OID 29877)
-- Name: mktplc_services org_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_read ON public.mktplc_services USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5978 (class 3256 OID 29824)
-- Name: activity_logs org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.activity_logs USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 5990 (class 3256 OID 29836)
-- Name: cnt_experiences org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.cnt_experiences USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 5995 (class 3256 OID 29841)
-- Name: cnt_resources org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.cnt_resources USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 5999 (class 3256 OID 29845)
-- Name: comm_mentors org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.comm_mentors USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6003 (class 3256 OID 29853)
-- Name: eco_business_directory org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.eco_business_directory USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6010 (class 3256 OID 29861)
-- Name: eco_growth_areas org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.eco_growth_areas USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6015 (class 3256 OID 29866)
-- Name: eco_programs org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.eco_programs USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6021 (class 3256 OID 29870)
-- Name: eco_zones org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.eco_zones USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6031 (class 3256 OID 29878)
-- Name: mktplc_services org_rls_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_rls_policy ON public.mktplc_services USING ((organization_id = public.get_app_organization_id())) WITH CHECK ((organization_id = public.get_app_organization_id()));


--
-- TOC entry 6000 (class 3256 OID 29846)
-- Name: comm_mentors org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.comm_mentors USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6011 (class 3256 OID 29862)
-- Name: eco_growth_areas org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.eco_growth_areas USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6016 (class 3256 OID 29867)
-- Name: eco_programs org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.eco_programs USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6022 (class 3256 OID 29871)
-- Name: eco_zones org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.eco_zones USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6026 (class 3256 OID 29875)
-- Name: mktplc_investment_opportunities org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.mktplc_investment_opportunities USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6032 (class 3256 OID 29879)
-- Name: mktplc_services org_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY org_write ON public.mktplc_services USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 5967 (class 0 OID 29976)
-- Dependencies: 363
-- Name: podcasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 6050 (class 3256 OID 30120)
-- Name: taxonomies public_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_all ON public.taxonomies FOR SELECT USING (true);


--
-- TOC entry 6049 (class 3256 OID 30119)
-- Name: media_assets public_read_assets_if_parent_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_assets_if_parent_public ON public.media_assets FOR SELECT USING (((public_url IS NOT NULL) AND public._is_public_published(media_id)));


--
-- TOC entry 6042 (class 3256 OID 30112)
-- Name: articles public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.articles FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6047 (class 3256 OID 30117)
-- Name: events public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.events FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6048 (class 3256 OID 30118)
-- Name: media_taxonomies public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.media_taxonomies FOR SELECT USING (public._is_public_published(media_id));


--
-- TOC entry 6044 (class 3256 OID 30114)
-- Name: podcasts public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.podcasts FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6045 (class 3256 OID 30115)
-- Name: reports public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.reports FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6046 (class 3256 OID 30116)
-- Name: tools public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.tools FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6043 (class 3256 OID 30113)
-- Name: videos public_read_join_parent; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent ON public.videos FOR SELECT USING (public._is_public_published(id));


--
-- TOC entry 6074 (class 3256 OID 30765)
-- Name: cnt_contents_collections public_read_join_parent_collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent_collections ON public.cnt_contents_collections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cnt_contents c
  WHERE ((c.id = cnt_contents_collections.content_id) AND (c.status = 'Published'::text) AND ((c.published_at IS NULL) OR (c.published_at <= now()))))));


--
-- TOC entry 6072 (class 3256 OID 30763)
-- Name: cnt_contents_facet_values public_read_join_parent_facets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent_facets ON public.cnt_contents_facet_values FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cnt_contents c
  WHERE ((c.id = cnt_contents_facet_values.content_id) AND (c.status = 'Published'::text) AND ((c.published_at IS NULL) OR (c.published_at <= now()))))));


--
-- TOC entry 6073 (class 3256 OID 30764)
-- Name: cnt_contents_tags public_read_join_parent_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_join_parent_tags ON public.cnt_contents_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cnt_contents c
  WHERE ((c.id = cnt_contents_tags.content_id) AND (c.status = 'Published'::text) AND ((c.published_at IS NULL) OR (c.published_at <= now()))))));


--
-- TOC entry 6041 (class 3256 OID 30111)
-- Name: media_items public_read_published_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY public_read_published_public ON public.media_items FOR SELECT USING (((status = 'Published'::text) AND (visibility = 'Public'::text) AND ((published_at IS NULL) OR (published_at <= now()))));


--
-- TOC entry 5968 (class 0 OID 29989)
-- Dependencies: 364
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 6033 (class 3256 OID 29880)
-- Name: mktplc_services services_delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_delete_policy ON public.mktplc_services FOR DELETE USING (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);


--
-- TOC entry 6034 (class 3256 OID 29881)
-- Name: mktplc_services services_insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_insert_policy ON public.mktplc_services FOR INSERT WITH CHECK (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);


--
-- TOC entry 6035 (class 3256 OID 29882)
-- Name: mktplc_services services_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_select_policy ON public.mktplc_services USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6036 (class 3256 OID 29883)
-- Name: mktplc_services services_update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_update_policy ON public.mktplc_services USING ((organization_id = public.get_org_id_from_claim())) WITH CHECK ((organization_id = public.get_org_id_from_claim()));


--
-- TOC entry 6071 (class 3256 OID 30417)
-- Name: eco_business_directory staff_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_bypass ON public.eco_business_directory USING (public.is_staff_user()) WITH CHECK (public.is_staff_user());


--
-- TOC entry 6082 (class 3256 OID 30974)
-- Name: eco_growth_areas staff_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_bypass ON public.eco_growth_areas USING (public.is_staff_user()) WITH CHECK (public.is_staff_user());


--
-- TOC entry 6081 (class 3256 OID 30950)
-- Name: eco_zones staff_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_bypass ON public.eco_zones USING (public.is_staff_user()) WITH CHECK (public.is_staff_user());


--
-- TOC entry 6066 (class 3256 OID 30220)
-- Name: mktplc_services staff_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_bypass ON public.mktplc_services USING (public.is_staff_user()) WITH CHECK (public.is_staff_user());


--
-- TOC entry 5971 (class 0 OID 30025)
-- Dependencies: 367
-- Name: taxonomies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.taxonomies ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5969 (class 0 OID 30001)
-- Dependencies: 365
-- Name: tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5966 (class 0 OID 29964)
-- Dependencies: 362
-- Name: videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5959 (class 0 OID 29182)
-- Dependencies: 355
-- Name: wf_review_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wf_review_actions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5960 (class 0 OID 29189)
-- Dependencies: 356
-- Name: wf_review_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wf_review_assignments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5961 (class 0 OID 29200)
-- Dependencies: 357
-- Name: wf_review_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wf_review_comments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5962 (class 0 OID 29211)
-- Dependencies: 358
-- Name: wf_review_cycles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wf_review_cycles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5963 (class 0 OID 29222)
-- Dependencies: 359
-- Name: wf_review_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wf_review_templates ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5943 (class 0 OID 17389)
-- Dependencies: 315
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5926 (class 0 OID 16546)
-- Dependencies: 286
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5944 (class 0 OID 17422)
-- Dependencies: 316
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5928 (class 0 OID 16588)
-- Dependencies: 288
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5927 (class 0 OID 16561)
-- Dependencies: 287
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5942 (class 0 OID 17309)
-- Dependencies: 314
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5940 (class 0 OID 17245)
-- Dependencies: 312
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5941 (class 0 OID 17259)
-- Dependencies: 313
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 6083 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 4783 (class 3466 OID 16621)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- TOC entry 4788 (class 3466 OID 16700)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- TOC entry 4782 (class 3466 OID 16619)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- TOC entry 4789 (class 3466 OID 16703)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- TOC entry 4784 (class 3466 OID 16622)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- TOC entry 4785 (class 3466 OID 16623)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


-- Completed on 2025-11-05 21:44:46

--
-- PostgreSQL database dump complete
--

\unrestrict XPU1XxXObCE7HVu7YcUyUSCgAo1OTzYdsbuWyYllrsWauemoppybLRSwkfFZz9W

