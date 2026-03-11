import prisma from '../config/database-extended.js';
import { z } from 'zod';
import { MeetingType, Role } from '@prisma/client';
const createMeetingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startTime: z.string().transform(str => new Date(str)),
    endTime: z.string().transform(str => new Date(str)),
    meetingLink: z.string().url("Invalid URL").optional(),
    projectId: z.string().optional(),
});
export const createMeeting = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const userRole = req.user?.role;
        if (!userId || (!companyId && userRole !== Role.SUPER_ADMIN)) {
            res.status(401).json({ success: false, message: 'Unauthorized or Company ID missing' });
            return;
        }
        const validation = createMeetingSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, error: validation.error.format() });
            return;
        }
        const { title, description, startTime, endTime, meetingLink, projectId } = validation.data;
        // Default type
        const meetingType = MeetingType.TEAM_MEETING;
        const meeting = await prisma.meeting.create({
            data: {
                companyId: companyId,
                title,
                description: description ?? null,
                startTime,
                endTime,
                meetingLink: meetingLink ?? null,
                meetingType,
                projectId: projectId ?? null,
                organizerId: userId,
            },
            include: {
                organizer: { select: { name: true, avatar: true } }
            }
        });
        res.status(201).json({ success: true, data: meeting });
    }
    catch (error) {
        console.error('Create meeting error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const getMeetings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const userRole = req.user?.role;
        if (!companyId && userRole !== Role.SUPER_ADMIN) {
            res.status(400).json({ success: false, message: 'Company ID missing' });
            return;
        }
        const whereClause = {
            startTime: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // From today onwards
            }
        };
        if (companyId) {
            whereClause.companyId = companyId;
        }
        // Fetch all upcoming meetings for now
        const meetings = await prisma.meeting.findMany({
            where: whereClause,
            include: {
                organizer: { select: { name: true, avatar: true } },
                project: { select: { name: true } }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        res.json({ success: true, data: meetings });
    }
    catch (error) {
        console.error('Get meetings error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=meetingController.js.map