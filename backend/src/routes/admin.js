// src/routes/admin.js
import { Router } from 'express';
import {
  getAllUsers, getUserById, updateUserRole, deleteUser, getStats
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Semua route admin butuh auth + role admin
router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
