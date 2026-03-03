import type { Express } from 'express';
import { authRoutes } from './auth.js';
import { documentRoutes } from './documents.js';

export function registerRoutes(app: Express) {
  app.get('/api/health', (_, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);
}
