// Vercel handler — setup Express and export
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// DB — hanya koneksi, TANPA migrate otomatis
import './config/database.js';

import authRoutes        from './routes/auth.js';
import preferencesRoutes from './routes/preferences.js';
import locationsRoutes   from './routes/locations.js';
import adminRoutes       from './routes/admin.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

app.use(express.json());

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Terjadi kesalahan server yang tidak terduga.' });
});

export default app;