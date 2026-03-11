export interface TenantContext {
    companyId: string;
    userId: string;
}
import { AsyncLocalStorage } from 'async_hooks';
export declare const tenantContext: AsyncLocalStorage<TenantContext>;
//# sourceMappingURL=context.d.ts.map