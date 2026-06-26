export type UrgencyStatus = 'Safe' | 'Watch' | 'Urgent' | 'Emergency';
export type PageView      = 'dashboard' | 'inventory' | 'reports' | 'settings';

export interface RestockAnalysis {
  id: string;
  productId: string;
  stockAtAnalysis: number;
  salesVelocityAt: number;
  urgencyScore: number;
  urgencyStatus: UrgencyStatus;
  analyzedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  dailySalesAvg: number;
  createdAt: string;
  updatedAt: string;
  latestAnalysis: RestockAnalysis | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: UrgencyStatus;
}
