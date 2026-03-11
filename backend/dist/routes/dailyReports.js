import express from 'express';
import { submitDailyReport, getDailyReports, updateReportStatus } from '../controllers/dailyReportController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';
const router = express.Router();
// Middleware
import { tenantMiddleware } from '../middleware/tenant.js';
router.use(authenticate);
router.use(tenantMiddleware);
router.post('/', submitDailyReport);
router.get('/', getDailyReports);
// Manager actions
router.put('/:id/status', requireRole([Role.MANAGER, Role.SUPER_ADMIN]), updateReportStatus);
export default router;
//# sourceMappingURL=dailyReports.js.map