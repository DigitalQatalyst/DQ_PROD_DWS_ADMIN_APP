import { useCallback, useMemo, useState } from 'react';
import type { Content } from '../types';
import { listGuides } from '../services/knowledgehub';

export interface ListOptions {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface GuideFilters {
    search?: string;
    status?: string;
    domain?: string;
}

function mapGuideToContent(row: any): Content {
    return {
        id: row.id,
        title: row.title || '',
        type: 'Guide',
        status: (row.status as any) || 'Published',
        author: row.author_name || '',
        lastModified: row.last_updated_at || '',
        content: row.body || undefined,
        category: row.domain || undefined,
        featuredImage: row.hero_image_url || undefined,
        publishedOn: row.last_updated_at || '',
        summary: row.summary || undefined,
        authorInfo: {
            organization: row.author_org || undefined,
        },
        // Add additional guide-specific fields if needed in Content type
    };
}

export function useKnowledgeHub() {
    const [data, setData] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const list = useCallback(async (filters: GuideFilters = {}, _opts: ListOptions = {}): Promise<Content[]> => {
        setLoading(true);
        setError(null);
        try {
            const rows = await listGuides({
                search: filters.search,
                status: filters.status,
                domain: filters.domain,
                limit: _opts.pageSize ?? 100,
            });

            const mappedData = rows.map(mapGuideToContent);
            setData(mappedData);
            return mappedData;
        } catch (e: any) {
            console.warn('Guide fetch failed:', e?.message || e);
            setData([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return useMemo(() => ({ data, loading, error, list }), [data, loading, error, list]);
}
