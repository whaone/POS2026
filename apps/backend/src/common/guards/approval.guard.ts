import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { APPROVAL_KEY } from '../decorators/requires-approval.decorator';

@Injectable()
export class ApprovalGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      APPROVAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = request.headers['x-approval-token'];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Approval token missing');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, {
        ignoreExpiration: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.permission !== requiredPermission) {
        throw new ForbiddenException(
          'Approval token lacks required permission',
        );
      }
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired approval token');
    }
  }
}
