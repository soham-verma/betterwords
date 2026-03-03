import pool from './pool.js';

export interface DocumentRow {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export const db = {
  async listDocuments(ownerId: string, userEmail?: string): Promise<DocumentRow[]> {
    if (!userEmail) {
      const { rows } = await pool.query(
        `SELECT id, title, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"
         FROM documents WHERE owner_id = $1 ORDER BY updated_at DESC`,
        [ownerId]
      );
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        ownerId: r.ownerId,
        createdAt: r.createdAt?.toISOString?.() ?? r.createdAt ?? '',
        updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt ?? '',
      })) as DocumentRow[];
    }
    const { rows } = await pool.query(
      `SELECT id, title, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"
       FROM documents WHERE owner_id = $1
       UNION
       SELECT d.id, d.title, d.owner_id as "ownerId", d.created_at as "createdAt", d.updated_at as "updatedAt"
       FROM documents d
       JOIN document_permissions p ON p.document_id = d.id AND p.email = $2
       ORDER BY "updatedAt" DESC`,
      [ownerId, userEmail]
    );
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      ownerId: r.ownerId,
      createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
      updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
    })) as DocumentRow[];
  },
  async createDocument(title: string, ownerId: string): Promise<DocumentRow> {
    const { rows } = await pool.query(
      `INSERT INTO documents (id, title, owner_id) VALUES (gen_random_uuid()::text, $1, $2)
       RETURNING id, title, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"`,
      [title, ownerId]
    );
    const r = rows[0];
    return { id: r.id, title: r.title, ownerId: r.ownerId, createdAt: r.createdAt?.toISOString?.() ?? '', updatedAt: r.updatedAt?.toISOString?.() ?? '' };
  },
  async getDocument(id: string): Promise<DocumentRow | null> {
    const { rows } = await pool.query(
      `SELECT id, title, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"
       FROM documents WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return { id: r.id, title: r.title, ownerId: r.ownerId, createdAt: r.createdAt?.toISOString?.() ?? '', updatedAt: r.updatedAt?.toISOString?.() ?? '' };
  },
  async updateDocument(id: string, data: { title: string }): Promise<DocumentRow | null> {
    const { rows } = await pool.query(
      `UPDATE documents SET title = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, title, owner_id as "ownerId", created_at as "createdAt", updated_at as "updatedAt"`,
      [data.title, id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return { id: r.id, title: r.title, ownerId: r.ownerId, createdAt: r.createdAt?.toISOString?.() ?? '', updatedAt: r.updatedAt?.toISOString?.() ?? '' };
  },
  async deleteDocument(id: string) {
    await pool.query('DELETE FROM document_permissions WHERE document_id = $1', [id]);
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
  },
  async canAccess(documentId: string, userId: string, email: string | undefined, minRole: string): Promise<boolean> {
    const roleOrder = { viewer: 0, editor: 1, owner: 2 };
    const { rows } = await pool.query(
      `SELECT d.owner_id, p.role FROM documents d
       LEFT JOIN document_permissions p ON p.document_id = d.id AND p.email = $2
       WHERE d.id = $1`,
      [documentId, email || '']
    );
    if (!rows[0]) return false;
    const r = rows[0];
    if (r.owner_id === userId) return roleOrder[minRole as keyof typeof roleOrder] <= 2;
    if (r.role && r.role in roleOrder) return roleOrder[r.role as keyof typeof roleOrder] >= roleOrder[minRole as keyof typeof roleOrder];
    return false;
  },
  async getPermissions(documentId: string) {
    const { rows } = await pool.query(
      `SELECT document_id as "documentId", email, role FROM document_permissions WHERE document_id = $1`,
      [documentId]
    );
    return rows;
  },
  async addPermission(documentId: string, email: string, role: string) {
    await pool.query(
      `INSERT INTO document_permissions (document_id, email, role) VALUES ($1, $2, $3)
       ON CONFLICT (document_id, email) DO UPDATE SET role = $3`,
      [documentId, email, role]
    );
  },
  async removePermission(documentId: string, email: string) {
    await pool.query('DELETE FROM document_permissions WHERE document_id = $1 AND email = $2', [documentId, decodeURIComponent(email)]);
  },
  async ensureUser(id: string, email: string, name: string, picture: string) {
    await pool.query(
      `INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = $2, name = $3, picture = $4`,
      [id, email, name, picture]
    );
  },
};
