"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalLines = exports.journalEntries = exports.accounts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
exports.accounts = (0, pg_core_1.pgTable)('accounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    openingBalance: (0, pg_core_1.integer)('opening_balance').notNull().default(0),
    balance: (0, pg_core_1.integer)('balance').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.journalEntries = (0, pg_core_1.pgTable)('journal_entries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    refType: (0, pg_core_1.varchar)('ref_type', { length: 100 }),
    refId: (0, pg_core_1.uuid)('ref_id'),
    date: (0, pg_core_1.timestamp)('date').notNull().defaultNow(),
    memo: (0, pg_core_1.text)('memo'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.journalLines = (0, pg_core_1.pgTable)('journal_lines', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    journalEntryId: (0, pg_core_1.uuid)('journal_entry_id')
        .notNull()
        .references(() => exports.journalEntries.id, { onDelete: 'cascade' }),
    accountId: (0, pg_core_1.uuid)('account_id')
        .notNull()
        .references(() => exports.accounts.id),
    debit: (0, pg_core_1.integer)('debit').notNull().default(0),
    credit: (0, pg_core_1.integer)('credit').notNull().default(0),
});
//# sourceMappingURL=accounting.schema.js.map