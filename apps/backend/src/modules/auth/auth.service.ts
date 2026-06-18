import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { approvalLogs } from '../../db/schema/approval-log.schema';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ApproveDto } from './dto/approve.dto';
import { AuthTokens, JwtPayload, AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(DATABASE_TOKEN) private readonly db: NodePgDatabase,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      businessId: user.businessId,
      locationId: undefined, // Will be set by multi-location context later if needed
    };

    const tokens = await this.generateTokens(payload);

    // Hash and store refresh token
    const rtHash = await argon2.hash(tokens.refreshToken);
    await this.usersRepository.updateRefreshToken(user.id, rtHash);

    const authUser: AuthUser = {
      ...payload,
      name: user.name,
    };

    return { user: authUser, tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.updateRefreshToken(userId, null);
  }

  async refreshTokens(refreshDto: RefreshDto): Promise<AuthTokens> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(refreshDto.refreshToken);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Access Denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = decoded.sub;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isRtMatch = await argon2.verify(
      user.refreshToken,
      refreshDto.refreshToken,
    );
    if (!isRtMatch) {
      throw new UnauthorizedException('Access Denied');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      businessId: user.businessId,
    };

    const tokens = await this.generateTokens(payload);
    const rtHash = await argon2.hash(tokens.refreshToken);

    await this.usersRepository.updateRefreshToken(user.id, rtHash);

    return tokens;
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      sub: user.id,
      email: user.email,
      businessId: user.businessId,
      name: user.name,
    };
  }

  async approve(approveDto: ApproveDto, businessId: string) {
    const supervisor = await this.usersService.findByEmail(approveDto.email);

    if (!supervisor || supervisor.status !== 'active') {
      throw new UnauthorizedException('Invalid supervisor credentials');
    }

    if (supervisor.businessId !== businessId) {
      throw new ForbiddenException(
        'Supervisor does not belong to this business',
      );
    }

    const isPasswordValid = await argon2.verify(
      supervisor.passwordHash,
      approveDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid supervisor credentials');
    }

    // Check if supervisor has the required permission
    const permissions = await this.usersService.getUserPermissions(
      supervisor.id,
    );
    if (!permissions.includes(approveDto.requiredPermission)) {
      throw new ForbiddenException('Supervisor lacks required permission');
    }

    // NFR-SEC-03: Audit trail log
    await this.db.insert(approvalLogs).values({
      businessId,
      approvedBy: supervisor.id,
      requiredPermission: approveDto.requiredPermission,
      resourceType: approveDto.context?.resourceType,
      resourceId: approveDto.context?.resourceId,
      reason: approveDto.context?.reason,
      contextJson: approveDto.context,
    });

    // Generate short-lived token
    const token = await this.jwtService.signAsync(
      {
        sub: supervisor.id,
        businessId,
        permission: approveDto.requiredPermission,
      },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '5m', // 5 minutes validity
      },
    );

    return {
      approvalToken: token,
      expiresIn: 300,
      approvedBy: supervisor.id,
      permission: approveDto.requiredPermission,
    };
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: this.config.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
