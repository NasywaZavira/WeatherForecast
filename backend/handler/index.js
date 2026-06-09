// Vercel serverless handler — self-contained Express app
// Tahan banting: DB failure tidak akan bikin crash
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS manual: allow semua origin
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Tangani preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// ─── Health Check (gak butuh DB) ──────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Lazy-load routes & DB hanya saat ada request ──────────
// DB & routes cuma di-import pas pertama kali diakses,
// jadi kalo DB error, health check tetep jalan.
let initialized = false;

async function ensureInit() {
  if (initialized) return;
  
  try {
    // Import DB (koneksi)
    await import('../src/config/database.js');
    console.log('[Vercel] DB initialized');
  } catch (e) {
    console.error('[Vercel] DB init failed:', e.message);
  }

  // Import routes
  const authRoutes        = (await import('../src/routes/auth.js')).default;
  const preferencesRoutes = (await import('../src/routes/preferences.js')).default;
  const locationsRoutes   = (await import('../src/routes/locations.js')).default;
  const adminRoutes       = (await import('../src/routes/admin.js')).default;

  // Import rate limiter
  const rateLimit = (await import('express-rate-limit')).default;

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Terlalu banyak request. Coba lagi sebentar lagi.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);

  app.use('/api/auth',        authRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/api/locations',   locationsRoutes);
  app.use('/api/admin',       adminRoutes);

  initialized = true;
  console.log('[Vercel] Routes & DB ready');
}

// Middleware: init DB & routes on first API request
app.use('/api', async (req, res, next) => {
  try {
    await ensureInit();
    next();
  } catch (e) {
    console.error('[Vercel] Init error:', e);
    res.status(500).json({ error: 'Server sedang sibuk. Coba lagi.' });
  }
});

// ─── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Terjadi kesalahan server yang tidak terduga.' });
});

export default app;