import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ApproveDto } from './dto/approve.dto';
import { AuthTokens, AuthUser } from './auth.types';
export declare class AuthService {
    private readonly usersService;
    private readonly usersRepository;
    private readonly jwtService;
    private readonly config;
    private readonly db;
    constructor(usersService: UsersService, usersRepository: UsersRepository, jwtService: JwtService, config: ConfigService, db: NodePgDatabase);
    login(loginDto: LoginDto): Promise<{
        user: AuthUser;
        tokens: AuthTokens;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(refreshDto: RefreshDto): Promise<AuthTokens>;
    getMe(userId: string): Promise<AuthUser>;
    approve(approveDto: ApproveDto, businessId: string): Promise<{
        approvalToken: string;
        expiresIn: number;
        approvedBy: string;
        permission: string;
    }>;
    private generateTokens;
}
