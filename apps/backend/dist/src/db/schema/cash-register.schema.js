"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashMovements = exports.shifts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
exports.shifts = (0, pg_core_1.pgTable)('shifts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    cashierId: (0, pg_core_1.uuid)('cashier_id').notNull(),
    openingBalance: (0, pg_core_1.integer)('opening_balance').notNull().default(0),
    closingCounted: (0, pg_core_1.integer)('closing_counted'),
    systemCash: (0, pg_core_1.integer)('system_cash').notNull().default(0),
    difference: (0, pg_core_1.integer)('difference'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('open'),
    openedAt: (0, pg_core_1.timestamp)('opened_at').defaultNow().notNull(),
    closedAt: (0, pg_core_1.timestamp)('closed_at'),
});
exports.cashMovements = (0, pg_core_1.pgTable)('cash_movements', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    shiftId: (0, pg_core_1.uuid)('shift_id')
        .notNull()
        .references(() => exports.shifts.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    ref: (0, pg_core_1.varchar)('ref', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=cash-register.schema.js.map