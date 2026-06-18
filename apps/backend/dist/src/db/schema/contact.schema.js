"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactLedgers = exports.contacts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
exports.contacts = (0, pg_core_1.pgTable)('contacts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    payTermDays: (0, pg_core_1.integer)('pay_term_days'),
    creditLimit: (0, pg_core_1.integer)('credit_limit').notNull().default(0),
    openingBalance: (0, pg_core_1.integer)('opening_balance').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.contactLedgers = (0, pg_core_1.pgTable)('contact_ledgers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    contactId: (0, pg_core_1.uuid)('contact_id')
        .notNull()
        .references(() => exports.contacts.id, { onDelete: 'cascade' }),
    refType: (0, pg_core_1.varchar)('ref_type', { length: 50 }).notNull(),
    refId: (0, pg_core_1.uuid)('ref_id'),
    debit: (0, pg_core_1.integer)('debit').notNull().default(0),
    credit: (0, pg_core_1.integer)('credit').notNull().default(0),
    balance: (0, pg_core_1.integer)('balance').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=contact.schema.js.map