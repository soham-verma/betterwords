import pg from 'pg';
const { Pool } = pg;

export default new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/betterwords',
});
