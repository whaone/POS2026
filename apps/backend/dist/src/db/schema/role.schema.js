"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoles = exports.rolePermissions = exports.permissions = exports.roles = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
exports.roles = (0, pg_core_1.pgTable)('roles', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    isPredefined: (0, pg_core_1.boolean)('is_predefined').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueBusinessRole: (0, pg_core_1.unique)().on(table.businessId, table.name),
}));
exports.permissions = (0, pg_core_1.pgTable)('permissions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    code: (0, pg_core_1.varchar)('code', { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.varchar)('description', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.rolePermissions = (0, pg_core_1.pgTable)('role_permissions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    roleId: (0, pg_core_1.uuid)('role_id')
        .notNull()
        .references(() => exports.roles.id, { onDelete: 'cascade' }),
    permissionId: (0, pg_core_1.uuid)('permission_id')
        .notNull()
        .references(() => exports.permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
    uniqueRolePermission: (0, pg_core_1.unique)().on(table.roleId, table.permissionId),
}));
exports.userRoles = (0, pg_core_1.pgTable)('user_roles', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => user_schema_1.users.id, { onDelete: 'cascade' }),
    roleId: (0, pg_core_1.uuid)('role_id')
        .notNull()
        .references(() => exports.roles.id, { onDelete: 'cascade' }),
}, (table) => ({
    uniqueUserRole: (0, pg_core_1.unique)().on(table.userId, table.roleId),
}));
//# sourceMappingURL=role.schema.js.map