"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const contact_schema_1 = require("../../../db/schema/contact.schema");
let ContactsService = class ContactsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(businessId, createContactDto) {
        const [contact] = await this.db
            .insert(contact_schema_1.contacts)
            .values({
            businessId,
            type: createContactDto.type,
            name: createContactDto.name,
            phone: createContactDto.phone,
            email: createContactDto.email,
            payTermDays: createContactDto.payTermDays,
            creditLimit: createContactDto.creditLimit || 0,
            openingBalance: createContactDto.openingBalance || 0,
        })
            .returning();
        if (contact.openingBalance > 0) {
            const isSupplier = ['supplier', 'both'].includes(contact.type);
            await this.db.insert(contact_schema_1.contactLedgers).values({
                contactId: contact.id,
                refType: 'opening_balance',
                debit: !isSupplier ? contact.openingBalance : 0,
                credit: isSupplier ? contact.openingBalance : 0,
                balance: contact.openingBalance,
            });
        }
        return contact;
    }
    async findAll(businessId) {
        return this.db
            .select()
            .from(contact_schema_1.contacts)
            .where((0, drizzle_orm_1.eq)(contact_schema_1.contacts.businessId, businessId));
    }
    async findOne(businessId, id) {
        const [contact] = await this.db
            .select()
            .from(contact_schema_1.contacts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(contact_schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(contact_schema_1.contacts.businessId, businessId)));
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }
    async update(businessId, id, updateContactDto) {
        const [updated] = await this.db
            .update(contact_schema_1.contacts)
            .set({
            ...updateContactDto,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(contact_schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(contact_schema_1.contacts.businessId, businessId)))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
        }
        return updated;
    }
    async remove(businessId, id) {
        const [deleted] = await this.db
            .delete(contact_schema_1.contacts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(contact_schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(contact_schema_1.contacts.businessId, businessId)))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
        }
        return deleted;
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB_CLIENT')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map