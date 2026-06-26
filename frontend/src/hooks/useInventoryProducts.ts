import { useState, useEffect, useCallback } from 'react';
import type { PaginationMeta, Product, UrgencyStatus } from '../types';
import { fetchProducts, analyzeProduct as apiAnalyze } from '../api/client';
import { useDebounce } from './useDebounce';

const EMPTY_META: PaginationMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };

export interface UseInventoryReturn {
  products: Product[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
  analyzingIds: Set<string>;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: UrgencyStatus | '';
  setStatusFilter: (v: UrgencyStatus | '') => void;
  page: number;
  setPage: (p: number) => void;
  refresh: () => Promise<void>;
  analyze: (productId: string) => Promise<void>;
}

// Paginated, searchable, filterable hook — used by InventoryPage
export function useInventoryProducts(): UseInventoryReturn {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [meta,         setMeta]         = useState<PaginationMeta>(EMPTY_META);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<UrgencyStatus | ''>('');
  const [page,         setPage]         = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta: m } = await fetchProducts({
        search: debouncedSearch || undefined,
        status: statusFilter  || undefined,
        page,
        limit: 10,
      });
      setProducts(data);
      setMeta(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const analyze = useCallback(async (productId: string) => {
    setAnalyzingIds(prev => new Set(prev).add(productId));
    try {
      const result = await apiAnalyze(productId);
      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, latestAnalysis: result.analysis } : p),
      );
    } catch (err) {
      console.error('[analyze]', err);
    } finally {
      setAnalyzingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    }
  }, []);

  return {
    products, meta, loading, error, analyzingIds,
    search, setSearch,
    statusFilter, setStatusFilter,
    page, setPage,
    refresh: load, analyze,
  };
}
