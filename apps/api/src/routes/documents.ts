import { Router } from 'express';
import { documentController } from '../controllers/documents.js';
import { authMiddleware } from '../middleware/auth.js';

export const documentRoutes = Router();
documentRoutes.use(authMiddleware.optional);
documentRoutes.get('/', documentController.list);
documentRoutes.post('/', documentController.create);
documentRoutes.get('/:id', documentController.get);
documentRoutes.patch('/:id', documentController.update);
documentRoutes.delete('/:id', documentController.delete);
documentRoutes.get('/:id/permissions', documentController.getPermissions);
documentRoutes.post('/:id/permissions', documentController.addPermission);
documentRoutes.delete('/:id/permissions/:email', documentController.removePermission);
documentRoutes.get('/:id/state', documentController.getState);
