drop extension if exists "pg_net";

drop trigger if exists "update_contents_updated_at" on "public"."cnt_contents";

drop trigger if exists "update_business_directory_updated_at" on "public"."eco_business_directory";

drop trigger if exists "update_growth_areas_updated_at" on "public"."eco_growth_areas";

drop trigger if exists "update_zones_updated_at" on "public"."eco_zones";

drop trigger if exists "trg_media_items_set_updated_at" on "public"."media_items";

drop trigger if exists "trg_media_items_slug_normalize" on "public"."media_items";

drop trigger if exists "update_services_updated_at" on "public"."mktplc_services";

drop trigger if exists "update_review_assignments_updated_at" on "public"."wf_review_assignments";

drop trigger if exists "update_review_comments_updated_at" on "public"."wf_review_comments";

drop trigger if exists "update_content_review_cycles_updated_at" on "public"."wf_review_cycles";

drop trigger if exists "update_review_workflow_templates_updated_at" on "public"."wf_review_templates";

drop policy "org_write" on "public"."eco_business_directory";

drop policy "org_rls_policy" on "public"."activity_logs";

drop policy "authenticated_read_all" on "public"."articles";

drop policy "authenticated_write_all" on "public"."articles";

drop policy "public_read_join_parent" on "public"."articles";

drop policy "contents_delete_policy" on "public"."cnt_contents";

drop policy "contents_insert_policy" on "public"."cnt_contents";

drop policy "contents_update_policy" on "public"."cnt_contents";

drop policy "org_read" on "public"."cnt_experiences";

drop policy "org_rls_policy" on "public"."cnt_experiences";

drop policy "org_read" on "public"."cnt_resources";

drop policy "org_rls_policy" on "public"."cnt_resources";

drop policy "org_read" on "public"."comm_mentors";

drop policy "org_rls_policy" on "public"."comm_mentors";

drop policy "org_write" on "public"."comm_mentors";

drop policy "business_directory_delete_policy" on "public"."eco_business_directory";

drop policy "business_directory_insert_policy" on "public"."eco_business_directory";

drop policy "business_directory_select_policy" on "public"."eco_business_directory";

drop policy "business_directory_update_policy" on "public"."eco_business_directory";

drop policy "org_read" on "public"."eco_business_directory";

drop policy "org_rls_policy" on "public"."eco_business_directory";

drop policy "growth_areas_delete_policy" on "public"."eco_growth_areas";

drop policy "growth_areas_insert_policy" on "public"."eco_growth_areas";

drop policy "growth_areas_select_policy" on "public"."eco_growth_areas";

drop policy "growth_areas_update_policy" on "public"."eco_growth_areas";

drop policy "org_read" on "public"."eco_growth_areas";

drop policy "org_rls_policy" on "public"."eco_growth_areas";

drop policy "org_write" on "public"."eco_growth_areas";

drop policy "org_read" on "public"."eco_programs";

drop policy "org_rls_policy" on "public"."eco_programs";

drop policy "org_write" on "public"."eco_programs";

drop policy "org_read" on "public"."eco_zones";

drop policy "org_rls_policy" on "public"."eco_zones";

drop policy "org_write" on "public"."eco_zones";

drop policy "authenticated_read_all" on "public"."events";

drop policy "authenticated_write_all" on "public"."events";

drop policy "public_read_join_parent" on "public"."events";

drop policy "authenticated_read_all" on "public"."media_assets";

drop policy "authenticated_write_all" on "public"."media_assets";

drop policy "public_read_assets_if_parent_public" on "public"."media_assets";

drop policy "authenticated_read_all" on "public"."media_items";

drop policy "authenticated_write_all" on "public"."media_items";

drop policy "authenticated_read_all" on "public"."media_taxonomies";

drop policy "authenticated_write_all" on "public"."media_taxonomies";

drop policy "public_read_join_parent" on "public"."media_taxonomies";

drop policy "authenticated_read_all" on "public"."media_views";

drop policy "authenticated_write_all" on "public"."media_views";

drop policy "org_read" on "public"."mktplc_investment_opportunities";

drop policy "org_write" on "public"."mktplc_investment_opportunities";

drop policy "org_read" on "public"."mktplc_services";

drop policy "org_rls_policy" on "public"."mktplc_services";

drop policy "org_write" on "public"."mktplc_services";

drop policy "services_delete_policy" on "public"."mktplc_services";

drop policy "services_insert_policy" on "public"."mktplc_services";

drop policy "services_select_policy" on "public"."mktplc_services";

drop policy "services_update_policy" on "public"."mktplc_services";

drop policy "staff_bypass" on "public"."mktplc_services";

drop policy "authenticated_read_all" on "public"."podcasts";

drop policy "authenticated_write_all" on "public"."podcasts";

drop policy "public_read_join_parent" on "public"."podcasts";

drop policy "authenticated_read_all" on "public"."reports";

drop policy "authenticated_write_all" on "public"."reports";

drop policy "public_read_join_parent" on "public"."reports";

drop policy "authenticated_read_all" on "public"."taxonomies";

drop policy "authenticated_write_all" on "public"."taxonomies";

drop policy "authenticated_read_all" on "public"."tools";

drop policy "authenticated_write_all" on "public"."tools";

drop policy "public_read_join_parent" on "public"."tools";

drop policy "authenticated_read_all" on "public"."videos";

drop policy "authenticated_write_all" on "public"."videos";

drop policy "public_read_join_parent" on "public"."videos";

drop policy "Users can create review cycles for their content" on "public"."wf_review_cycles";

revoke delete on table "public"."txn_collection_translations" from "anon";

revoke insert on table "public"."txn_collection_translations" from "anon";

revoke references on table "public"."txn_collection_translations" from "anon";

revoke select on table "public"."txn_collection_translations" from "anon";

revoke trigger on table "public"."txn_collection_translations" from "anon";

revoke truncate on table "public"."txn_collection_translations" from "anon";

revoke update on table "public"."txn_collection_translations" from "anon";

revoke delete on table "public"."txn_collection_translations" from "authenticated";

revoke insert on table "public"."txn_collection_translations" from "authenticated";

revoke references on table "public"."txn_collection_translations" from "authenticated";

revoke select on table "public"."txn_collection_translations" from "authenticated";

revoke trigger on table "public"."txn_collection_translations" from "authenticated";

revoke truncate on table "public"."txn_collection_translations" from "authenticated";

revoke update on table "public"."txn_collection_translations" from "authenticated";

revoke delete on table "public"."txn_collection_translations" from "service_role";

revoke insert on table "public"."txn_collection_translations" from "service_role";

revoke references on table "public"."txn_collection_translations" from "service_role";

revoke select on table "public"."txn_collection_translations" from "service_role";

revoke trigger on table "public"."txn_collection_translations" from "service_role";

revoke truncate on table "public"."txn_collection_translations" from "service_role";

revoke update on table "public"."txn_collection_translations" from "service_role";

revoke delete on table "public"."txn_collections" from "anon";

revoke insert on table "public"."txn_collections" from "anon";

revoke references on table "public"."txn_collections" from "anon";

revoke select on table "public"."txn_collections" from "anon";

revoke trigger on table "public"."txn_collections" from "anon";

revoke truncate on table "public"."txn_collections" from "anon";

revoke update on table "public"."txn_collections" from "anon";

revoke delete on table "public"."txn_collections" from "authenticated";

revoke insert on table "public"."txn_collections" from "authenticated";

revoke references on table "public"."txn_collections" from "authenticated";

revoke select on table "public"."txn_collections" from "authenticated";

revoke trigger on table "public"."txn_collections" from "authenticated";

revoke truncate on table "public"."txn_collections" from "authenticated";

revoke update on table "public"."txn_collections" from "authenticated";

revoke delete on table "public"."txn_collections" from "service_role";

revoke insert on table "public"."txn_collections" from "service_role";

revoke references on table "public"."txn_collections" from "service_role";

revoke select on table "public"."txn_collections" from "service_role";

revoke trigger on table "public"."txn_collections" from "service_role";

revoke truncate on table "public"."txn_collections" from "service_role";

revoke update on table "public"."txn_collections" from "service_role";

revoke delete on table "public"."txn_facet_translations" from "anon";

revoke insert on table "public"."txn_facet_translations" from "anon";

revoke references on table "public"."txn_facet_translations" from "anon";

revoke select on table "public"."txn_facet_translations" from "anon";

revoke trigger on table "public"."txn_facet_translations" from "anon";

revoke truncate on table "public"."txn_facet_translations" from "anon";

revoke update on table "public"."txn_facet_translations" from "anon";

revoke delete on table "public"."txn_facet_translations" from "authenticated";

revoke insert on table "public"."txn_facet_translations" from "authenticated";

revoke references on table "public"."txn_facet_translations" from "authenticated";

revoke select on table "public"."txn_facet_translations" from "authenticated";

revoke trigger on table "public"."txn_facet_translations" from "authenticated";

revoke truncate on table "public"."txn_facet_translations" from "authenticated";

revoke update on table "public"."txn_facet_translations" from "authenticated";

revoke delete on table "public"."txn_facet_translations" from "service_role";

revoke insert on table "public"."txn_facet_translations" from "service_role";

revoke references on table "public"."txn_facet_translations" from "service_role";

revoke select on table "public"."txn_facet_translations" from "service_role";

revoke trigger on table "public"."txn_facet_translations" from "service_role";

revoke truncate on table "public"."txn_facet_translations" from "service_role";

revoke update on table "public"."txn_facet_translations" from "service_role";

revoke delete on table "public"."txn_facet_value_translations" from "anon";

revoke insert on table "public"."txn_facet_value_translations" from "anon";

revoke references on table "public"."txn_facet_value_translations" from "anon";

revoke select on table "public"."txn_facet_value_translations" from "anon";

revoke trigger on table "public"."txn_facet_value_translations" from "anon";

revoke truncate on table "public"."txn_facet_value_translations" from "anon";

revoke update on table "public"."txn_facet_value_translations" from "anon";

revoke delete on table "public"."txn_facet_value_translations" from "authenticated";

revoke insert on table "public"."txn_facet_value_translations" from "authenticated";

revoke references on table "public"."txn_facet_value_translations" from "authenticated";

revoke select on table "public"."txn_facet_value_translations" from "authenticated";

revoke trigger on table "public"."txn_facet_value_translations" from "authenticated";

revoke truncate on table "public"."txn_facet_value_translations" from "authenticated";

revoke update on table "public"."txn_facet_value_translations" from "authenticated";

revoke delete on table "public"."txn_facet_value_translations" from "service_role";

revoke insert on table "public"."txn_facet_value_translations" from "service_role";

revoke references on table "public"."txn_facet_value_translations" from "service_role";

revoke select on table "public"."txn_facet_value_translations" from "service_role";

revoke trigger on table "public"."txn_facet_value_translations" from "service_role";

revoke truncate on table "public"."txn_facet_value_translations" from "service_role";

revoke update on table "public"."txn_facet_value_translations" from "service_role";

revoke delete on table "public"."txn_facet_values" from "anon";

revoke insert on table "public"."txn_facet_values" from "anon";

revoke references on table "public"."txn_facet_values" from "anon";

revoke select on table "public"."txn_facet_values" from "anon";

revoke trigger on table "public"."txn_facet_values" from "anon";

revoke truncate on table "public"."txn_facet_values" from "anon";

revoke update on table "public"."txn_facet_values" from "anon";

revoke delete on table "public"."txn_facet_values" from "authenticated";

revoke insert on table "public"."txn_facet_values" from "authenticated";

revoke references on table "public"."txn_facet_values" from "authenticated";

revoke select on table "public"."txn_facet_values" from "authenticated";

revoke trigger on table "public"."txn_facet_values" from "authenticated";

revoke truncate on table "public"."txn_facet_values" from "authenticated";

revoke update on table "public"."txn_facet_values" from "authenticated";

revoke delete on table "public"."txn_facet_values" from "service_role";

revoke insert on table "public"."txn_facet_values" from "service_role";

revoke references on table "public"."txn_facet_values" from "service_role";

revoke select on table "public"."txn_facet_values" from "service_role";

revoke trigger on table "public"."txn_facet_values" from "service_role";

revoke truncate on table "public"."txn_facet_values" from "service_role";

revoke update on table "public"."txn_facet_values" from "service_role";

revoke delete on table "public"."txn_facets" from "anon";

revoke insert on table "public"."txn_facets" from "anon";

revoke references on table "public"."txn_facets" from "anon";

revoke select on table "public"."txn_facets" from "anon";

revoke trigger on table "public"."txn_facets" from "anon";

revoke truncate on table "public"."txn_facets" from "anon";

revoke update on table "public"."txn_facets" from "anon";

revoke delete on table "public"."txn_facets" from "authenticated";

revoke insert on table "public"."txn_facets" from "authenticated";

revoke references on table "public"."txn_facets" from "authenticated";

revoke select on table "public"."txn_facets" from "authenticated";

revoke trigger on table "public"."txn_facets" from "authenticated";

revoke truncate on table "public"."txn_facets" from "authenticated";

revoke update on table "public"."txn_facets" from "authenticated";

revoke delete on table "public"."txn_facets" from "service_role";

revoke insert on table "public"."txn_facets" from "service_role";

revoke references on table "public"."txn_facets" from "service_role";

revoke select on table "public"."txn_facets" from "service_role";

revoke trigger on table "public"."txn_facets" from "service_role";

revoke truncate on table "public"."txn_facets" from "service_role";

revoke update on table "public"."txn_facets" from "service_role";

revoke delete on table "public"."txn_tags" from "anon";

revoke insert on table "public"."txn_tags" from "anon";

revoke references on table "public"."txn_tags" from "anon";

revoke select on table "public"."txn_tags" from "anon";

revoke trigger on table "public"."txn_tags" from "anon";

revoke truncate on table "public"."txn_tags" from "anon";

revoke update on table "public"."txn_tags" from "anon";

revoke delete on table "public"."txn_tags" from "authenticated";

revoke insert on table "public"."txn_tags" from "authenticated";

revoke references on table "public"."txn_tags" from "authenticated";

revoke select on table "public"."txn_tags" from "authenticated";

revoke trigger on table "public"."txn_tags" from "authenticated";

revoke truncate on table "public"."txn_tags" from "authenticated";

revoke update on table "public"."txn_tags" from "authenticated";

revoke delete on table "public"."txn_tags" from "service_role";

revoke insert on table "public"."txn_tags" from "service_role";

revoke references on table "public"."txn_tags" from "service_role";

revoke select on table "public"."txn_tags" from "service_role";

revoke trigger on table "public"."txn_tags" from "service_role";

revoke truncate on table "public"."txn_tags" from "service_role";

revoke update on table "public"."txn_tags" from "service_role";

alter table "public"."txn_collection_translations" drop constraint "txn_collection_translations_base_id_fkey";

alter table "public"."txn_collections" drop constraint "txn_collections_parent_id_fkey";

alter table "public"."txn_facet_translations" drop constraint "txn_facet_translations_base_id_fkey";

alter table "public"."txn_facet_value_translations" drop constraint "txn_facet_value_translations_base_id_fkey";

alter table "public"."txn_facet_values" drop constraint "txn_facet_values_code_key";

alter table "public"."txn_facet_values" drop constraint "txn_facet_values_facet_id_fkey";

alter table "public"."txn_facets" drop constraint "txn_facets_code_key";

alter table "public"."txn_tags" drop constraint "txn_tags_value_key";

alter table "public"."articles" drop constraint "articles_id_fkey";

alter table "public"."auth_organization_members" drop constraint "auth_organization_members_organization_id_fkey";

alter table "public"."auth_user_profiles" drop constraint "auth_user_profiles_organization_id_fkey";

alter table "public"."auth_user_profiles" drop constraint "auth_user_profiles_user_id_fkey";

alter table "public"."cnt_contents" drop constraint "cnt_contents_created_by_fkey";

alter table "public"."cnt_contents" drop constraint "cnt_contents_organization_id_fkey";

alter table "public"."cnt_contents" drop constraint "contents_primary_sector_id_fkey";

alter table "public"."cnt_contents" drop constraint "contents_primary_support_category_id_fkey";

alter table "public"."cnt_contents" drop constraint "contents_target_stage_id_fkey";

alter table "public"."cnt_events" drop constraint "cnt_events_location_id_fkey";

alter table "public"."cnt_events" drop constraint "cnt_events_organizer_id_fkey";

alter table "public"."cnt_events" drop constraint "events_primary_sector_id_fkey";

alter table "public"."cnt_events" drop constraint "events_target_stage_id_fkey";

alter table "public"."cnt_experiences" drop constraint "cnt_experiences_location_id_fkey";

alter table "public"."cnt_experiences" drop constraint "cnt_experiences_organization_id_fkey";

alter table "public"."cnt_experiences" drop constraint "cnt_experiences_provider_id_fkey";

alter table "public"."cnt_metrics" drop constraint "cnt_metrics_emirate_id_fkey";

alter table "public"."cnt_metrics" drop constraint "cnt_metrics_location_id_fkey";

alter table "public"."cnt_resources" drop constraint "cnt_resources_organization_id_fkey";

alter table "public"."cnt_resources" drop constraint "resources_primary_sector_id_fkey";

alter table "public"."cnt_resources" drop constraint "resources_primary_support_category_id_fkey";

alter table "public"."cnt_resources" drop constraint "resources_target_stage_id_fkey";

alter table "public"."comm_mentors" drop constraint "comm_mentors_organization_id_fkey";

alter table "public"."dim_sectors" drop constraint "dim_sectors_parent_sector_id_fkey";

alter table "public"."dim_support_categories" drop constraint "dim_support_categories_parent_category_id_fkey";

alter table "public"."eco_business_directory" drop constraint "business_directory_primary_sector_id_fkey";

alter table "public"."eco_business_directory" drop constraint "business_directory_primary_support_category_id_fkey";

alter table "public"."eco_business_directory" drop constraint "eco_business_directory_organization_id_fkey";

alter table "public"."eco_growth_areas" drop constraint "eco_growth_areas_organization_id_fkey";

alter table "public"."eco_growth_areas" drop constraint "growth_areas_zone_id_fkey";

alter table "public"."eco_programs" drop constraint "eco_programs_emirate_id_fkey";

alter table "public"."eco_programs" drop constraint "eco_programs_organization_id_fkey";

alter table "public"."eco_programs" drop constraint "programs_program_type_id_fkey";

alter table "public"."eco_zones" drop constraint "eco_zones_organization_id_fkey";

alter table "public"."eco_zones" drop constraint "eco_zones_parent_zone_id_fkey";

alter table "public"."events" drop constraint "events_id_fkey";

alter table "public"."jct_business_sectors" drop constraint "jct_business_sectors_business_id_fkey";

alter table "public"."jct_business_support_categories" drop constraint "jct_business_support_categories_business_id_fkey";

alter table "public"."jct_content_sectors" drop constraint "jct_content_sectors_content_id_fkey";

alter table "public"."jct_event_sectors" drop constraint "jct_event_sectors_event_id_fkey";

alter table "public"."jct_event_support_categories" drop constraint "jct_event_support_categories_event_id_fkey";

alter table "public"."jct_investment_sectors" drop constraint "jct_investment_sectors_investment_id_fkey";

alter table "public"."jct_investment_sectors" drop constraint "jct_investment_sectors_sector_id_fkey";

alter table "public"."jct_program_support_categories" drop constraint "jct_program_support_categories_program_id_fkey";

alter table "public"."jct_program_target_stages" drop constraint "jct_program_target_stages_program_id_fkey";

alter table "public"."jct_resource_sectors" drop constraint "jct_resource_sectors_resource_id_fkey";

alter table "public"."media_assets" drop constraint "media_assets_media_id_fkey";

alter table "public"."media_taxonomies" drop constraint "media_taxonomies_media_id_fkey";

alter table "public"."media_taxonomies" drop constraint "media_taxonomies_taxonomy_id_fkey";

alter table "public"."media_views" drop constraint "media_views_media_id_fkey";

alter table "public"."mktplc_investment_opportunities" drop constraint "investment_opportunities_primary_sector_id_fkey";

alter table "public"."mktplc_investment_opportunities" drop constraint "mktplc_investment_opportunities_location_id_fkey";

alter table "public"."mktplc_investment_opportunities" drop constraint "mktplc_investment_opportunities_organization_id_fkey";

alter table "public"."mktplc_services" drop constraint "mktplc_services_organization_id_fkey";

alter table "public"."mktplc_services" drop constraint "services_partner_id_fkey";

alter table "public"."mktplc_services" drop constraint "services_provider_id_fkey";

alter table "public"."podcasts" drop constraint "podcasts_id_fkey";

alter table "public"."reports" drop constraint "reports_id_fkey";

alter table "public"."tools" drop constraint "tools_id_fkey";

alter table "public"."videos" drop constraint "videos_id_fkey";

alter table "public"."wf_review_actions" drop constraint "review_approval_actions_content_id_fkey";

alter table "public"."wf_review_actions" drop constraint "review_approval_actions_review_cycle_id_fkey";

alter table "public"."wf_review_assignments" drop constraint "review_assignments_content_id_fkey";

alter table "public"."wf_review_assignments" drop constraint "review_assignments_review_cycle_id_fkey";

alter table "public"."wf_review_comments" drop constraint "review_comments_content_id_fkey";

alter table "public"."wf_review_comments" drop constraint "review_comments_parent_comment_id_fkey";

alter table "public"."wf_review_comments" drop constraint "review_comments_review_cycle_id_fkey";

alter table "public"."wf_review_cycles" drop constraint "content_review_cycles_content_id_fkey";

drop type "public"."geometry_dump";

drop view if exists "public"."v_media_public_grid";

drop type "public"."valid_detail";

alter table "public"."txn_collection_translations" drop constraint "txn_collection_translations_pkey";

alter table "public"."txn_collections" drop constraint "txn_collections_pkey";

alter table "public"."txn_facet_translations" drop constraint "txn_facet_translations_pkey";

alter table "public"."txn_facet_value_translations" drop constraint "txn_facet_value_translations_pkey";

alter table "public"."txn_facet_values" drop constraint "txn_facet_values_pkey";

alter table "public"."txn_facets" drop constraint "txn_facets_pkey";

alter table "public"."txn_tags" drop constraint "txn_tags_pkey";

drop index if exists "public"."idx_txn_collection_translations_base_id";

drop index if exists "public"."idx_txn_collection_translations_language_code";

drop index if exists "public"."idx_txn_collection_translations_slug";

drop index if exists "public"."idx_txn_collections_parent_id";

drop index if exists "public"."idx_txn_collections_position";

drop index if exists "public"."idx_txn_facet_translations_base_id";

drop index if exists "public"."idx_txn_facet_translations_language_code";

drop index if exists "public"."idx_txn_facet_value_translations_base_id";

drop index if exists "public"."idx_txn_facet_value_translations_language_code";

drop index if exists "public"."idx_txn_facet_values_code";

drop index if exists "public"."idx_txn_facet_values_facet_id";

drop index if exists "public"."idx_txn_facets_code";

drop index if exists "public"."idx_txn_tags_value";

drop index if exists "public"."txn_collection_translations_pkey";

drop index if exists "public"."txn_collections_pkey";

drop index if exists "public"."txn_facet_translations_pkey";

drop index if exists "public"."txn_facet_value_translations_pkey";

drop index if exists "public"."txn_facet_values_code_key";

drop index if exists "public"."txn_facet_values_pkey";

drop index if exists "public"."txn_facets_code_key";

drop index if exists "public"."txn_facets_pkey";

drop index if exists "public"."txn_tags_pkey";

drop index if exists "public"."txn_tags_value_key";

drop table "public"."txn_collection_translations";

drop table "public"."txn_collections";

drop table "public"."txn_facet_translations";

drop table "public"."txn_facet_value_translations";

drop table "public"."txn_facet_values";

drop table "public"."txn_facets";

drop table "public"."txn_tags";


  create table "public"."mktplc_service_comments" (
    "id" uuid not null default gen_random_uuid(),
    "service_id" uuid not null,
    "comment_text" text not null,
    "comment_type" character varying(20) not null default 'Review'::character varying,
    "author_id" uuid not null,
    "author_name" character varying(255) not null,
    "author_role" character varying(50) not null,
    "author_email" character varying(255),
    "review_cycle_id" uuid,
    "is_internal" boolean default false,
    "visibility" character varying(20) default 'All'::character varying,
    "parent_comment_id" uuid,
    "mentions" text[],
    "is_resolved" boolean default false,
    "resolved_by" uuid,
    "resolved_at" timestamp with time zone,
    "attachments" jsonb default '[]'::jsonb,
    "metadata" jsonb default '{}'::jsonb,
    "related_status_change" character varying(50),
    "action_type" character varying(50),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "organization_id" uuid
      );


alter table "public"."activity_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."auth_organization_members" alter column "roles" set default ARRAY['viewer'::public.user_role];

alter table "public"."auth_organization_members" alter column "roles" set data type public.user_role[] using "roles"::public.user_role[];

alter table "public"."cnt_contents" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."cnt_events" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."cnt_experiences" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."cnt_metrics" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."cnt_resources" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."comm_mentors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dim_business_stages" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dim_program_types" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dim_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."dim_support_categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."eco_business_directory" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."eco_growth_areas" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."eco_programs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."eco_zones" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."geo_emirates" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_business_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_business_support_categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_content_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_event_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_event_support_categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_investment_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_program_support_categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_program_target_stages" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jct_resource_sectors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."mktplc_investment_opportunities" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."mktplc_services" add column "empowerment_and_leadership" text[];

alter table "public"."mktplc_services" add column "industry" text[];

alter table "public"."mktplc_services" add column "key_terms_of_service" text;

alter table "public"."mktplc_services" add column "registration_validity" text;

alter table "public"."mktplc_services" add column "related_services" text[];

alter table "public"."mktplc_services" add column "service_mode" text[];

alter table "public"."mktplc_services" alter column "id" set default extensions.uuid_generate_v4();

CREATE INDEX idx_service_comments_author_id ON public.mktplc_service_comments USING btree (author_id);

CREATE INDEX idx_service_comments_created_at ON public.mktplc_service_comments USING btree (created_at DESC);

CREATE INDEX idx_service_comments_parent_id ON public.mktplc_service_comments USING btree (parent_comment_id);

CREATE INDEX idx_service_comments_review_cycle ON public.mktplc_service_comments USING btree (review_cycle_id) WHERE (review_cycle_id IS NOT NULL);

CREATE INDEX idx_service_comments_service_id ON public.mktplc_service_comments USING btree (service_id);

CREATE UNIQUE INDEX mktplc_service_comments_pkey ON public.mktplc_service_comments USING btree (id);

alter table "public"."mktplc_service_comments" add constraint "mktplc_service_comments_pkey" PRIMARY KEY using index "mktplc_service_comments_pkey";

alter table "public"."mktplc_service_comments" add constraint "mktplc_service_comments_comment_type_check" CHECK (((comment_type)::text = ANY ((ARRAY['Review'::character varying, 'Approval'::character varying, 'Rejection'::character varying, 'Revision'::character varying, 'General'::character varying, 'System'::character varying])::text[]))) not valid;

alter table "public"."mktplc_service_comments" validate constraint "mktplc_service_comments_comment_type_check";

alter table "public"."mktplc_service_comments" add constraint "mktplc_service_comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES public.mktplc_service_comments(id) ON DELETE CASCADE not valid;

alter table "public"."mktplc_service_comments" validate constraint "mktplc_service_comments_parent_comment_id_fkey";

alter table "public"."mktplc_service_comments" add constraint "mktplc_service_comments_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.mktplc_services(id) ON DELETE CASCADE not valid;

alter table "public"."mktplc_service_comments" validate constraint "mktplc_service_comments_service_id_fkey";

alter table "public"."mktplc_service_comments" add constraint "mktplc_service_comments_visibility_check" CHECK (((visibility)::text = ANY ((ARRAY['All'::character varying, 'Internal'::character varying, 'Partner'::character varying, 'Approver'::character varying])::text[]))) not valid;

alter table "public"."mktplc_service_comments" validate constraint "mktplc_service_comments_visibility_check";

alter table "public"."articles" add constraint "articles_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."articles" validate constraint "articles_id_fkey";

alter table "public"."auth_organization_members" add constraint "auth_organization_members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE CASCADE not valid;

alter table "public"."auth_organization_members" validate constraint "auth_organization_members_organization_id_fkey";

alter table "public"."auth_user_profiles" add constraint "auth_user_profiles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."auth_user_profiles" validate constraint "auth_user_profiles_organization_id_fkey";

alter table "public"."auth_user_profiles" add constraint "auth_user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE not valid;

alter table "public"."auth_user_profiles" validate constraint "auth_user_profiles_user_id_fkey";

alter table "public"."cnt_contents" add constraint "cnt_contents_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.auth_users(id) ON DELETE SET NULL not valid;

alter table "public"."cnt_contents" validate constraint "cnt_contents_created_by_fkey";

alter table "public"."cnt_contents" add constraint "cnt_contents_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."cnt_contents" validate constraint "cnt_contents_organization_id_fkey";

alter table "public"."cnt_contents" add constraint "contents_primary_sector_id_fkey" FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."cnt_contents" validate constraint "contents_primary_sector_id_fkey";

alter table "public"."cnt_contents" add constraint "contents_primary_support_category_id_fkey" FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id) not valid;

alter table "public"."cnt_contents" validate constraint "contents_primary_support_category_id_fkey";

alter table "public"."cnt_contents" add constraint "contents_target_stage_id_fkey" FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id) not valid;

alter table "public"."cnt_contents" validate constraint "contents_target_stage_id_fkey";

alter table "public"."cnt_events" add constraint "cnt_events_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.eco_zones(id) not valid;

alter table "public"."cnt_events" validate constraint "cnt_events_location_id_fkey";

alter table "public"."cnt_events" add constraint "cnt_events_organizer_id_fkey" FOREIGN KEY (organizer_id) REFERENCES public.eco_business_directory(id) not valid;

alter table "public"."cnt_events" validate constraint "cnt_events_organizer_id_fkey";

alter table "public"."cnt_events" add constraint "events_primary_sector_id_fkey" FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."cnt_events" validate constraint "events_primary_sector_id_fkey";

alter table "public"."cnt_events" add constraint "events_target_stage_id_fkey" FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id) not valid;

alter table "public"."cnt_events" validate constraint "events_target_stage_id_fkey";

alter table "public"."cnt_experiences" add constraint "cnt_experiences_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.eco_zones(id) not valid;

alter table "public"."cnt_experiences" validate constraint "cnt_experiences_location_id_fkey";

alter table "public"."cnt_experiences" add constraint "cnt_experiences_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."cnt_experiences" validate constraint "cnt_experiences_organization_id_fkey";

alter table "public"."cnt_experiences" add constraint "cnt_experiences_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.eco_business_directory(id) not valid;

alter table "public"."cnt_experiences" validate constraint "cnt_experiences_provider_id_fkey";

alter table "public"."cnt_metrics" add constraint "cnt_metrics_emirate_id_fkey" FOREIGN KEY (emirate_id) REFERENCES public.geo_emirates(id) not valid;

alter table "public"."cnt_metrics" validate constraint "cnt_metrics_emirate_id_fkey";

alter table "public"."cnt_metrics" add constraint "cnt_metrics_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.eco_zones(id) not valid;

alter table "public"."cnt_metrics" validate constraint "cnt_metrics_location_id_fkey";

alter table "public"."cnt_resources" add constraint "cnt_resources_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."cnt_resources" validate constraint "cnt_resources_organization_id_fkey";

alter table "public"."cnt_resources" add constraint "resources_primary_sector_id_fkey" FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."cnt_resources" validate constraint "resources_primary_sector_id_fkey";

alter table "public"."cnt_resources" add constraint "resources_primary_support_category_id_fkey" FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id) not valid;

alter table "public"."cnt_resources" validate constraint "resources_primary_support_category_id_fkey";

alter table "public"."cnt_resources" add constraint "resources_target_stage_id_fkey" FOREIGN KEY (target_stage_id) REFERENCES public.dim_business_stages(id) not valid;

alter table "public"."cnt_resources" validate constraint "resources_target_stage_id_fkey";

alter table "public"."comm_mentors" add constraint "comm_mentors_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."comm_mentors" validate constraint "comm_mentors_organization_id_fkey";

alter table "public"."dim_sectors" add constraint "dim_sectors_parent_sector_id_fkey" FOREIGN KEY (parent_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."dim_sectors" validate constraint "dim_sectors_parent_sector_id_fkey";

alter table "public"."dim_support_categories" add constraint "dim_support_categories_parent_category_id_fkey" FOREIGN KEY (parent_category_id) REFERENCES public.dim_support_categories(id) not valid;

alter table "public"."dim_support_categories" validate constraint "dim_support_categories_parent_category_id_fkey";

alter table "public"."eco_business_directory" add constraint "business_directory_primary_sector_id_fkey" FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."eco_business_directory" validate constraint "business_directory_primary_sector_id_fkey";

alter table "public"."eco_business_directory" add constraint "business_directory_primary_support_category_id_fkey" FOREIGN KEY (primary_support_category_id) REFERENCES public.dim_support_categories(id) not valid;

alter table "public"."eco_business_directory" validate constraint "business_directory_primary_support_category_id_fkey";

alter table "public"."eco_business_directory" add constraint "eco_business_directory_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."eco_business_directory" validate constraint "eco_business_directory_organization_id_fkey";

alter table "public"."eco_growth_areas" add constraint "eco_growth_areas_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."eco_growth_areas" validate constraint "eco_growth_areas_organization_id_fkey";

alter table "public"."eco_growth_areas" add constraint "growth_areas_zone_id_fkey" FOREIGN KEY (zone_id) REFERENCES public.eco_zones(id) ON DELETE SET NULL not valid;

alter table "public"."eco_growth_areas" validate constraint "growth_areas_zone_id_fkey";

alter table "public"."eco_programs" add constraint "eco_programs_emirate_id_fkey" FOREIGN KEY (emirate_id) REFERENCES public.geo_emirates(id) not valid;

alter table "public"."eco_programs" validate constraint "eco_programs_emirate_id_fkey";

alter table "public"."eco_programs" add constraint "eco_programs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."eco_programs" validate constraint "eco_programs_organization_id_fkey";

alter table "public"."eco_programs" add constraint "programs_program_type_id_fkey" FOREIGN KEY (program_type_id) REFERENCES public.dim_program_types(id) not valid;

alter table "public"."eco_programs" validate constraint "programs_program_type_id_fkey";

alter table "public"."eco_zones" add constraint "eco_zones_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."eco_zones" validate constraint "eco_zones_organization_id_fkey";

alter table "public"."eco_zones" add constraint "eco_zones_parent_zone_id_fkey" FOREIGN KEY (parent_zone_id) REFERENCES public.eco_zones(id) not valid;

alter table "public"."eco_zones" validate constraint "eco_zones_parent_zone_id_fkey";

alter table "public"."events" add constraint "events_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_id_fkey";

alter table "public"."jct_business_sectors" add constraint "jct_business_sectors_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.eco_business_directory(id) ON DELETE CASCADE not valid;

alter table "public"."jct_business_sectors" validate constraint "jct_business_sectors_business_id_fkey";

alter table "public"."jct_business_support_categories" add constraint "jct_business_support_categories_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.eco_business_directory(id) ON DELETE CASCADE not valid;

alter table "public"."jct_business_support_categories" validate constraint "jct_business_support_categories_business_id_fkey";

alter table "public"."jct_content_sectors" add constraint "jct_content_sectors_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE not valid;

alter table "public"."jct_content_sectors" validate constraint "jct_content_sectors_content_id_fkey";

alter table "public"."jct_event_sectors" add constraint "jct_event_sectors_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.cnt_events(id) ON DELETE CASCADE not valid;

alter table "public"."jct_event_sectors" validate constraint "jct_event_sectors_event_id_fkey";

alter table "public"."jct_event_support_categories" add constraint "jct_event_support_categories_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.cnt_events(id) ON DELETE CASCADE not valid;

alter table "public"."jct_event_support_categories" validate constraint "jct_event_support_categories_event_id_fkey";

alter table "public"."jct_investment_sectors" add constraint "jct_investment_sectors_investment_id_fkey" FOREIGN KEY (investment_id) REFERENCES public.mktplc_investment_opportunities(id) ON DELETE CASCADE not valid;

alter table "public"."jct_investment_sectors" validate constraint "jct_investment_sectors_investment_id_fkey";

alter table "public"."jct_investment_sectors" add constraint "jct_investment_sectors_sector_id_fkey" FOREIGN KEY (sector_id) REFERENCES public.dim_sectors(id) ON DELETE CASCADE not valid;

alter table "public"."jct_investment_sectors" validate constraint "jct_investment_sectors_sector_id_fkey";

alter table "public"."jct_program_support_categories" add constraint "jct_program_support_categories_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.eco_programs(id) ON DELETE CASCADE not valid;

alter table "public"."jct_program_support_categories" validate constraint "jct_program_support_categories_program_id_fkey";

alter table "public"."jct_program_target_stages" add constraint "jct_program_target_stages_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.eco_programs(id) ON DELETE CASCADE not valid;

alter table "public"."jct_program_target_stages" validate constraint "jct_program_target_stages_program_id_fkey";

alter table "public"."jct_resource_sectors" add constraint "jct_resource_sectors_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.cnt_resources(id) ON DELETE CASCADE not valid;

alter table "public"."jct_resource_sectors" validate constraint "jct_resource_sectors_resource_id_fkey";

alter table "public"."media_assets" add constraint "media_assets_media_id_fkey" FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."media_assets" validate constraint "media_assets_media_id_fkey";

alter table "public"."media_taxonomies" add constraint "media_taxonomies_media_id_fkey" FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."media_taxonomies" validate constraint "media_taxonomies_media_id_fkey";

alter table "public"."media_taxonomies" add constraint "media_taxonomies_taxonomy_id_fkey" FOREIGN KEY (taxonomy_id) REFERENCES public.taxonomies(id) ON DELETE CASCADE not valid;

alter table "public"."media_taxonomies" validate constraint "media_taxonomies_taxonomy_id_fkey";

alter table "public"."media_views" add constraint "media_views_media_id_fkey" FOREIGN KEY (media_id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."media_views" validate constraint "media_views_media_id_fkey";

alter table "public"."mktplc_investment_opportunities" add constraint "investment_opportunities_primary_sector_id_fkey" FOREIGN KEY (primary_sector_id) REFERENCES public.dim_sectors(id) not valid;

alter table "public"."mktplc_investment_opportunities" validate constraint "investment_opportunities_primary_sector_id_fkey";

alter table "public"."mktplc_investment_opportunities" add constraint "mktplc_investment_opportunities_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.eco_zones(id) not valid;

alter table "public"."mktplc_investment_opportunities" validate constraint "mktplc_investment_opportunities_location_id_fkey";

alter table "public"."mktplc_investment_opportunities" add constraint "mktplc_investment_opportunities_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."mktplc_investment_opportunities" validate constraint "mktplc_investment_opportunities_organization_id_fkey";

alter table "public"."mktplc_services" add constraint "mktplc_services_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.auth_organizations(id) ON DELETE SET NULL not valid;

alter table "public"."mktplc_services" validate constraint "mktplc_services_organization_id_fkey";

alter table "public"."mktplc_services" add constraint "services_partner_id_fkey" FOREIGN KEY (partner_id) REFERENCES public.eco_business_directory(id) ON DELETE SET NULL not valid;

alter table "public"."mktplc_services" validate constraint "services_partner_id_fkey";

alter table "public"."mktplc_services" add constraint "services_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.eco_business_directory(id) not valid;

alter table "public"."mktplc_services" validate constraint "services_provider_id_fkey";

alter table "public"."podcasts" add constraint "podcasts_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."podcasts" validate constraint "podcasts_id_fkey";

alter table "public"."reports" add constraint "reports_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_id_fkey";

alter table "public"."tools" add constraint "tools_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."tools" validate constraint "tools_id_fkey";

alter table "public"."videos" add constraint "videos_id_fkey" FOREIGN KEY (id) REFERENCES public.media_items(id) ON DELETE CASCADE not valid;

alter table "public"."videos" validate constraint "videos_id_fkey";

alter table "public"."wf_review_actions" add constraint "review_approval_actions_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_actions" validate constraint "review_approval_actions_content_id_fkey";

alter table "public"."wf_review_actions" add constraint "review_approval_actions_review_cycle_id_fkey" FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_actions" validate constraint "review_approval_actions_review_cycle_id_fkey";

alter table "public"."wf_review_assignments" add constraint "review_assignments_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_assignments" validate constraint "review_assignments_content_id_fkey";

alter table "public"."wf_review_assignments" add constraint "review_assignments_review_cycle_id_fkey" FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_assignments" validate constraint "review_assignments_review_cycle_id_fkey";

alter table "public"."wf_review_comments" add constraint "review_comments_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_comments" validate constraint "review_comments_content_id_fkey";

alter table "public"."wf_review_comments" add constraint "review_comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES public.wf_review_comments(id) not valid;

alter table "public"."wf_review_comments" validate constraint "review_comments_parent_comment_id_fkey";

alter table "public"."wf_review_comments" add constraint "review_comments_review_cycle_id_fkey" FOREIGN KEY (review_cycle_id) REFERENCES public.wf_review_cycles(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_comments" validate constraint "review_comments_review_cycle_id_fkey";

alter table "public"."wf_review_cycles" add constraint "content_review_cycles_content_id_fkey" FOREIGN KEY (content_id) REFERENCES public.cnt_contents(id) ON DELETE CASCADE not valid;

alter table "public"."wf_review_cycles" validate constraint "content_review_cycles_content_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public._is_authenticated()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT COALESCE(auth.role(), '') IN ('authenticated','service_role')
$function$
;

CREATE OR REPLACE FUNCTION public._is_public_published(_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.cnt_contents c
    WHERE c.id = _id
      AND c.status = 'Published'
      AND (c.published_at IS NULL OR c.published_at <= now())
  )
$function$
;

CREATE OR REPLACE FUNCTION public._jtxt(j jsonb, key text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT NULLIF(j->>key, '')
$function$
;

create or replace view "public"."content_review_status" as  SELECT c.id AS content_id,
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


CREATE OR REPLACE FUNCTION public.create_media_item(_base jsonb, _type text, _child jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.enforce_slug_normalization()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.normalize_slug(COALESCE(NEW.title, gen_random_uuid()::text));
  ELSE
    NEW.slug := public.normalize_slug(NEW.slug);
  END IF;
  RETURN NEW;
END;
$function$
;

create type "public"."geometry_dump" as ("path" integer[], "geom" public.geometry);

CREATE OR REPLACE FUNCTION public.get_media_item_full(media_id uuid)
 RETURNS public.v_media_all
 LANGUAGE sql
 STABLE
AS $function$ SELECT * FROM public.v_media_all WHERE id=media_id $function$
;

CREATE OR REPLACE FUNCTION public.normalize_slug(input text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce($1,'')), '[^a-z0-9]+', '-', 'g'))
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_media_item(_id uuid, _base jsonb, _type text, _child jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."v_cnt_active_events" as  SELECT id,
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


create or replace view "public"."v_cnt_metrics_latest" as  SELECT DISTINCT ON (metric_code) id,
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


create or replace view "public"."v_media_all" as  SELECT id,
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
    COALESCE(category, NULL::text) AS domain,
    NULL::jsonb AS authors,
    NULL::jsonb AS author_slugs,
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
    NULL::text AS business_stage,
    NULL::text AS format,
    NULL::text AS popularity
   FROM public.cnt_contents c;


create or replace view "public"."v_media_public" as  SELECT id,
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
    author_slugs,
    legacy_provider_name,
    legacy_provider_logo_url,
    image_url,
    podcast_url,
    file_size_bytes,
    download_count,
    event_date,
    event_time,
    event_location,
    event_location_details,
    event_registration_info,
    business_stage,
    format,
    popularity
   FROM public.v_media_all
  WHERE ((status = 'Published'::text) AND ((published_at IS NULL) OR (published_at <= now())));


create or replace view "public"."v_media_public_grid" as  SELECT id,
    title,
    COALESCE(NULLIF(summary, ''::text), NULLIF("left"(regexp_replace(COALESCE(body_html, ''::text), '<[^>]*>'::text, ''::text, 'g'::text), 240), ''::text)) AS summary,
    thumbnail_url AS thumbnail,
    type,
    tags,
    published_at,
    start_at,
    COALESCE(report_document_url, tool_document_url, article_document_url) AS document_url
   FROM public.v_media_public;


create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" public.geometry);

grant delete on table "public"."mktplc_service_comments" to "anon";

grant insert on table "public"."mktplc_service_comments" to "anon";

grant references on table "public"."mktplc_service_comments" to "anon";

grant select on table "public"."mktplc_service_comments" to "anon";

grant trigger on table "public"."mktplc_service_comments" to "anon";

grant truncate on table "public"."mktplc_service_comments" to "anon";

grant update on table "public"."mktplc_service_comments" to "anon";

grant delete on table "public"."mktplc_service_comments" to "authenticated";

grant insert on table "public"."mktplc_service_comments" to "authenticated";

grant references on table "public"."mktplc_service_comments" to "authenticated";

grant select on table "public"."mktplc_service_comments" to "authenticated";

grant trigger on table "public"."mktplc_service_comments" to "authenticated";

grant truncate on table "public"."mktplc_service_comments" to "authenticated";

grant update on table "public"."mktplc_service_comments" to "authenticated";

grant delete on table "public"."mktplc_service_comments" to "service_role";

grant insert on table "public"."mktplc_service_comments" to "service_role";

grant references on table "public"."mktplc_service_comments" to "service_role";

grant select on table "public"."mktplc_service_comments" to "service_role";

grant trigger on table "public"."mktplc_service_comments" to "service_role";

grant truncate on table "public"."mktplc_service_comments" to "service_role";

grant update on table "public"."mktplc_service_comments" to "service_role";


  create policy "staff_bypass"
  on "public"."eco_business_directory"
  as permissive
  for all
  to public
using (public.is_staff_user())
with check (public.is_staff_user());



  create policy "org_rls_policy"
  on "public"."activity_logs"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "authenticated_read_all"
  on "public"."articles"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."articles"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."articles"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "contents_delete_policy"
  on "public"."cnt_contents"
  as permissive
  for delete
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);



  create policy "contents_insert_policy"
  on "public"."cnt_contents"
  as permissive
  for insert
  to public
with check (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);



  create policy "contents_update_policy"
  on "public"."cnt_contents"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_read"
  on "public"."cnt_experiences"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."cnt_experiences"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_read"
  on "public"."cnt_resources"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."cnt_resources"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_read"
  on "public"."comm_mentors"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."comm_mentors"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_write"
  on "public"."comm_mentors"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "business_directory_delete_policy"
  on "public"."eco_business_directory"
  as permissive
  for delete
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);



  create policy "business_directory_insert_policy"
  on "public"."eco_business_directory"
  as permissive
  for insert
  to public
with check (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);



  create policy "business_directory_select_policy"
  on "public"."eco_business_directory"
  as permissive
  for select
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);



  create policy "business_directory_update_policy"
  on "public"."eco_business_directory"
  as permissive
  for update
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END)
with check (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_org_id_from_claim())
    ELSE false
END);



  create policy "org_read"
  on "public"."eco_business_directory"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."eco_business_directory"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "growth_areas_delete_policy"
  on "public"."eco_growth_areas"
  as permissive
  for delete
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);



  create policy "growth_areas_insert_policy"
  on "public"."eco_growth_areas"
  as permissive
  for insert
  to public
with check (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);



  create policy "growth_areas_select_policy"
  on "public"."eco_growth_areas"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "growth_areas_update_policy"
  on "public"."eco_growth_areas"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_read"
  on "public"."eco_growth_areas"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."eco_growth_areas"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_write"
  on "public"."eco_growth_areas"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_read"
  on "public"."eco_programs"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."eco_programs"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_write"
  on "public"."eco_programs"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_read"
  on "public"."eco_zones"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."eco_zones"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_write"
  on "public"."eco_zones"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "authenticated_read_all"
  on "public"."events"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."events"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."events"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "authenticated_read_all"
  on "public"."media_assets"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."media_assets"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_assets_if_parent_public"
  on "public"."media_assets"
  as permissive
  for select
  to public
using (((public_url IS NOT NULL) AND public._is_public_published(media_id)));



  create policy "authenticated_read_all"
  on "public"."media_items"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."media_items"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "authenticated_read_all"
  on "public"."media_taxonomies"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."media_taxonomies"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."media_taxonomies"
  as permissive
  for select
  to public
using (public._is_public_published(media_id));



  create policy "authenticated_read_all"
  on "public"."media_views"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."media_views"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "org_read"
  on "public"."mktplc_investment_opportunities"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_write"
  on "public"."mktplc_investment_opportunities"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_read"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "org_rls_policy"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using ((organization_id = public.get_app_organization_id()))
with check ((organization_id = public.get_app_organization_id()));



  create policy "org_write"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "services_delete_policy"
  on "public"."mktplc_services"
  as permissive
  for delete
  to public
using (
CASE
    WHEN public.is_staff_user() THEN true
    ELSE false
END);



  create policy "services_insert_policy"
  on "public"."mktplc_services"
  as permissive
  for insert
  to public
with check (
CASE
    WHEN public.is_staff_user() THEN true
    WHEN public.is_partner_user() THEN (organization_id = public.get_current_organisation_id())
    ELSE false
END);



  create policy "services_select_policy"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "services_update_policy"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using ((organization_id = public.get_org_id_from_claim()))
with check ((organization_id = public.get_org_id_from_claim()));



  create policy "staff_bypass"
  on "public"."mktplc_services"
  as permissive
  for all
  to public
using (public.is_staff_user())
with check (public.is_staff_user());



  create policy "authenticated_read_all"
  on "public"."podcasts"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."podcasts"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."podcasts"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "authenticated_read_all"
  on "public"."reports"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."reports"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."reports"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "authenticated_read_all"
  on "public"."taxonomies"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."taxonomies"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "authenticated_read_all"
  on "public"."tools"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."tools"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."tools"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "authenticated_read_all"
  on "public"."videos"
  as permissive
  for select
  to public
using (public._is_authenticated());



  create policy "authenticated_write_all"
  on "public"."videos"
  as permissive
  for all
  to public
using (public._is_authenticated())
with check (public._is_authenticated());



  create policy "public_read_join_parent"
  on "public"."videos"
  as permissive
  for select
  to public
using (public._is_public_published(id));



  create policy "Users can create review cycles for their content"
  on "public"."wf_review_cycles"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.cnt_contents c
  WHERE ((c.id = wf_review_cycles.content_id) AND (c.created_by = auth.uid())))));


CREATE TRIGGER trg_cnt_contents_slug_normalize BEFORE INSERT OR UPDATE OF slug, title ON public.cnt_contents FOR EACH ROW EXECUTE FUNCTION public.enforce_slug_normalization();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.cnt_contents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_directory_updated_at BEFORE UPDATE ON public.eco_business_directory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_growth_areas_updated_at BEFORE UPDATE ON public.eco_growth_areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.eco_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_media_items_set_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_media_items_slug_normalize BEFORE INSERT OR UPDATE OF slug, title ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.enforce_slug_normalization();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.mktplc_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_assignments_updated_at BEFORE UPDATE ON public.wf_review_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_comments_updated_at BEFORE UPDATE ON public.wf_review_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_review_cycles_updated_at BEFORE UPDATE ON public.wf_review_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_workflow_templates_updated_at BEFORE UPDATE ON public.wf_review_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


