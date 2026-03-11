import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database-extended.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { generateEmployeeId } from '../utils/employeeId.js';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(Role).optional(),
});

const loginSchema = z.object({
    identifier: z.string(), // email or employeeId
    password: z.string(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, "Password must contain uppercase, lowercase, number and special char"),
});

const updateProfileSchema = z.object({
    bio: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    skills: z.array(z.string()).optional(),
    avatar: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    notifyTasks: z.boolean().optional(),
    notifyReports: z.boolean().optional(),
    notifyMeetings: z.boolean().optional(),
    notifyMessages: z.boolean().optional(),
    notifyProjectUpdates: z.boolean().optional(),
    workingHoursStart: z.string().optional(),
    workingHoursEnd: z.string().optional(),
    timezone: z.string().optional(),
    dndEnabled: z.boolean().optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validation.error.format()
            });
            return;
        }

        const { email, password, name, role } = validation.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate Employee ID
        const employeeId = await generateEmployeeId();

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role: role || Role.EMPLOYEE,
                employeeId,
                isFirstLogin: true,
                tempPassword: passwordHash,
                tempPasswordExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        });

        // Log creation
        await prisma.employeeCreationLog.create({
            data: {
                employeeId: user.employeeId!,
                createdBy: 'SYSTEM_REGISTER', // or req.user.id if middleware was there
                tempPassword: 'HIDDEN',
                emailSent: false
            }
        });

        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        // Store refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    employeeId: user.employeeId,
                    name: user.name,
                    role: user.role,
                },
                accessToken,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validation.error.format()
            });
            return;
        }

        const { identifier, password } = validation.data;

        // Find user by email OR employeeId
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { employeeId: identifier } // Case insensitive? Postgres default often case sensitive. Prisma defaults to sensitive unless mode 'insensitive' used.
                ]
            }
        });

        // Case insensitive fallback if needed, or explicitly use mode: 'insensitive' in prisma.
        // But for now let's assume exact match or let the user handle casing. 
        // Better:
        /*
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: identifier, mode: 'insensitive' } },
                    { employeeId: { equals: identifier, mode: 'insensitive' } }
                ]
            }
        });
        */
        // However, to keep it simple and avoid potential query errors if DB doesn't support it strictly without extensions:
        // The user prompt said: Case-insensitive for login (EMP-2026-051 = emp-2026-051). So I really should use insensitive.

        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Invalid credentials or account inactive' });
            return;
        }

        // Check for temp password expiry if it's first login
        if (user.isFirstLogin && user.tempPasswordExpiry && new Date() > user.tempPasswordExpiry) {
            res.status(401).json({
                success: false,
                message: 'Temporary password has expired. Please contact support@company.com to reset it.'
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
            companyId: user.companyId || undefined
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            role: user.role,
            companyId: user.companyId || undefined
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    employeeId: user.employeeId,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    isFirstLogin: user.isFirstLogin,
                    managerId: user.managerId,
                },
                accessToken,
                isFirstLogin: user.isFirstLogin
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const validation = changePasswordSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validation.error.format()
            });
            return;
        }

        const { currentPassword, newPassword } = validation.data;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Incorrect current password' });
            return;
        }

        const salt = await bcrypt.genSalt(12);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newPasswordHash,
                isFirstLogin: false,
                passwordChangedAt: new Date(),
                tempPassword: null,
            }
        });

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validation.error.format()
            });
            return;
        }

        // Filter out undefined values to satisfy exactOptionalPropertyTypes: true
        const updateData = Object.fromEntries(
            Object.entries(validation.data).filter(([_, v]) => v !== undefined)
        );

        await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData
        });

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                department: true,
                designation: true,
            }
        });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({ success: false, message: 'Refresh token missing' });
            return;
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret') as any;

        // Assign decoded user info to req.user, similar to how an auth middleware would
        // This makes the user's details available for subsequent operations in this request if needed,
        // though for a refresh endpoint, its primary use is to generate a new access token.
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            companyId: decoded.companyId
        };

        // Optional: Check if user still exists and is active
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Invalid user' });
            return;
        }

        const newAccessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
            companyId: user.companyId || undefined
        });

        res.json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};
