import { Router } from 'express';
import { analyzeProduct, getProducts, exportProductsCsv } from './controllers/analysisController';
import { seedDemoData } from './controllers/seedController';

const router = Router();

router.get('/products/export', exportProductsCsv);
router.get('/products',        getProducts);
router.post('/analyze',        analyzeProduct);
router.post('/seed',           seedDemoData);

export default router;
