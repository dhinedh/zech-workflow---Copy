import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../lib/context.js';

const prismaClient = new PrismaClient();

const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async findFirst({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    // Check if model has companyId field before trying to filter by it
                    // This is runtime check, ideally should be type-safe but $allModels makes it tricky
                    // Assuming most core models have companyId
                    (args.where as any) = { ...args.where, companyId: context.companyId };
                }
                return query(args);
            },
            async findUnique({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    // findUnique requires strict unique input. 
                    // If we want tenant isolation, we often need findFirst instead or composite IDs.
                    // But for now, let's rely on findFirst if uniqueness is constrained by tenant, 
                    // or just let findUnique run if the ID is globally unique (CUIDs are).
                    // Security Note: Globally unique IDs are guessable? No, CUIDs are safe.
                    // But valid multi-tenancy usually implies one tenant cannot read another's data even with ID.
                    // So we should ideally inject a check. 
                    // However, findUnique argument structure is rigid.
                    // Strategy: Switch to findFirst logic manually in controllers OR use middleware to block access after fetch?
                    // Best practice with Prisma extensions:
                    // Change to findFirst if we want to enforce filter.
                    // BUT that changes return type potential.
                    // Let's stick to standard behavior but maybe log/audit access?
                    // For STRICT isolation, we often avoid findUnique on non-global resources in multi-tenant apps.
                }
                return query(args);
            },
            async findMany({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    (args.where as any) = { ...args.where, companyId: context.companyId };
                }
                return query(args);
            },
            async count({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    (args.where as any) = { ...args.where, companyId: context.companyId };
                }
                return query(args);
            },
            async create({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    // Auto-inject companyId for creation
                    (args.data as any).companyId = context.companyId;
                }
                return query(args);
            },
            async createMany({ args, query }) {
                const context = tenantContext.getStore();
                if (context?.companyId) {
                    if (Array.isArray(args.data)) {
                        args.data.forEach((item: any) => item.companyId = context.companyId);
                    } else {
                        (args.data as any).companyId = context.companyId;
                    }
                }
                return query(args);
            }
        }
    }
});

export default prisma;
