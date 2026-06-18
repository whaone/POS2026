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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const role_schema_1 = require("../../db/schema/role.schema");
const permissions_seed_1 = require("../../db/seeds/permissions.seed");
let RolesService = class RolesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async seedPredefinedRolesForBusiness(businessId) {
        await this.db.transaction(async (tx) => {
            const allPerms = await tx.select().from(role_schema_1.permissions);
            const permMap = new Map(allPerms.map((p) => [p.code, p.id]));
            for (const roleKey of Object.keys(permissions_seed_1.PREDEFINED_ROLES)) {
                const roleData = permissions_seed_1.PREDEFINED_ROLES[roleKey];
                const existingRole = await tx
                    .select()
                    .from(role_schema_1.roles)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(role_schema_1.roles.businessId, businessId), (0, drizzle_orm_1.eq)(role_schema_1.roles.name, roleData.name)))
                    .limit(1);
                let roleId;
                if (existingRole.length === 0) {
                    const newRole = await tx
                        .insert(role_schema_1.roles)
                        .values({
                        businessId,
                        name: roleData.name,
                        isPredefined: true,
                    })
                        .returning();
                    roleId = newRole[0].id;
                }
                else {
                    roleId = existingRole[0].id;
                    await tx
                        .delete(role_schema_1.rolePermissions)
                        .where((0, drizzle_orm_1.eq)(role_schema_1.rolePermissions.roleId, roleId));
                }
                const permIds = roleData.permissions
                    .map((code) => permMap.get(code))
                    .filter((id) => id !== undefined);
                if (permIds.length > 0) {
                    const rolePermInserts = permIds.map((pid) => ({
                        roleId,
                        permissionId: pid,
                    }));
                    await tx.insert(role_schema_1.rolePermissions).values(rolePermInserts);
                }
            }
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], RolesService);
//# sourceMappingURL=roles.service.js.map