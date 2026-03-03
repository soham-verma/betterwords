import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import { db } from './db/client.js';
import { getDocState, setDocState } from './db/yjs-state.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const docs = new Map<string, Y.Doc>();
const docClients = new Map<string, Set<import('ws').WebSocket>>();

async function getOrCreateDoc(documentId: string): Promise<Y.Doc> {
  let doc = docs.get(documentId);
  if (!doc) {
    doc = new Y.Doc();
    const saved = await getDocState(documentId);
    if (saved && saved.length > 0) Y.applyUpdate(doc, new Uint8Array(saved));
    docs.set(documentId, doc);
    docClients.set(documentId, new Set());
  }
  return doc;
}

function broadcast(documentId: string, data: Uint8Array, exclude?: import('ws').WebSocket) {
  const clients = docClients.get(documentId);
  if (!clients) return;
  clients.forEach((ws) => {
    if (ws !== exclude && ws.readyState === 1) ws.send(data);
  });
}

export function attachWebSocket(server: import('http').Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const documentId = url.searchParams.get('doc');
    const token = url.searchParams.get('token') || url.searchParams.get('authorization')?.replace('Bearer ', '');
    if (!documentId) {
      ws.close(4000, 'doc required');
      return;
    }
    let user: { id: string; email?: string };
    // Demo mode: bypass real auth for testing
    if (token === 'demo' || !token) {
      user = { id: 'demo-user', email: 'demo@test.com' };
    } else {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        user = { id: payload.sub || payload.id, email: payload.email };
      } catch {
        ws.close(4001, 'Invalid token');
        return;
      }
    }
    const canEdit = await db.canAccess(documentId, user.id, user.email, 'editor');
    const canView = await db.canAccess(documentId, user.id, user.email, 'viewer');
    if (!canView) {
      ws.close(4003, 'Forbidden');
      return;
    }
    const ydoc = await getOrCreateDoc(documentId);
    docClients.get(documentId)!.add(ws);

    const send = (data: ArrayBuffer | Uint8Array) => {
      if (ws.readyState === 1) ws.send(data);
    };

    const state = Y.encodeStateAsUpdate(ydoc);
    if (state.length > 0) send(state);

    const updateHandler = (update: Uint8Array) => {
      broadcast(documentId, update, ws);
    };
    ydoc.on('update', updateHandler);

    const interval = setInterval(async () => {
      const state = Y.encodeStateAsUpdate(ydoc);
      if (state.length > 0) await setDocState(documentId, Buffer.from(state));
    }, 5000);

    ws.binaryType = 'arraybuffer';
    ws.on('message', async (data: ArrayBuffer) => {
      if (!canEdit) return;
      try {
        Y.applyUpdate(ydoc, new Uint8Array(data));
      } catch (e) {
        console.error('Yjs applyUpdate', e);
      }
    });

    ws.on('close', () => {
      docClients.get(documentId)?.delete(ws);
      ydoc.off('update', updateHandler);
      clearInterval(interval);
      const state = Y.encodeStateAsUpdate(ydoc);
      if (state.length > 0) setDocState(documentId, Buffer.from(state)).catch(() => {});
    });
  });
}
