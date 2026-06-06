// src/routes/preferences.js
import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getPreferences);
router.patch('/', requireAuth, updatePreferences);

export default router;
