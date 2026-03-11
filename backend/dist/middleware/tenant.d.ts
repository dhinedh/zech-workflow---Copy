import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface UserPayload {
    userId: string;
    companyId?: string;
    role: Role;
}
export declare const tenantMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=tenant.d.ts.map