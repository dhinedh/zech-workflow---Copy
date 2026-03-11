import type { Request, Response, NextFunction } from 'express';
import { tenantContext } from '../lib/context.js';
import { Role } from '@prisma/client';

export interface UserPayload {
    userId: string;
    companyId?: string;
    role: Role;
}


export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Standard auth middleware should have run BEFORE this to decode JWT
    const user = req.user;

    if (!user || !user.companyId || !user.userId) {
        // If public route, just continue without context
        // Or if unauthenticated, Auth middleware should have blocked it
        return next();
    }

    // Run downstream handlers within the context
    tenantContext.run({ companyId: user.companyId, userId: user.userId }, () => {
        next();
    });
};
