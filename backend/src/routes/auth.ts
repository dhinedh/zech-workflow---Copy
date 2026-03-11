import express from 'express';
import { login, register, logout, getMe, changePassword, updateProfile, refresh } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, tenantMiddleware, getMe);
router.post('/change-password', authenticate, tenantMiddleware, changePassword);
router.put('/profile', authenticate, tenantMiddleware, updateProfile);

export default router;
