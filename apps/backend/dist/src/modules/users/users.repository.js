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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const user_schema_1 = require("../../db/schema/user.schema");
const role_schema_1 = require("../../db/schema/role.schema");
let UsersRepository = class UsersRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByEmail(email) {
        const result = await this.db
            .select()
            .from(user_schema_1.users)
            .where((0, drizzle_orm_1.eq)(user_schema_1.users.email, email))
            .limit(1);
        return result[0];
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(user_schema_1.users)
            .where((0, drizzle_orm_1.eq)(user_schema_1.users.id, id))
            .limit(1);
        return result[0];
    }
    async create(data) {
        const result = await this.db.insert(user_schema_1.users).values(data).returning();
        return result[0];
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.db
            .update(user_schema_1.users)
            .set({ refreshToken, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(user_schema_1.users.id, userId));
    }
    async getUserPermissions(userId) {
        const result = await this.db
            .select({
            code: role_schema_1.permissions.code,
        })
            .from(role_schema_1.userRoles)
            .innerJoin(role_schema_1.roles, (0, drizzle_orm_1.eq)(role_schema_1.userRoles.roleId, role_schema_1.roles.id))
            .innerJoin(role_schema_1.rolePermissions, (0, drizzle_orm_1.eq)(role_schema_1.roles.id, role_schema_1.rolePermissions.roleId))
            .innerJoin(role_schema_1.permissions, (0, drizzle_orm_1.eq)(role_schema_1.rolePermissions.permissionId, role_schema_1.permissions.id))
            .where((0, drizzle_orm_1.eq)(role_schema_1.userRoles.userId, userId));
        return result.map((r) => r.code);
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map