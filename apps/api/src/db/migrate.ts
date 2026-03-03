import pool from './pool.js';

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      picture TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_permissions (
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'owner')),
      PRIMARY KEY (document_id, email)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_state (
      document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
      state BYTEA NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    INSERT INTO users (id, email, name, picture) VALUES ('demo-user', 'demo@test.com', 'Demo User', '')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('Migrations done.');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
