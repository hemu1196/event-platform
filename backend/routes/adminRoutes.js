import express from 'express';
import { getPlatformAnalytics, getAllUsers, deleteUser } from '../controllers/adminController.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', isAdmin, getPlatformAnalytics);
router.get('/users', isAdmin, getAllUsers);
router.delete('/users/:id', isAdmin, deleteUser);

export default router;
