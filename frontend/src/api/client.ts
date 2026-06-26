import type { GetProductsParams, PaginationMeta, Product, RestockAnalysis } from '../types';

const BASE = '/api/v1';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res  = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

export async function fetchProducts(
  params?: GetProductsParams,
): Promise<{ data: Product[]; meta: PaginationMeta }> {
  const url = new URL(BASE + '/products', window.location.origin);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.page   != null) url.searchParams.set('page',   String(params.page));
  if (params?.limit  != null) url.searchParams.set('limit',  String(params.limit));
  if (params?.status)         url.searchParams.set('status', params.status);

  const json = await request<{ success: boolean; data: Product[]; meta: PaginationMeta }>(
    url.pathname + url.search,
  );
  return { data: json.data, meta: json.meta };
}

export async function analyzeProduct(productId: string): Promise<{
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  analysis: RestockAnalysis;
}> {
  const json = await request<{
    success: boolean;
    data: { product: Pick<Product, 'id' | 'name' | 'sku'>; analysis: RestockAnalysis };
  }>(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  return json.data;
}

export async function seedDemoData(): Promise<void> {
  await request<{ success: boolean }>(`${BASE}/seed`, { method: 'POST' });
}

export function triggerCsvExport(): void {
  const a = document.createElement('a');
  a.href = `${BASE}/products/export`;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
