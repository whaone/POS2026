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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const location_schema_1 = require("../../db/schema/location.schema");
let LocationService = class LocationService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(businessId, createLocationDto) {
        const data = {
            businessId,
            name: createLocationDto.name,
            type: createLocationDto.type,
            address: createLocationDto.address,
        };
        const result = await this.db.insert(location_schema_1.locations).values(data).returning();
        return result[0];
    }
    async findAllByBusiness(businessId) {
        return this.db
            .select()
            .from(location_schema_1.locations)
            .where((0, drizzle_orm_1.eq)(location_schema_1.locations.businessId, businessId));
    }
    async findOne(businessId, id) {
        const result = await this.db
            .select()
            .from(location_schema_1.locations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(location_schema_1.locations.id, id), (0, drizzle_orm_1.eq)(location_schema_1.locations.businessId, businessId)))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.NotFoundException(`Location with ID ${id} not found`);
        }
        return result[0];
    }
    async update(businessId, id, updateLocationDto) {
        await this.findOne(businessId, id);
        const updateData = {
            ...updateLocationDto,
            updatedAt: new Date(),
        };
        const result = await this.db
            .update(location_schema_1.locations)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(location_schema_1.locations.id, id), (0, drizzle_orm_1.eq)(location_schema_1.locations.businessId, businessId)))
            .returning();
        return result[0];
    }
    async remove(businessId, id) {
        await this.findOne(businessId, id);
        await this.db
            .delete(location_schema_1.locations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(location_schema_1.locations.id, id), (0, drizzle_orm_1.eq)(location_schema_1.locations.businessId, businessId)));
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], LocationService);
//# sourceMappingURL=location.service.js.map