import express from 'express';
import { createMeeting, getMeetings } from '../controllers/meetingController.js';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
const router = express.Router();
router.use(authenticate);
router.use(tenantMiddleware);
router.get('/', getMeetings);
router.post('/', createMeeting);
export default router;
//# sourceMappingURL=meetings.js.map