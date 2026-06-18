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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const customer_schema_1 = require("../../../db/schema/customer.schema");
let CustomersService = class CustomersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(businessId, createCustomerDto) {
        const [customer] = await this.db
            .insert(customer_schema_1.customers)
            .values({
            businessId,
            name: createCustomerDto.name,
            phone: createCustomerDto.phone,
            email: createCustomerDto.email,
            category: createCustomerDto.category || 'retail',
            priceGroupId: createCustomerDto.priceGroupId,
        })
            .returning();
        return customer;
    }
    async findAll(businessId) {
        return this.db
            .select()
            .from(customer_schema_1.customers)
            .where((0, drizzle_orm_1.eq)(customer_schema_1.customers.businessId, businessId));
    }
    async findOne(businessId, id) {
        const [customer] = await this.db
            .select()
            .from(customer_schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(customer_schema_1.customers.id, id), (0, drizzle_orm_1.eq)(customer_schema_1.customers.businessId, businessId)));
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(businessId, id, updateCustomerDto) {
        const [updated] = await this.db
            .update(customer_schema_1.customers)
            .set({
            ...updateCustomerDto,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(customer_schema_1.customers.id, id), (0, drizzle_orm_1.eq)(customer_schema_1.customers.businessId, businessId)))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return updated;
    }
    async remove(businessId, id) {
        const [deleted] = await this.db
            .delete(customer_schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(customer_schema_1.customers.id, id), (0, drizzle_orm_1.eq)(customer_schema_1.customers.businessId, businessId)))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return deleted;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB_CLIENT')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], CustomersService);
//# sourceMappingURL=customers.service.js.map