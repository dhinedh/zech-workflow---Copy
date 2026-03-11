import express from 'express';
import { checkIn, checkOut, getAttendance } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
const router = express.Router();
router.use(authenticate);
router.use(tenantMiddleware);
router.get('/', getAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
export default router;
//# sourceMappingURL=attendance.js.map