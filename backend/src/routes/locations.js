// src/routes/locations.js
import { Router } from 'express';
import {
  getFavorites, addFavorite, removeFavorite,
  getSearchHistory, addSearchHistory, clearSearchHistory
} from '../controllers/locationsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Semua route butuh auth
router.use(requireAuth);

// Favorites
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:id', removeFavorite);

// Search history
router.get('/history', getSearchHistory);
router.post('/history', addSearchHistory);
router.delete('/history', clearSearchHistory);

export default router;
