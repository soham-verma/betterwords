import { Request, Response } from 'express';
import { db } from '../db/client.js';
import { getDocState, setDocState } from '../db/yjs-state.js';

function id(req: Request, key: string): string {
  const v = req.params[key];
  return Array.isArray(v) ? v[0]! : v ?? '';
}

export const documentController = {
  async list(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const docs = await db.listDocuments(user.id, user.email);
    res.json(docs);
  },
  async create(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const title = (req.body?.title as string) || 'Untitled';
    const doc = await db.createDocument(title, user.id);
    await setDocState(doc.id, null);
    res.status(201).json(doc);
  },
  async get(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const doc = await db.getDocument(docId);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'viewer');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    res.json(doc);
  },
  async update(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'editor');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    const title = req.body?.title as string | undefined;
    if (title === undefined) return res.status(400).json({ error: 'title required' });
    const doc = await db.updateDocument(docId, { title });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  },
  async delete(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'owner');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    await db.deleteDocument(docId);
    res.status(204).send();
  },
  async getPermissions(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'viewer');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    const perms = await db.getPermissions(docId);
    res.json(perms);
  },
  async addPermission(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'owner');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    const { email, role } = req.body || {};
    if (!email || !role) return res.status(400).json({ error: 'email and role required' });
    await db.addPermission(docId, email, role);
    const perms = await db.getPermissions(docId);
    res.json(perms);
  },
  async removePermission(req: Request, res: Response) {
    const docId = id(req, 'id');
    const emailParam = id(req, 'email');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'owner');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    await db.removePermission(docId, emailParam);
    res.status(204).send();
  },
  async getState(req: Request, res: Response) {
    const docId = id(req, 'id');
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const canAccess = await db.canAccess(docId, user.id, user.email, 'viewer');
    if (!canAccess) return res.status(403).json({ error: 'Forbidden' });
    const state = await getDocState(docId);
    if (!state) return res.status(204).send();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(state);
  },
};
