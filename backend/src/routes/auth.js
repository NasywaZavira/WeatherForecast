// src/routes/auth.js
import { Router } from 'express';
import { register, login, me, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);
router.patch('/me/password', requireAuth, changePassword);

export default router;
