import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const getProductsQuerySchema = z.object({
  search: z.string().optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(200).default(10),
  status: z.enum(['Safe', 'Watch', 'Urgent', 'Emergency']).optional(),
});

export type AnalyzeRequest    = z.infer<typeof analyzeRequestSchema>;
export type GetProductsQuery  = z.infer<typeof getProductsQuerySchema>;
