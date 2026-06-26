import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { fetchProducts, analyzeProduct as apiAnalyze } from '../api/client';

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  analyzingIds: Set<string>;
  refresh: () => Promise<void>;
  analyze: (productId: string) => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk');
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
      console.error('[analyze] gagal:', err);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, []);

  return { products, loading, error, analyzingIds, refresh, analyze };
}
