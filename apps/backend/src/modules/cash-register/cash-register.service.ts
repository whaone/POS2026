import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { shifts, cashMovements } from '../../db/schema/cash-register.schema';
import { OpenRegisterDto } from './dto/open-register.dto';
import { CashMovementDto } from './dto/cash-movement.dto';
import { CloseRegisterDto } from './dto/close-register.dto';

@Injectable()
export class CashRegisterService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async openRegister(
    businessId: string,
    cashierId: string,
    dto: OpenRegisterDto,
  ) {
    const [existing] = await this.db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.businessId, businessId),
          eq(shifts.cashierId, cashierId),
          eq(shifts.locationId, dto.locationId),
          eq(shifts.status, 'open'),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException('Cash register shift already open');
    }

    const [shift] = await this.db
      .insert(shifts)
      .values({
        businessId,
        locationId: dto.locationId,
        cashierId,
        openingBalance: dto.openingBalance,
        systemCash: dto.openingBalance,
        status: 'open',
      })
      .returning();

    return shift;
  }

  async getCurrent(businessId: string, cashierId: string) {
    const [shift] = await this.db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.businessId, businessId),
          eq(shifts.cashierId, cashierId),
          eq(shifts.status, 'open'),
        ),
      )
      .limit(1);

    return shift || null;
  }

  async cashIn(businessId: string, cashierId: string, dto: CashMovementDto) {
    const shift = await this.getCurrent(businessId, cashierId);
    if (!shift) throw new NotFoundException('No open shift');

    const [movement] = await this.db
      .insert(cashMovements)
      .values({
        shiftId: shift.id,
        type: 'in',
        amount: dto.amount,
        ref: dto.ref,
      })
      .returning();

    await this.db
      .update(shifts)
      .set({ systemCash: shift.systemCash + dto.amount })
      .where(eq(shifts.id, shift.id));

    return movement;
  }

  async cashOut(businessId: string, cashierId: string, dto: CashMovementDto) {
    const shift = await this.getCurrent(businessId, cashierId);
    if (!shift) throw new NotFoundException('No open shift');

    const [movement] = await this.db
      .insert(cashMovements)
      .values({
        shiftId: shift.id,
        type: 'out',
        amount: dto.amount,
        ref: dto.ref,
      })
      .returning();

    await this.db
      .update(shifts)
      .set({ systemCash: shift.systemCash - dto.amount })
      .where(eq(shifts.id, shift.id));

    return movement;
  }

  async closeRegister(
    businessId: string,
    cashierId: string,
    dto: CloseRegisterDto,
  ) {
    const shift = await this.getCurrent(businessId, cashierId);
    if (!shift) throw new NotFoundException('No open shift');

    const difference = dto.closingCounted - shift.systemCash;

    const [closed] = await this.db
      .update(shifts)
      .set({
        closingCounted: dto.closingCounted,
        difference,
        status: 'closed',
        closedAt: new Date(),
      })
      .where(eq(shifts.id, shift.id))
      .returning();

    return closed;
  }
}
