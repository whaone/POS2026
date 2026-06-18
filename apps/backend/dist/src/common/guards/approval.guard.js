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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const requires_approval_decorator_1 = require("../decorators/requires-approval.decorator");
let ApprovalGuard = class ApprovalGuard {
    reflector;
    jwtService;
    constructor(reflector, jwtService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const requiredPermission = this.reflector.getAllAndOverride(requires_approval_decorator_1.APPROVAL_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermission) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = request.headers['x-approval-token'];
        if (!token || typeof token !== 'string') {
            throw new common_1.UnauthorizedException('Approval token missing');
        }
        try {
            const payload = this.jwtService.verify(token, {
                ignoreExpiration: false,
            });
            if (payload.permission !== requiredPermission) {
                throw new common_1.ForbiddenException('Approval token lacks required permission');
            }
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired approval token');
        }
    }
};
exports.ApprovalGuard = ApprovalGuard;
exports.ApprovalGuard = ApprovalGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService])
], ApprovalGuard);
//# sourceMappingURL=approval.guard.js.map