import type { Request, Response } from 'express';
import prisma from '../config/database-extended.js'; // Use the extended client
import { z } from 'zod';
import { Role } from '@prisma/client';

// Schema for creating a daily report
const createReportSchema = z.object({
    date: z.string().transform((str) => new Date(str)), // ISO Date string
    taskIds: z.array(z.string()),
    hoursWorked: z.number().min(0).max(24),
    progressPct: z.number().min(0).max(100).optional().default(0),
    accomplishments: z.string().min(1),
    problems: z.string().optional(),
    tomorrowPlan: z.string().optional(),
    selfRating: z.number().min(1).max(5).default(3),
    proofFileUrl: z.string().optional(),
});

export const submitDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const validation = createReportSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, error: validation.error.issues });
            return;
        }

        const { date, taskIds, hoursWorked, progressPct, accomplishments, problems, tomorrowPlan, selfRating, proofFileUrl } = validation.data;

        const companyId = req.user?.companyId;
        const userRole = req.user?.role;
        if (!companyId && userRole !== 'SUPER_ADMIN') {
            res.status(400).json({ success: false, message: 'Company ID missing from user context' });
            return;
        }

        // Check if report already exists for this date
        // findFirst is automatically scoped to companyId via context
        const existingReport = await prisma.dailyReport.findFirst({
            where: {
                userId,
                date,
            },
        });

        if (existingReport) {
            res.status(409).json({ success: false, message: 'Report already submitted for this date' });
            return;
        }

        const report = await prisma.dailyReport.create({
            data: {
                userId,
                companyId: companyId as string,
                date,
                taskIds,
                hoursWorked,
                progressPct,
                accomplishments,
                problems: problems ?? null,
                tomorrowPlan: tomorrowPlan ?? null,
                selfRating,
                proofFileUrl: proofFileUrl ?? null,
                status: 'SUBMITTED',
            },
        });

        // Notify manager (mock logic for now - normally would trigger via EventBus / Socket)
        // const user = await prisma.user.findUnique({ where: { id: userId }, include: { manager: true } });
        // if (user?.managerId) { ... send notification ... }

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getDailyReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const { startDate, endDate, userId: filterUserId, status } = req.query;
        // companyId is auto-injected by context
        // const companyId = req.user?.companyId;

        const whereClause: any = {};

        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }

        if (status) {
            whereClause.status = status;
        }

        // Access Control
        if (userRole === 'SUPER_ADMIN') {
            // Super Admin sees all report
            // Can optionally filter by specific userId if provided in query
            if (filterUserId) {
                whereClause.userId = filterUserId;
            }
        } else if (userRole === 'EMPLOYEE' || (userRole as string) === 'FREELANCER') {
            whereClause.userId = userId;
        } else if (userRole === 'MANAGER') {
            if (filterUserId) {
                // Ensure the filtered user is in the same company (implicitly handled by companyId)
                // And ideally managed by this manager
                whereClause.userId = filterUserId;
            } else {
                // Get all reports from employees managed by this user OR the user themselves
                const team = await prisma.user.findMany({
                    where: { managerId: userId },
                    select: { id: true }
                });
                const teamIds = team.map(u => u.id);
                whereClause.userId = { in: [...teamIds, userId] };
            }
        } else if (userRole === 'CLIENT') {
            // Client sees approved reports for projects they are assigned to
            // This requires fetching projects associated with the client
            whereClause.status = 'APPROVED';

            // Find projects where this user is the client
            const clientProjects = await prisma.project.findMany({
                where: { clientId: userId },
                select: { id: true, tasks: { select: { id: true } } }
            });

            // Get task IDs for these projects
            const projectTaskIds = clientProjects.flatMap(p => p.tasks.map(t => t.id));

            // Filter reports that reference these tasks
            // Report `taskIds` is an array of strings. 
            // Prisma `hasSome` can check if array overlaps.
            if (projectTaskIds.length > 0) {
                whereClause.taskIds = { hasSome: projectTaskIds };
            } else {
                // No projects, no reports
                res.json({ success: true, data: [] });
                return;
            }
        }

        const reports = await prisma.dailyReport.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, name: true, avatar: true, role: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Fetch task details for all reports
        const allTaskIds = Array.from(new Set(reports.flatMap(r => r.taskIds)));

        let tasksMap: Record<string, any> = {};
        if (allTaskIds.length > 0) {
            const tasks = await prisma.task.findMany({
                where: { id: { in: allTaskIds } },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    project: {
                        select: { name: true }
                    }
                }
            });
            tasks.forEach(task => {
                tasksMap[task.id] = task;
            });
        }

        // Attach tasks to reports
        const reportsWithTasks = reports.map(report => ({
            ...report,
            tasks: report.taskIds.map(taskId => tasksMap[taskId]).filter(Boolean)
        }));

        res.json({ success: true, data: reportsWithTasks });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { status, feedback } = req.body;
        const userId = req.user?.userId;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }

        // Verify manager permission
        // In a real app, check if req.user is the manager of the report owner.
        // For now, assuming RBAC middleware handles 'MANAGER' role check.

        // Let's refactor to findFirst + update for safety since we didn't extend update/updateMany
        const report = await prisma.dailyReport.findFirst({ where: { id } }); // Context injects companyId
        if (!report) {
            res.status(404).json({ success: false, message: 'Report not found' });
            return;
        }

        const updatedReport = await prisma.dailyReport.update({
            where: { id },
            data: {
                status,
                managerFeedback: feedback ?? null
            }
        });

        res.json({ success: true, data: updatedReport });
    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
