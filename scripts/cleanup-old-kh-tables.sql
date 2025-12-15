-- Cleanup script to remove old KnowledgeHub tables
-- Run this AFTER:
-- 1. Data migration is complete
-- 2. All data is verified in new schema
-- 3. Old functions/views are removed
-- 4. Frontend is confirmed working with new schema
--
-- WARNING: This will permanently delete old tables and their data!
-- Make sure you have backups and have verified the migration.
--
-- Usage: psql <connection-string> -f scripts/cleanup-old-kh-tables.sql

-- ============================================================================
-- STEP 1: Verification check
-- ============================================================================
DO $$
DECLARE
    v_old_count integer;
    v_new_count integer;
BEGIN
    -- Count old schema data
    SELECT COUNT(*) INTO v_old_count FROM public.media_items;
    
    -- Count new schema data
    SELECT COUNT(*) INTO v_new_count FROM public.cnt_contents;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Old KnowledgeHub Tables Cleanup';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Data verification:';
    RAISE NOTICE '  Old schema (media_items): % rows', v_old_count;
    RAISE NOTICE '  New schema (cnt_contents): % rows', v_new_count;
    RAISE NOTICE '';
    
    IF v_new_count < v_old_count THEN
        RAISE WARNING '⚠️  WARNING: New schema has fewer rows than old schema!';
        RAISE WARNING '   Do NOT proceed until you verify the migration is complete.';
        RAISE EXCEPTION 'Migration verification failed';
    END IF;
    
    RAISE NOTICE '✅ Data counts look good. Proceeding with cleanup...';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: Drop old type-specific tables (with CASCADE to remove dependencies)
-- ============================================================================
-- These tables have foreign keys to media_items, so CASCADE will handle them
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.podcasts CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;

-- ============================================================================
-- STEP 3: Drop junction tables
-- ============================================================================
DROP TABLE IF EXISTS public.media_taxonomies CASCADE;

-- ============================================================================
-- STEP 4: Drop old taxonomy table (if not needed)
-- ============================================================================
-- NOTE: Only drop if you're sure taxonomies are fully migrated to txn_* tables
-- Comment out this section if you want to keep taxonomies table for reference
-- DROP TABLE IF EXISTS public.taxonomies CASCADE;

-- ============================================================================
-- STEP 5: Drop main media_items table (LAST, after all dependencies)
-- ============================================================================
-- This should be dropped last since other tables reference it
DROP TABLE IF EXISTS public.media_items CASCADE;

-- ============================================================================
-- STEP 6: Verify cleanup
-- ============================================================================
DO $$
DECLARE
    v_remaining_tables integer;
BEGIN
    SELECT COUNT(*) INTO v_remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'media_items', 'articles', 'videos', 'podcasts', 
          'reports', 'tools', 'events', 'media_taxonomies'
      );
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cleanup Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Old tables remaining: %', v_remaining_tables;
    
    IF v_remaining_tables = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ Cleanup complete! All old tables removed.';
        RAISE NOTICE '';
        RAISE NOTICE 'Remaining tables (should still exist):';
        RAISE NOTICE '  - media_assets (may still be used)';
        RAISE NOTICE '  - media_views (may still be used)';
        RAISE NOTICE '  - taxonomies (if you kept it)';
    ELSE
        RAISE WARNING '⚠️  Some old tables may still exist. Check manually.';
    END IF;
    
    RAISE NOTICE '';
END $$;

