import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.connect((err, client, release) => {
  if (err) { console.error('[DB] Gagal konek:', err.message); return; }
  release();
  console.log('[DB] Terhubung ke Neon PostgreSQL ✅');
});

export default pool;
