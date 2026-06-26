import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { fetchProducts, analyzeProduct as apiAnalyze } from '../api/client';

export interface UseAllProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  analyzingIds: Set<string>;
  refresh: () => Promise<void>;
  analyze: (productId: string) => Promise<void>;
}

// Fetches ALL products (no pagination) — used by the Dashboard for stats + chart
export function useAllProducts(): UseAllProductsReturn {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchProducts({ limit: 200, page: 1 });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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

  return { products, loading, error, analyzingIds, refresh, analyze };
}
