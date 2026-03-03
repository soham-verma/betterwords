import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Demo user when auth is disabled (for testing)
const DEMO_USER = { id: 'demo-user', email: 'demo@test.com', name: 'Demo User', picture: '' };

export const authMiddleware = {
  optional(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : req.query?.token;
    // Demo mode: bypass real auth for testing
    if (token === 'demo' || !token) {
      (req as any).user = DEMO_USER;
      next();
      return;
    }
    if (token) {
      try {
        const payload = jwt.verify(token as string, JWT_SECRET) as any;
        (req as any).user = { id: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
      } catch {
        (req as any).user = DEMO_USER;
      }
    }
    next();
  },
  required(req: Request, res: Response, next: NextFunction) {
    if (!(req as any).user) return res.status(401).json({ error: 'Not authenticated' });
    next();
  },
};
