import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ApproveDto } from './dto/approve.dto';
import type { JwtPayload } from './auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        user: import("./auth.types").AuthUser;
        tokens: import("./auth.types").AuthTokens;
    }>;
    refresh(refreshDto: RefreshDto): Promise<import("./auth.types").AuthTokens>;
    logout(user: JwtPayload): Promise<{
        success: boolean;
    }>;
    getMe(user: JwtPayload): Promise<import("./auth.types").AuthUser>;
    approve(user: JwtPayload, dto: ApproveDto): Promise<{
        approvalToken: string;
        expiresIn: number;
        approvedBy: string;
        permission: string;
    }>;
}
