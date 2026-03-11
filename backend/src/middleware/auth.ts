
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client'; // Role is enum from Prisma

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
                companyId?: string | undefined;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            return;
        }
        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            companyId: decoded.companyId
        };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        return;
    }
};

export const requireRole = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to access this resource'
            });
            return;
        }

        next();
    };
};
