import prisma from '../config/database-extended.js';
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const notification = await prisma.notification.update({
            where: {
                id: id,
                userId // Ensure user only marks their own notifications
            },
            data: {
                isRead: true
            }
        });
        res.json({ success: true, data: notification });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=notificationController.js.map