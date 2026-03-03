import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRoutes = Router();
authRoutes.use(authMiddleware.optional);
authRoutes.get('/me', authController.me);
authRoutes.get('/google', authController.googleAuth);
authRoutes.get('/google/callback', authController.googleCallback);
authRoutes.post('/logout', authController.logout);
