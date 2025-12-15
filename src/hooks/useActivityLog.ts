/**
 * Activity Log Hook
 * 
 * React hook for fetching and displaying activity logs for a specific entity
 * 
 * Usage:
 * ```tsx
 * const logs = useActivityLog('content', contentId);
 * ```
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/dbClient';
import type { EntityType } from '../lib/auditLog';

interface ActivityLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: string;
  performed_by_name: string;
  performed_by_role: string;
  organization_id: string;
  details: Record<string, any>;
  created_at: string;
}

export function useActivityLog(entityType: EntityType, entityId: string) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entityId) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchLogs = async () => {
      try {
        const supabase = getSupabaseClient();
        
        if (!supabase) {
          console.warn('⚠️ Supabase client not available for activity logs');
          setLogs([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setLogs(data || []);
      } catch (err) {
        console.error('❌ Error fetching activity logs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [entityType, entityId]);

  return { logs, loading, error };
}

