/**
 * useCRUD Hook
 * 
 * Provides a unified interface for CRUD operations across all entities.
 * Now uses API client for backend communication with RBAC enforcement.
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { getSupabaseClient, setSupabaseSession, logAuthDebugInfo } from '../lib/dbClient';
import { supabase2 } from '../lib/supabase2';
import { FilterOptions, PaginationOptions, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAbility } from './useAbility';
import { logger } from '../utils/logger';
import { Subjects } from '../auth/ability';

interface CRUDOperations<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  total: number;
  list: (filters?: FilterOptions, pagination?: PaginationOptions) => Promise<void>;
  getById: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  bulkCreate: (items: Partial<T>[]) => Promise<T[]>;
  bulkUpdate: (items: Array<{ id: string; data: Partial<T> }>) => Promise<T[]>;
  bulkRemove: (ids: string[]) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useCRUD<T extends { id: string }>(initialTableName: string): CRUDOperations<T> {
  // Map mktplc_services to marketplace_services and flag for supabase2
  const isMarketplace = initialTableName === 'mktplc_services' || initialTableName === 'marketplace_services';
  const tableName = isMarketplace ? 'marketplace_services' : initialTableName;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [lastFilters, setLastFilters] = useState<FilterOptions | undefined>();
  const [lastPagination, setLastPagination] = useState<PaginationOptions | undefined>();

  const { ability, isLoading: authLoading } = useAuth();

  // Map table names to CASL subjects
  const getSubjectFromTableName = (table: string): Subjects => {
    const tableMap: Record<string, Subjects> = {
      'mktplc_services': 'Service',
      'cnt_contents': 'Content',
      'eco_business_directory': 'Business',
      'eco_zones': 'Zone',
      'eco_growth_areas': 'GrowthArea',
    };
    return tableMap[table] || 'Content'; // Return Content as default if not mapped
  };

  const subject = getSubjectFromTableName(tableName);

  /**
   * List records with optional filtering and pagination
   */
  const list = useCallback(
    async (filters?: FilterOptions, pagination?: PaginationOptions) => {
      logger.debug(`useCRUD.list() called for table: ${tableName}, subject: ${subject}`);
      logger.debug(`authLoading: ${authLoading}, ability.can('read', '${subject}'): ${ability.can('read', subject)}`);

      // If auth is still loading, abort early - component should retry when auth is ready
      if (authLoading) {
        logger.warn('Auth still loading, aborting fetch. Component should retry when auth is ready.');
        setLoading(false);
        return;
      }

      // Check CASL permission for read access
      if (!ability.can('read', subject)) {
        logger.error(`Permission denied: Cannot read ${subject}. Ability rules:`, ability.rules);
        logger.error(`ability.can() result:`, ability.can('read', subject));
        logger.error(`User context:`, { authLoading, abilityRulesCount: ability.rules.length });
        setError(new Error(`You don't have permission to read ${subject.toLowerCase()}s`));
        setLoading(false);
        return;
      }

      logger.success(`Permission granted, proceeding with query...`);

      setLoading(true);
      setError(null);
      setLastFilters(filters);
      setLastPagination(pagination);

      // Use Supabase for all tables, including cnt_contents

      try {
        // Set Supabase session with current JWT token
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Debug: Check current auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        logger.debug('Current Supabase session:', session);
        logger.debug('Session error:', sessionError);

        // Debug: Check localStorage for user context
        const organizationId = localStorage.getItem('user_organization_id');
        const orgName = localStorage.getItem('azure_organisation_name'); // For display only
        const userSegment = localStorage.getItem('user_segment');
        logger.debug('User context in localStorage:', { organizationId, orgName, userSegment });

        // Build the query
        let query = supabase.from(tableName).select('*');

        // Apply organization filter - skip for internal users (they should see everything)
        logger.debug(`🔍 Query Filter Decision:`, {
          organizationId,
          userSegment,
          tableName,
          willApplyOrgFilter: organizationId && userSegment !== 'internal'
        });

        if (organizationId && userSegment !== 'internal') {
          // Check if table has organization_id column
          const orgScopedTables = ['cnt_contents', 'eco_business_directory', 'eco_growth_areas', 'mktplc_services'];
          if (orgScopedTables.includes(tableName)) {
            logger.warn(`⚠️ Applying org filter with organization_id: ${organizationId} - This may filter out records!`);
            query = query.eq('organization_id', organizationId);
          }
        } else if (userSegment === 'internal') {
          logger.success(`✅ Internal user - no org filter applied (can see all content)`);
        } else {
          logger.warn(`⚠️ No organization_id found in localStorage - cannot filter content`);
        }

        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;

            switch (key) {
              case 'search':
                // Search across multiple fields (customize per table)
                break;
              case 'status':
              case 'type':
              case 'category':
                query = query.eq(key, value);
                break;
              case 'dateFrom':
                query = query.gte('created_at', value);
                break;
              case 'dateTo':
                query = query.lte('created_at', value);
                break;
              default:
                if (typeof value === 'object' && value !== null) {
                  // Handle complex filters
                  if ('operator' in value) {
                    const { operator, val } = value as any;
                    switch (operator) {
                      case 'eq':
                        query = query.eq(key, val);
                        break;
                      case 'neq':
                        query = query.neq(key, val);
                        break;
                      case 'gt':
                        query = query.gt(key, val);
                        break;
                      case 'gte':
                        query = query.gte(key, val);
                        break;
                      case 'lt':
                        query = query.lt(key, val);
                        break;
                      case 'lte':
                        query = query.lte(key, val);
                        break;
                      case 'like':
                        query = query.like(key, val);
                        break;
                      case 'ilike':
                        query = query.ilike(key, val);
                        break;
                      case 'in':
                        query = query.in(key, val);
                        break;
                    }
                  }
                } else {
                  query = query.eq(key, value);
                }
            }
          });

          // Handle search separately if it's a common field
          if (filters.search) {
            // This would need to be customized per table
            // For now, we'll use ilike on common fields
            const searchFields = ['name', 'title', 'description'];
            // Note: This is a simplified version. In production, you'd want to use OR queries
            const searchField = searchFields.find(field => true); // Pick first available
            if (searchField) {
              query = query.ilike(searchField, `%${filters.search}%`);
            }
          }
        }

        // Apply pagination and sorting
        if (pagination) {
          const { page, pageSize, sortBy, sortOrder } = pagination;
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;

          if (sortBy) {
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          query = query.range(from, to);
        }

        const result = await query;

        if (result.error) {
          logger.error('Supabase query error:', result.error);
          throw new Error(result.error.message || 'Failed to fetch data');
        }

        const fetchedData = result.data as T[] || [];
        logger.debug(`Fetched ${fetchedData.length} records from ${tableName}:`, fetchedData);
        setData(fetchedData);

        // Note: Supabase doesn't return total count by default with range
        // You'd need a separate count query for accurate pagination
        setTotal(fetchedData.length);

        // Debug logging for RLS verification
        logAuthDebugInfo(tableName, fetchedData.length, filters);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error fetching ${tableName}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject, authLoading]
  );

  /**
   * Refresh the current list with last used filters/pagination
   */
  const refresh = useCallback(async () => {
    await list(lastFilters, lastPagination);
  }, [list, lastFilters, lastPagination]);

  /**
   * Get a single record by ID
   */
  const getById = useCallback(
    async (id: string): Promise<T | null> => {
      // Check CASL permission for read access
      if (!ability.can('read', subject)) {
        setError(new Error(`You don't have permission to read ${subject.toLowerCase()}s`));
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      // Use Supabase for all tables

      try {
        // Set Supabase session if not marketplace
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const result = await supabase.from(tableName).select('*').eq('id', id).single();

        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch record');
        }

        return result.data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error fetching ${tableName} by ID:`, error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject]
  );


  const create = useCallback(
    async (newData: Partial<T>): Promise<T | null> => {
      if (!ability.can('create', subject)) {
        setError(new Error(`You don't have permission to create ${subject.toLowerCase()}s`));
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const organizationId = localStorage.getItem('user_organization_id');
        const userId = localStorage.getItem('user_id') || null;
        const userSegment = localStorage.getItem('user_segment');

        const dataWithTimestamp = {
          ...newData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const orgScopedTables = ['cnt_contents', 'eco_business_directory', 'eco_growth_areas', 'mktplc_services'];
        if (orgScopedTables.includes(tableName) && organizationId && userSegment !== 'internal') {
          (dataWithTimestamp as any).organization_id = organizationId;
        } else if (userSegment === 'internal' && organizationId) {
          (dataWithTimestamp as any).organization_id = organizationId;
        }

        if (userId) (dataWithTimestamp as any).created_by = userId;

        // Prefer Supabase; if not configured and table is contents, fallback to API
        if (tableName === 'cnt_contents' && !getSupabaseClient()) {
          try {
            const created = await apiClient.create<any>('contents', newData as any);
            await refresh();
            return created as T;
          } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            logger.error(`Error creating ${tableName} via API fallback:`, error);
            return null;
          } finally {
            setLoading(false);
          }
        }

        // Use Supabase
        if (!isMarketplace) {
          await setSupabaseSession();
        }
        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not available');

        const result = await supabase.from(tableName).insert([dataWithTimestamp]).select();
        if (result.error) throw new Error(result.error.message || 'Failed to create record');

        const createdRecord = result.data?.[0] as T;
        await refresh();
        return createdRecord;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error creating ${tableName}:`, error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject, refresh]
  );


  /**
   * Update an existing record
   */
  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<T | null> => {
      // Check CASL permission for update access
      if (!ability.can('update', subject)) {
        setError(new Error(`You don't have permission to update ${subject.toLowerCase()}s`));
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      // Use Supabase for all tables

      try {
        const dataWithTimestamp = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Set Supabase session if not marketplace
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const result = await supabase
          .from(tableName)
          .update(dataWithTimestamp)
          .eq('id', id)
          .select();

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update record');
        }

        const updatedRecord = result.data?.[0] as T;

        // Update local state
        setData(prevData =>
          prevData.map(item => (item.id === id ? updatedRecord : item))
        );

        return updatedRecord;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error updating ${tableName}:`, error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject]
  );

  /**
   * Delete a record
   */
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      // Check CASL permission for delete access
      if (!ability.can('delete', subject)) {
        setError(new Error(`You don't have permission to delete ${subject.toLowerCase()}s`));
        setLoading(false);
        return false;
      }

      setLoading(true);
      setError(null);

      // Use Supabase for all tables

      try {
        // Set Supabase session if not marketplace
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const result = await supabase.from(tableName).delete().eq('id', id);

        if (result.error) {
          throw new Error(result.error.message || 'Failed to delete record');
        }

        // Update local state
        setData(prevData => prevData.filter(item => item.id !== id));
        setTotal(prev => Math.max(0, prev - 1));

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error deleting ${tableName}:`, error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject]
  );

  /**
   * Bulk create records
   */
  const bulkCreate = useCallback(
    async (items: Partial<T>[]): Promise<T[]> => {
      setLoading(true);
      setError(null);

      try {
        const timestamp = new Date().toISOString();
        const itemsWithTimestamps = items.map(item => ({
          ...item,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        // Set Supabase session if not marketplace
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const result = await supabase.from(tableName).insert(itemsWithTimestamps).select();

        if (result.error) {
          throw new Error(result.error.message || 'Failed to create records');
        }

        await refresh();
        return result.data as T[];
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error bulk creating ${tableName}:`, error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject]
  );

  /**
   * Bulk update records
   */
  const bulkUpdate = useCallback(
    async (items: Array<{ id: string; data: Partial<T> }>): Promise<T[]> => {
      setLoading(true);
      setError(null);

      try {
        const updatePromises = items.map(({ id, data }) => update(id, data));
        const results = await Promise.all(updatePromises);
        return results.filter(Boolean) as T[];
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error bulk updating ${tableName}:`, error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject, update]
  );

  /**
   * Bulk delete records
   */
  const bulkRemove = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Set Supabase session if not marketplace
        if (!isMarketplace) {
          await setSupabaseSession();
        }

        const supabase = isMarketplace ? supabase2 : getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const result = await supabase.from(tableName).delete().in('id', ids);

        if (result.error) {
          throw new Error(result.error.message || 'Failed to delete records');
        }

        setData(prevData => prevData.filter(item => !ids.includes(item.id)));
        setTotal(prev => Math.max(0, prev - ids.length));

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        logger.error(`Error bulk deleting ${tableName}:`, error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [tableName, ability, subject]
  );


  // Note: We don't block operations during authLoading anymore
  // The ability is already initialized with createMongoAbility([])
  // and will be updated when the user logs in

  return {
    data,
    loading,
    error,
    total,
    list,
    getById,
    create,
    update,
    remove,
    bulkCreate,
    bulkUpdate,
    bulkRemove,
    refresh,
  };
}

export default useCRUD;

