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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const business_schema_1 = require("../../db/schema/business.schema");
const roles_service_1 = require("../users/roles.service");
let BusinessService = class BusinessService {
    db;
    rolesService;
    constructor(db, rolesService) {
        this.db = db;
        this.rolesService = rolesService;
    }
    async create(createBusinessDto) {
        const data = {
            name: createBusinessDto.name,
            currency: createBusinessDto.currency,
            timezone: createBusinessDto.timezone,
            financialYearStartMonth: createBusinessDto.financialYearStartMonth,
            profitMargin: createBusinessDto.profitMargin,
            taxNumber: createBusinessDto.taxNumber,
        };
        const newBusiness = await this.db
            .insert(business_schema_1.businesses)
            .values(data)
            .returning();
        const created = newBusiness[0];
        await this.rolesService.seedPredefinedRolesForBusiness(created.id);
        return created;
    }
    async findAll() {
        return this.db.select().from(business_schema_1.businesses);
    }
    async findOne(id) {
        const result = await this.db
            .select()
            .from(business_schema_1.businesses)
            .where((0, drizzle_orm_1.eq)(business_schema_1.businesses.id, id))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.NotFoundException(`Business with ID ${id} not found`);
        }
        return result[0];
    }
    async update(id, updateBusinessDto) {
        await this.findOne(id);
        const updateData = {
            ...updateBusinessDto,
            updatedAt: new Date(),
        };
        const result = await this.db
            .update(business_schema_1.businesses)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(business_schema_1.businesses.id, id))
            .returning();
        return result[0];
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.delete(business_schema_1.businesses).where((0, drizzle_orm_1.eq)(business_schema_1.businesses.id, id));
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function, roles_service_1.RolesService])
], BusinessService);
//# sourceMappingURL=business.service.js.map