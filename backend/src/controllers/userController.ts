import type { Request, Response } from 'express';
import prisma from '../config/database-extended.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, search } = req.query;
        const whereClause: any = {};

        if (role) whereClause.role = role as string;
        if (search) {
            whereClause.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                designation: true,
                department: true,
                isActive: true
            }
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Get users error", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Simplified creation for Admin usage
        const { email, password, MOname, role, designation } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name: req.body.name,
                role: role || 'EMPLOYEE',
                designation
            }
        });

        res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
    } catch (error) {
        console.error("Create user error", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userRole = req.user?.role;
        if (!companyId && userRole !== 'SUPER_ADMIN') {
            res.status(401).json({ success: false, message: 'Unauthorized: Company ID missing' });
            return;
        }

        // Count assigned tasks
        const assignmentsCount = await prisma.task.count({
            where: {
                assignedToId: userId,
                status: { not: 'COMPLETED' }
            }
        });

        const urgentCount = await prisma.task.count({
            where: {
                assignedToId: userId,
                priority: 'URGENT',
                status: { not: 'COMPLETED' }
            }
        });

        // Calculate productivity (weekly hours)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                userId,
                date: { gte: startOfWeek }
            },
            select: { totalHours: true }
        });

        const weeklyHours = attendance.reduce((sum, record) => sum + (Number(record.totalHours) || 0), 0);

        // Upcoming Ops (meetings)
        const now = new Date();
        const upcomingMeetings = await prisma.meeting.count({
            where: {
                participants: {
                    some: { userId }
                },
                startTime: { gte: now }
            }
        });

        res.json({
            success: true,
            data: {
                assignmentsCount,
                urgentCount,
                weeklyHours: weeklyHours.toFixed(1),
                upcomingMeetings
            }
        });
    } catch (error) {
        console.error("Dashboard stats error", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
