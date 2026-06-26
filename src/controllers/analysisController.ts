import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculateRestockUrgency } from '../services/fuzzyService';
import { analyzeRequestSchema, getProductsQuerySchema } from '../validators/schemas';

// ─── POST /api/v1/analyze ────────────────────────────────────────────────────
export const analyzeProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = analyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { productId } = parsed.data;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, error: `Product "${productId}" not found` });
      return;
    }

    const { urgencyScore, urgencyStatus } = calculateRestockUrgency(product.currentStock, product.dailySalesAvg);

    const analysis = await prisma.restockAnalysis.create({
      data: { productId: product.id, stockAtAnalysis: product.currentStock, salesVelocityAt: product.dailySalesAvg, urgencyScore, urgencyStatus },
    });

    res.status(201).json({ success: true, data: { product: { id: product.id, name: product.name, sku: product.sku }, analysis } });
  } catch (err) {
    console.error('[analyzeProduct]', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ─── GET /api/v1/products ────────────────────────────────────────────────────
// Supports: ?search=, ?page=, ?limit=, ?status=
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = getProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { search, page, limit, status } = parsed.data;

    // Build the Prisma where clause for search
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku:  { contains: search, mode: 'insensitive' as const } },
        ]}
      : {};

    // Fetch all search-matching products (status filter applied in-memory
    // because urgencyStatus lives on the related RestockAnalysis row)
    const all = await prisma.product.findMany({
      where,
      include: { analyses: { orderBy: { analyzedAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });

    let items = all.map(({ analyses, ...p }) => ({ ...p, latestAnalysis: analyses[0] ?? null }));

    if (status) {
      items = items.filter(p => p.latestAnalysis?.urgencyStatus === status);
    }

    const total      = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const data       = items.slice((page - 1) * limit, page * limit);

    res.json({ success: true, data, meta: { total, page, limit, totalPages } });
  } catch (err) {
    console.error('[getProducts]', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ─── GET /api/v1/products/export ─────────────────────────────────────────────
// Returns a UTF-8 CSV file (with BOM for Excel compatibility)
export const exportProductsCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { analyses: { orderBy: { analyzedAt: 'desc' }, take: 1 } },
      orderBy: { name: 'asc' },
    });

    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

    const header = ['Nama Produk', 'SKU', 'Stok Saat Ini', 'Rata-rata Jual/Hari', 'Urgency Score', 'Status', 'Tanggal Analisis']
      .map(esc).join(',');

    const rows = products.map(({ analyses, ...p }) => {
      const a = analyses[0];
      return [
        p.name,
        p.sku,
        p.currentStock,
        p.dailySalesAvg,
        a ? a.urgencyScore.toFixed(2) : '',
        a ? a.urgencyStatus : 'Belum Dianalisis',
        a ? new Date(a.analyzedAt).toLocaleString('id-ID') : '',
      ].map(esc).join(',');
    });

    const csv = [header, ...rows].join('\r\n');
    const filename = `restock-analysis-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send('﻿' + csv); // BOM prefix so Excel opens it correctly
  } catch (err) {
    console.error('[exportProductsCsv]', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
