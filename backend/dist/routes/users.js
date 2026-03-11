import express from 'express';
import { getUsers, createUser, getDashboardStats } from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { tenantMiddleware } from '../middleware/tenant.js';
const router = express.Router();
router.use(authenticate);
router.use(tenantMiddleware);
router.get('/', getUsers);
router.get('/stats', getDashboardStats);
router.post('/', requireRole([Role.SUPER_ADMIN, Role.MANAGER]), createUser);
export default router;
//# sourceMappingURL=users.js.map