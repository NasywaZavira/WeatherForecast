// Jalankan migrasi database secara manual (sekali saja)
// Usage: node src/config/migrate.js
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    username   TEXT   NOT NULL UNIQUE,
    email      TEXT   NOT NULL UNIQUE,
    password   TEXT   NOT NULL,
    role       TEXT   NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    temp_unit      TEXT    NOT NULL DEFAULT 'celsius',
    wind_unit      TEXT    NOT NULL DEFAULT 'kmh',
    pressure_unit  TEXT    NOT NULL DEFAULT 'hpa',
    time_format    TEXT    NOT NULL DEFAULT '24h',
    theme          TEXT    NOT NULL DEFAULT 'dark',
    language       TEXT    NOT NULL DEFAULT 'en',
    default_city   TEXT    NOT NULL DEFAULT 'Medan',
    animations_on  BOOLEAN NOT NULL DEFAULT TRUE,
    notif_rain     BOOLEAN NOT NULL DEFAULT TRUE,
    notif_severe   BOOLEAN NOT NULL DEFAULT TRUE,
    notif_daily    BOOLEAN NOT NULL DEFAULT FALSE,
    notif_uv       BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS favorite_locations (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_name  TEXT    NOT NULL,
    lat        FLOAT,
    lon        FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, city_name)
  );
  CREATE TABLE IF NOT EXISTS search_history (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_name   TEXT    NOT NULL,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[Migrate] Mulai migrasi...');
    await client.query(SQL);
    console.log('[Migrate] Migrasi tabel selesai ✅');
  } catch (err) {
    console.error('[Migrate] Gagal:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();