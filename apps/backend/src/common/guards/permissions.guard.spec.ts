import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { UsersService } from '../../modules/users/users.service';

/**
 * REQ-driven tests for RBAC enforcement.
 * Locks: FR-AUT-02 granular permissions, NFR-SEC-04, E-PERM-403, AC-11.
 */
describe('PermissionsGuard — RBAC enforcement (FR-AUT-02 / E-PERM-403)', () => {
  let guard: PermissionsGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let usersService: { getUserPermissions: jest.Mock };

  function contextWithUser(user: unknown): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    usersService = { getUserPermissions: jest.fn() };
    guard = new PermissionsGuard(
      reflector as unknown as Reflector,
      usersService as unknown as UsersService,
    );
  });

  it('allows the request when no permissions are required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(contextWithUser({ sub: 'u1' })),
    ).resolves.toBe(true);
    expect(usersService.getUserPermissions).not.toHaveBeenCalled();
  });

  it('allows the request when the user holds every required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['sales:create']);
    usersService.getUserPermissions.mockResolvedValue([
      'sales:create',
      'stock:read',
    ]);

    await expect(
      guard.canActivate(contextWithUser({ sub: 'u1' })),
    ).resolves.toBe(true);
  });

  it('throws Forbidden (E-PERM-403) when a required permission is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(['sales:void']);
    usersService.getUserPermissions.mockResolvedValue(['sales:create']);

    await expect(
      guard.canActivate(contextWithUser({ sub: 'u1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies when the request carries no authenticated user', async () => {
    reflector.getAllAndOverride.mockReturnValue(['sales:create']);

    await expect(guard.canActivate(contextWithUser(undefined))).resolves.toBe(
      false,
    );
    expect(usersService.getUserPermissions).not.toHaveBeenCalled();
  });
});
