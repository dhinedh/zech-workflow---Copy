import prisma from '../config/database-extended.js';
export const checkIn = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        if (!userId || !companyId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        // Check if already checked in today
        const existing = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date
                }
            }
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'Already checked in for today' });
            return;
        }
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                companyId,
                date,
                checkInTime: new Date(),
                workType: 'OFFICE' // Default
            }
        });
        res.status(201).json({ success: true, data: attendance });
    }
    catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const checkOut = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date
                }
            }
        });
        if (!attendance) {
            res.status(404).json({ success: false, message: 'No check-in record found for today' });
            return;
        }
        if (attendance.checkOutTime) {
            res.status(400).json({ success: false, message: 'Already checked out for today' });
            return;
        }
        const checkOutTime = new Date();
        const diffMs = checkOutTime.getTime() - attendance.checkInTime.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);
        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOutTime,
                totalHours: Number(totalHours.toFixed(2))
            }
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const getAttendance = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const { startDate, endDate, userId: filterUserId } = req.query;
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        if (userRole === 'SUPER_ADMIN' || userRole === 'MANAGER') {
            if (filterUserId)
                whereClause.userId = filterUserId;
        }
        else {
            whereClause.userId = userId;
        }
        const records = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json({ success: true, data: records });
    }
    catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=attendanceController.js.map