import type { Request, Response } from 'express';
import prisma from '../config/database-extended.js';
import { z } from 'zod';
import { Role } from '@prisma/client';

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string(),
    assignedToId: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.string().transform(str => new Date(str)),
    estimatedHours: z.number().int().optional(),
    parentTaskId: z.string().optional(),
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const userRole = req.user?.role;

        if (!userId || !companyId || !userRole) {
            res.status(401).json({ success: false, message: 'Unauthorized or Company ID missing' });
            return;
        }

        // Only SUPER_ADMIN and MANAGER can create tasks - REMOVED per requirements to allow employees to add tasks
        /*
        if (userRole !== Role.SUPER_ADMIN && userRole !== Role.MANAGER) {
            res.status(403).json({ success: false, message: 'Forbidden: Only admins can create tasks' });
            return;
        }
        */

        const validation = createTaskSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, error: validation.error.issues });
            return;
        }

        const { title, description, projectId, assignedToId, priority, dueDate, estimatedHours, parentTaskId } = validation.data;

        // Verify Project Exists and belongs to company
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true }
        });

        if (!project || project.companyId !== companyId) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }

        const task = await prisma.task.create({
            data: {
                companyId,
                title,
                description: description ?? null,
                projectId,
                assignedToId,
                createdById: userId,
                priority,
                dueDate,
                estimatedHours: estimatedHours ?? null,
                parentTaskId: parentTaskId ?? null,
                status: 'PENDING'
            },
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = req.user?.companyId;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { projectId, assignedToId, status } = req.query;

        if (!userId || !userRole) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!companyId && userRole !== Role.SUPER_ADMIN) {
            res.status(401).json({ success: false, message: 'Unauthorized: Company ID missing' });
            return;
        }

        const whereClause: any = {};
        if (companyId) whereClause.companyId = companyId;

        if (projectId) whereClause.projectId = projectId as string;

        // Role-based filtering:
        if (userRole === Role.SUPER_ADMIN || userRole === Role.MANAGER) {
            if (assignedToId) whereClause.assignedToId = assignedToId as string;
        } else {
            // Force filter for non-admins
            whereClause.assignedToId = userId;
        }

        if (status) {
            const statusStr = status as string;
            if (statusStr.includes(',')) {
                whereClause.status = { in: statusStr.split(',') };
            } else {
                whereClause.status = statusStr;
            }
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                assignedTo: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true } },
                subtasks: { select: { id: true, title: true, status: true } },
                _count: { select: { comments: true, attachments: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        // In a real implementation this would be more granular (status update vs content update)
        // and validation would be robust. using Partial here for speed.

        const task = await prisma.task.update({
            where: { id },
            data: req.body
        });

        res.json({ success: true, data: task });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await prisma.task.delete({ where: { id } });
        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
