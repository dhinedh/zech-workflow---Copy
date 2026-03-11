import express from 'express';
import { Role } from '@prisma/client';
import { tenantMiddleware } from '../middleware/tenant.js';
import { getProjects, getProject, getProjectDashboard, createProject } from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware); // Protect all project routes

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.get('/:id/dashboard', getProjectDashboard);

export default router;
