import express from 'express';
import { Role } from '@prisma/client';
import { tenantMiddleware } from '../middleware/tenant.js';
import { approveMilestone, requestChanges } from '../controllers/milestoneController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.use(authenticate);
router.use(tenantMiddleware);
router.put('/:id/approve', approveMilestone);
router.put('/:id/request-changes', requestChanges);
export default router;
//# sourceMappingURL=milestones.js.map