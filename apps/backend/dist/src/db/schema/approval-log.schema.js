"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
exports.approvalLogs = (0, pg_core_1.pgTable)('approval_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    approvedBy: (0, pg_core_1.uuid)('approved_by').notNull(),
    requiredPermission: (0, pg_core_1.varchar)('required_permission', { length: 100 }).notNull(),
    resourceType: (0, pg_core_1.varchar)('resource_type', { length: 100 }),
    resourceId: (0, pg_core_1.uuid)('resource_id'),
    reason: (0, pg_core_1.varchar)('reason', { length: 255 }),
    contextJson: (0, pg_core_1.jsonb)('context_json'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=approval-log.schema.js.map