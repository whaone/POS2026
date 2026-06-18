import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class RolesService {
    private readonly db;
    constructor(db: NodePgDatabase);
    seedPredefinedRolesForBusiness(businessId: string): Promise<void>;
}
