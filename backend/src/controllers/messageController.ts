import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Schema for creating a channel/DM
const createChannelSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['DIRECT', 'GROUP', 'PROJECT', 'CLIENT']),
    memberIds: z.array(z.string()), // IDs of other users to add
    projectId: z.string().optional().nullable(),
});

// Schema for sending a message
const sendMessageSchema = z.object({
    content: z.string().min(1),
    channelId: z.string().min(1),
});

export const getChannels = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const channels = await prisma.channel.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                isActive: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
};

export const createChannel = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.companyId) {
            res.status(400).json({ error: 'User does not belong to a company' });
            return;
        }

        const { name, type, memberIds, projectId } = createChannelSchema.parse(req.body);

        // Ensure creator is in the member list
        const allMembers = Array.from(new Set([...memberIds, userId]));

        const channelData: any = {
            name,
            type,
            companyId: user.companyId,
            members: {
                create: allMembers.map(mid => ({
                    userId: mid
                }))
            }
        };

        if (projectId) {
            channelData.projectId = projectId;
        }

        const channel = await prisma.channel.create({
            data: channelData,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json(channel);
    } catch (error: any) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error creating channel:', error);
            res.status(500).json({ error: 'Failed to create channel' });
        }
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { channelId } = req.params;

        if (!channelId || typeof channelId !== 'string') {
            res.status(400).json({ error: 'Invalid channel ID' });
            return;
        }

        // Verify membership
        const membership = await prisma.channelMember.findFirst({
            where: {
                channelId,
                userId
            }
        });

        if (!membership) {
            res.status(403).json({ error: 'Not a member of this channel' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                channelId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                attachments: true
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: 100 // Pagination/Limit could be improved later
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { content, channelId } = sendMessageSchema.parse(req.body);

        // Verify membership
        const membership = await prisma.channelMember.findFirst({
            where: {
                channelId,
                userId
            }
        });

        if (!membership) {
            res.status(403).json({ error: 'Not a member of this channel' });
            return;
        }

        const message = await prisma.message.create({
            data: {
                content,
                channelId,
                senderId: userId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                attachments: true
            }
        });

        // Update channel timestamp
        await prisma.channel.update({
            where: { id: channelId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error: any) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: (error as any).errors });
        } else {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }
}
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { companyId: true }
        });

        if (!currentUser?.companyId) {
            res.status(400).json({ error: 'User does not belong to a company' });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                companyId: currentUser.companyId,
                id: { not: userId }, // Exclude current user
                isActive: true
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true
            }
        });

        res.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}
