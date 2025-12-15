-- Cleanup script to remove old KnowledgeHub functions, views, and triggers
-- Run this AFTER verifying the migration is complete and the new schema is working
-- 
-- WARNING: This will remove old functions. Make sure:
-- 1. Data migration is complete
-- 2. New schema functions are working
-- 3. Frontend is using new schema functions
--
-- Usage: psql <connection-string> -f scripts/cleanup-old-kh-functions.sql

-- ============================================================================
-- STEP 1: List what will be removed (for verification)
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Old KnowledgeHub Functions Cleanup';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This script will remove:';
    RAISE NOTICE '  - Old helper functions (_is_authenticated, _is_public_published, _jtxt)';
    RAISE NOTICE '  - Old views (v_media_all, v_media_public, v_media_public_grid)';
    RAISE NOTICE '  - Old triggers on media_items table';
    RAISE NOTICE '  - Old get_media_item_full function';
    RAISE NOTICE '';
    RAISE NOTICE 'It will KEEP:';
    RAISE NOTICE '  - create_media_item (updated version for cnt_contents)';
    RAISE NOTICE '  - update_media_item (updated version for cnt_contents)';
    RAISE NOTICE '  - normalize_slug (still used by cnt_contents)';
    RAISE NOTICE '  - enforce_slug_normalization (still used by cnt_contents)';
    RAISE NOTICE '  - set_updated_at (still used by cnt_contents)';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: Drop old views (that reference old media_items structure)
-- ============================================================================
-- NOTE: These views are needed by the frontend catalog - they work with cnt_contents
-- DO NOT DROP these views - they're required for the catalog to function:
-- - v_media_all (base view)
-- - v_media_public (filtered published content)
-- - v_media_public_grid (simplified grid view)
-- All views have been recreated to work with the new cnt_contents schema

-- ============================================================================
-- STEP 3: Drop old helper functions (no longer needed)
-- ============================================================================
-- These were used by old RLS policies and views
DROP FUNCTION IF EXISTS public._is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS public._is_public_published(uuid) CASCADE;
-- NOTE: _jtxt is still needed by create_media_item and update_media_item functions
-- DO NOT DROP _jtxt - it's required for the RPC functions to work

-- ============================================================================
-- STEP 4: Drop old RPC function (replaced by new version)
-- ============================================================================
-- This old version worked with media_items table
-- New version works with cnt_contents
DROP FUNCTION IF EXISTS public.get_media_item_full(uuid) CASCADE;

-- ============================================================================
-- STEP 5: Drop old triggers on media_items table
-- ============================================================================
-- These triggers are on the old media_items table
-- New triggers should be on cnt_contents table
DROP TRIGGER IF EXISTS trg_media_items_set_updated_at ON public.media_items;
DROP TRIGGER IF EXISTS trg_media_items_slug_normalize ON public.media_items;

-- ============================================================================
-- STEP 6: Verify cleanup
-- ============================================================================
DO $$
DECLARE
    v_old_functions integer;
    v_old_views integer;
BEGIN
    -- Count remaining old functions
    SELECT COUNT(*) INTO v_old_functions
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN ('_is_authenticated', '_is_public_published', '_jtxt', 'get_media_item_full');
    
    -- Count remaining old views
    SELECT COUNT(*) INTO v_old_views
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name IN ('v_media_all', 'v_media_public', 'v_media_public_grid');
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cleanup Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Old functions remaining: %', v_old_functions;
    RAISE NOTICE 'Old views remaining: %', v_old_views;
    
    IF v_old_functions = 0 AND v_old_views = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ Cleanup complete! All old functions and views removed.';
    ELSE
        RAISE WARNING '⚠️  Some old functions/views may still exist. Check manually.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Old tables (media_items, articles, etc.) are still present.';
    RAISE NOTICE 'Remove them separately after verifying data migration is complete.';
    RAISE NOTICE '';
END $$;

