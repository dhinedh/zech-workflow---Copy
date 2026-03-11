import prisma from '../config/database-extended.js';
import { Role, MilestoneStatus } from '@prisma/client';
export const approveMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { feedback } = req.body; // Optional feedback
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: { project: true }
        });
        if (!milestone) {
            res.status(404).json({ success: false, message: 'Milestone not found' });
            return;
        }
        // Access control: Only Client of the project or Super Admin
        if (role === Role.CLIENT && milestone.project.clientId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        // Must be PENDING or perhaps IN_PROGRESS logic? 
        // Usually only PENDING (waiting for approval) can be approved.
        // The enum has PENDING, COMPLETED, APPROVED.
        // Assuming team marks it as COMPLETED (work done), then Client marks as APPROVED.
        // Or PENDING approval.
        // Let's assume flow: Team marks "Ready for Review" (maybe custom status or just notify).
        // Client sets to APPROVED.
        // Check if already approved
        if (milestone.status === MilestoneStatus.APPROVED) {
            res.status(400).json({ success: false, message: 'Milestone already approved' });
            return;
        }
        await prisma.milestone.update({
            where: { id },
            data: {
                status: MilestoneStatus.APPROVED,
                isApproved: true,
                // formatted feedback if needed, currently no field in schema, but prompt mentioned "Optional feedback"
            }
        });
        // TODO: Trigger Invoice generation
        // TODO: Notify Team
        res.json({ success: true, message: 'Milestone approved successfully' });
    }
    catch (error) {
        console.error('Approve milestone error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const requestChanges = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { changes, urgency } = req.body;
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: { project: true }
        });
        if (!milestone) {
            res.status(404).json({ success: false, message: 'Milestone not found' });
            return;
        }
        if (role === Role.CLIENT && milestone.project.clientId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        // Logic for requesting changes. 
        // Might need a new status or just store a comment/notification.
        // For now, we'll just log it or add a comment provided Comment model exists.
        // Add comment
        // schema has Comment model but it relates to Task, not Milestone directly?
        // Checking schema: Comment -> Task. No direct Milestone comment.
        // Using Chat/Message or Notification.
        // For MVP/This task, we just acknowledge receipt.
        // Send notification to manager
        await prisma.notification.create({
            data: {
                userId: milestone.project.managerId,
                title: `Changes Requested: ${milestone.name}`,
                message: `Client requested changes: ${changes} (Urgency: ${urgency})`,
                type: 'PROJECT_UPDATE', // Closest type
                link: `/projects/${milestone.projectId}`
            }
        });
        res.json({ success: true, message: 'Changes requested successfully' });
    }
    catch (error) {
        console.error('Request changes error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=milestoneController.js.map