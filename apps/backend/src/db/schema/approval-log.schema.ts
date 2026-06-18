import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';

export const approvalLogs = pgTable('approval_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  approvedBy: uuid('approved_by').notNull(),
  requiredPermission: varchar('required_permission', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }),
  resourceId: uuid('resource_id'),
  reason: varchar('reason', { length: 255 }),
  contextJson: jsonb('context_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ApprovalLog = typeof approvalLogs.$inferSelect;
