export interface TenantContext {
    companyId: string;
    userId: string;
}

import { AsyncLocalStorage } from 'async_hooks';

export const tenantContext = new AsyncLocalStorage<TenantContext>();
