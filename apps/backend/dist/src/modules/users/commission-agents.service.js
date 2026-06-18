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
exports.CommissionAgentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const user_schema_1 = require("../../db/schema/user.schema");
let CommissionAgentsService = class CommissionAgentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(businessId, dto) {
        const [agent] = await this.db
            .insert(user_schema_1.commissionAgents)
            .values({
            businessId,
            ...dto,
        })
            .returning();
        return agent;
    }
    async findAll(businessId) {
        return this.db
            .select()
            .from(user_schema_1.commissionAgents)
            .where((0, drizzle_orm_1.eq)(user_schema_1.commissionAgents.businessId, businessId));
    }
    async findOne(businessId, id) {
        const [agent] = await this.db
            .select()
            .from(user_schema_1.commissionAgents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_schema_1.commissionAgents.id, id), (0, drizzle_orm_1.eq)(user_schema_1.commissionAgents.businessId, businessId)));
        if (!agent) {
            throw new common_1.NotFoundException('Commission Agent not found');
        }
        return agent;
    }
    async update(businessId, id, dto) {
        await this.findOne(businessId, id);
        const [updated] = await this.db
            .update(user_schema_1.commissionAgents)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(user_schema_1.commissionAgents.id, id))
            .returning();
        return updated;
    }
    async remove(businessId, id) {
        await this.findOne(businessId, id);
        await this.db.delete(user_schema_1.commissionAgents).where((0, drizzle_orm_1.eq)(user_schema_1.commissionAgents.id, id));
        return { success: true };
    }
};
exports.CommissionAgentsService = CommissionAgentsService;
exports.CommissionAgentsService = CommissionAgentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], CommissionAgentsService);
//# sourceMappingURL=commission-agents.service.js.map