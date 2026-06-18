"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = __importStar(require("argon2"));
const database_module_1 = require("../../core/database/database.module");
const users_service_1 = require("../users/users.service");
const users_repository_1 = require("../users/users.repository");
const approval_log_schema_1 = require("../../db/schema/approval-log.schema");
let AuthService = class AuthService {
    usersService;
    usersRepository;
    jwtService;
    config;
    db;
    constructor(usersService, usersRepository, jwtService, config, db) {
        this.usersService = usersService;
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.config = config;
        this.db = db;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user || user.status !== 'active') {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            businessId: user.businessId,
            locationId: undefined,
        };
        const tokens = await this.generateTokens(payload);
        const rtHash = await argon2.hash(tokens.refreshToken);
        await this.usersRepository.updateRefreshToken(user.id, rtHash);
        const authUser = {
            ...payload,
            name: user.name,
        };
        return { user: authUser, tokens };
    }
    async logout(userId) {
        await this.usersRepository.updateRefreshToken(userId, null);
    }
    async refreshTokens(refreshDto) {
        const decoded = this.jwtService.decode(refreshDto.refreshToken);
        if (!decoded || !decoded.sub) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const userId = decoded.sub;
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const isRtMatch = await argon2.verify(user.refreshToken, refreshDto.refreshToken);
        if (!isRtMatch) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            businessId: user.businessId,
        };
        const tokens = await this.generateTokens(payload);
        const rtHash = await argon2.hash(tokens.refreshToken);
        await this.usersRepository.updateRefreshToken(user.id, rtHash);
        return tokens;
    }
    async getMe(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            sub: user.id,
            email: user.email,
            businessId: user.businessId,
            name: user.name,
        };
    }
    async approve(approveDto, businessId) {
        const supervisor = await this.usersService.findByEmail(approveDto.email);
        if (!supervisor || supervisor.status !== 'active') {
            throw new common_1.UnauthorizedException('Invalid supervisor credentials');
        }
        if (supervisor.businessId !== businessId) {
            throw new common_1.ForbiddenException('Supervisor does not belong to this business');
        }
        const isPasswordValid = await argon2.verify(supervisor.passwordHash, approveDto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid supervisor credentials');
        }
        const permissions = await this.usersService.getUserPermissions(supervisor.id);
        if (!permissions.includes(approveDto.requiredPermission)) {
            throw new common_1.ForbiddenException('Supervisor lacks required permission');
        }
        await this.db.insert(approval_log_schema_1.approvalLogs).values({
            businessId,
            approvedBy: supervisor.id,
            requiredPermission: approveDto.requiredPermission,
            resourceType: approveDto.context?.resourceType,
            resourceId: approveDto.context?.resourceId,
            reason: approveDto.context?.reason,
            contextJson: approveDto.context,
        });
        const token = await this.jwtService.signAsync({
            sub: supervisor.id,
            businessId,
            permission: approveDto.requiredPermission,
        }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '5m',
        });
        return {
            approvalToken: token,
            expiresIn: 300,
            approvedBy: supervisor.id,
            permission: approveDto.requiredPermission,
        };
    }
    async generateTokens(payload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        users_repository_1.UsersRepository,
        jwt_1.JwtService,
        config_1.ConfigService, Function])
], AuthService);
//# sourceMappingURL=auth.service.js.map