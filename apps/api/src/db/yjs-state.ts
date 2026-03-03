import pool from './pool.js';

export async function getDocState(documentId: string): Promise<Buffer | null> {
  const { rows } = await pool.query('SELECT state FROM document_state WHERE document_id = $1', [documentId]);
  return rows[0]?.state ?? null;
}

export async function setDocState(documentId: string, state: Buffer | null): Promise<void> {
  if (state === null) {
    await pool.query(
      `INSERT INTO document_state (document_id, state) VALUES ($1, $2)
       ON CONFLICT (document_id) DO UPDATE SET state = $2, updated_at = NOW()`,
      [documentId, Buffer.alloc(0)]
    );
  } else {
    await pool.query(
      `INSERT INTO document_state (document_id, state) VALUES ($1, $2)
       ON CONFLICT (document_id) DO UPDATE SET state = $2, updated_at = NOW()`,
      [documentId, state]
    );
  }
}
