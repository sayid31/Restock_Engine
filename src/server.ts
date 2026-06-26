import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1', router);

// ── 404 fallthrough ─────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});

export default app;
