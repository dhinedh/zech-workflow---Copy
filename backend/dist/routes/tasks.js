import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { tenantMiddleware } from '../middleware/tenant.js';
const router = express.Router();
router.use(authenticate);
router.use(tenantMiddleware);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', requireRole([Role.MANAGER, Role.SUPER_ADMIN]), deleteTask);
export default router;
//# sourceMappingURL=tasks.js.map