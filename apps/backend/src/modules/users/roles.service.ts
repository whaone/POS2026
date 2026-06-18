import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  roles,
  permissions,
  rolePermissions,
} from '../../db/schema/role.schema';
import { PREDEFINED_ROLES } from '../../db/seeds/permissions.seed';

@Injectable()
export class RolesService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async seedPredefinedRolesForBusiness(businessId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // 1. Get all available permissions
      const allPerms = await tx.select().from(permissions);
      const permMap = new Map(allPerms.map((p) => [p.code, p.id]));

      for (const roleKey of Object.keys(PREDEFINED_ROLES)) {
        const roleData =
          PREDEFINED_ROLES[roleKey as keyof typeof PREDEFINED_ROLES];

        // 2. Check if role exists for this business
        const existingRole = await tx
          .select()
          .from(roles)
          .where(
            and(
              eq(roles.businessId, businessId),
              eq(roles.name, roleData.name),
            ),
          )
          .limit(1);

        let roleId: string;

        if (existingRole.length === 0) {
          // 3. Create role
          const newRole = await tx
            .insert(roles)
            .values({
              businessId,
              name: roleData.name,
              isPredefined: true,
            })
            .returning();
          roleId = newRole[0].id;
        } else {
          roleId = existingRole[0].id;
          // Clear old permissions to reset
          await tx
            .delete(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId));
        }

        // 4. Attach permissions
        const permIds = (roleData.permissions as readonly string[])
          .map((code) => permMap.get(code))
          .filter((id): id is string => id !== undefined);

        if (permIds.length > 0) {
          const rolePermInserts = permIds.map((pid) => ({
            roleId,
            permissionId: pid,
          }));
          await tx.insert(rolePermissions).values(rolePermInserts);
        }
      }
    });
  }
}
