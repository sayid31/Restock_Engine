import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculateRestockUrgency } from '../services/fuzzyService';

// Ten products spanning all four urgency zones — realistic Indonesian B2B inventory
const DEMO_PRODUCTS = [
  // ── Emergency zone (low stock, fast sales) ─────────────────────────────────
  { name: 'Masker N95 Premium',        sku: 'MSK-N95-001', currentStock: 8,   dailySalesAvg: 22  },
  { name: 'Sarung Tangan Nitrile L',   sku: 'SGT-NIT-002', currentStock: 5,   dailySalesAvg: 18  },
  { name: 'Jas Hujan Industrial XL',   sku: 'JHI-XL-003',  currentStock: 11,  dailySalesAvg: 16  },
  // ── Urgent zone (low-medium stock, normal-fast sales) ───────────────────────
  { name: 'Hand Sanitizer 500ml',      sku: 'HSN-500-004', currentStock: 14,  dailySalesAvg: 13  },
  { name: 'Sepatu Safety ISO Steel',   sku: 'SPS-ISO-005', currentStock: 18,  dailySalesAvg: 10  },
  // ── Watch zone (medium stock, normal sales) ─────────────────────────────────
  { name: 'Helm Proyek Kuning',        sku: 'HPK-YLW-006', currentStock: 33,  dailySalesAvg: 9   },
  { name: 'Tali Pengaman 10m',         sku: 'TPS-10M-007', currentStock: 44,  dailySalesAvg: 5   },
  // ── Safe zone (high stock, slow sales) ──────────────────────────────────────
  { name: 'Rompi Keselamatan Merah',   sku: 'RVK-RED-008', currentStock: 80,  dailySalesAvg: 3   },
  { name: 'Kacamata Pelindung UV',     sku: 'KMP-UV-009',  currentStock: 115, dailySalesAvg: 2   },
  { name: 'Sepatu Bot Karet',          sku: 'SBK-RBR-010', currentStock: 62,  dailySalesAvg: 1.5 },
];

export const seedDemoData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const results = [];

    for (const p of DEMO_PRODUCTS) {
      // Upsert product — idempotent, safe to call multiple times
      const product = await prisma.product.upsert({
        where:  { sku: p.sku },
        update: { name: p.name, currentStock: p.currentStock, dailySalesAvg: p.dailySalesAvg },
        create: p,
      });

      // Always create a fresh analysis so charts reflect current seed values
      const { urgencyScore, urgencyStatus } = calculateRestockUrgency(
        product.currentStock,
        product.dailySalesAvg,
      );

      const analysis = await prisma.restockAnalysis.create({
        data: {
          productId:       product.id,
          stockAtAnalysis: product.currentStock,
          salesVelocityAt: product.dailySalesAvg,
          urgencyScore,
          urgencyStatus,
        },
      });

      results.push({ ...product, latestAnalysis: analysis });
    }

    res.status(201).json({
      success: true,
      message: `${results.length} produk demo berhasil dimuat`,
      data: results,
    });
  } catch (err) {
    console.error('[seedDemoData]', err);
    res.status(500).json({ success: false, error: 'Gagal melakukan seed data demo' });
  }
};
