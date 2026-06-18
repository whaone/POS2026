"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businesses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.businesses = (0, pg_core_1.pgTable)('businesses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).notNull().default('IDR'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 100 })
        .notNull()
        .default('Asia/Jakarta'),
    financialYearStartMonth: (0, pg_core_1.integer)('financial_year_start_month')
        .notNull()
        .default(1),
    profitMargin: (0, pg_core_1.integer)('profit_margin').notNull().default(0),
    taxNumber: (0, pg_core_1.varchar)('tax_number', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
//# sourceMappingURL=business.schema.js.map