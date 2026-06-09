// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Import DB terlebih dahulu agar tabel terbuat sebelum routes
import './config/database.js';

import authRoutes        from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import locationsRoutes   from './routes/locations.js';
import adminRoutes       from './routes/admin.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parser ─────────────────────────────────────────────
app.use(express.json());

// ─── Rate Limiting ───────────────────────────────────────────
// Auth endpoints: lebih ketat
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20,
  message: { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General: lebih longgar
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Terlalu banyak request. Coba lagi sebentar lagi.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/locations',   locationsRoutes);
app.use('/api/admin',       adminRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Terjadi kesalahan server yang tidak terduga.' });
});

// ─── Export untuk Vercel / Start untuk lokal ─────────────────
// Vercel serverless → import app; lokal → jalankan server
// Vercel otomatis set env VERCEL=1 (system environment variable)
const isVercel = !!process.env.VERCEL;

// Selalu export default app (Vercel serverless butuh ini)
export default app;

// Hanya listen jika bukan di lingkungan Vercel
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`[Server] Berjalan di http://localhost:${PORT}`);
    console.log(`[Env]    NODE_ENV = ${process.env.NODE_ENV || 'development'}`);
  });
}
