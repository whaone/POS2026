/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { DATABASE_TOKEN } from '../../core/database/database.module';

/**
 * REQ-driven tests for shift cash reconciliation.
 * Locks: FR-CSH-03 close shift, BR-07 fraud detection via system-vs-counted
 * difference, UC-03.
 */
describe('CashRegisterService — reconciliation (FR-CSH-03 / BR-07)', () => {
  let service: CashRegisterService;
  let mockDb: any;

  const OPEN_SHIFT = {
    id: 'shift-1',
    businessId: 'business-1',
    locationId: 'loc-1',
    cashierId: 'cashier-1',
    systemCash: 100000,
    status: 'open',
  };

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([OPEN_SHIFT]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'shift-1' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashRegisterService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<CashRegisterService>(CashRegisterService);
  });

  it('detects a cash shortage (counted < system) as a negative difference', async () => {
    await service.closeRegister('business-1', 'cashier-1', {
      closingCounted: 90000,
    });

    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ difference: -10000, status: 'closed' }),
    );
  });

  it('detects a cash surplus (counted > system) as a positive difference', async () => {
    await service.closeRegister('business-1', 'cashier-1', {
      closingCounted: 110000,
    });

    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ difference: 10000 }),
    );
  });

  it('reconciles exactly (counted === system) as zero difference', async () => {
    await service.closeRegister('business-1', 'cashier-1', {
      closingCounted: 100000,
    });

    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ difference: 0 }),
    );
  });

  it('throws NotFound when closing with no open shift', async () => {
    mockDb.limit.mockResolvedValue([]); // getCurrent finds nothing

    await expect(
      service.closeRegister('business-1', 'cashier-1', {
        closingCounted: 100000,
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to open a second shift while one is already open', async () => {
    mockDb.limit.mockResolvedValue([OPEN_SHIFT]); // existing open shift

    await expect(
      service.openRegister('business-1', 'cashier-1', {
        locationId: 'loc-1',
        openingBalance: 50000,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
