import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}
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
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map