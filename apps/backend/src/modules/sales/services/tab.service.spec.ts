/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TabService } from './tab.service';
import { DATABASE_TOKEN } from '../../../core/database/database.module';

/**
 * REQ-driven tests for multi-customer transaction tabs.
 * Locks: FR-SAL-18 max-10 tabs per shift (E-TAB-409), BR-15.
 */
describe('TabService — max 10 tabs per shift (FR-SAL-18 / E-TAB-409)', () => {
  let service: TabService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'tab-new', tabIndex: 4 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TabService, { provide: DATABASE_TOKEN, useValue: mockDb }],
    }).compile();

    service = module.get<TabService>(TabService);
  });

  it('rejects opening an 11th tab with E-TAB-409', async () => {
    // openTab: first awaited where() is the count query
    mockDb.where = jest.fn().mockResolvedValueOnce([{ count: 10 }]);

    await expect(
      service.openTab('business-1', 'loc-1', 'cashier-1', 'shift-1'),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'E-TAB-409' }),
    });
  });

  it('opens a tab and assigns the next free index when under the limit', async () => {
    mockDb.where = jest
      .fn()
      // 1st call: count query -> 3 active tabs
      .mockResolvedValueOnce([{ count: 3 }])
      // 2nd call: existing indices -> 1,2,3 used
      .mockResolvedValueOnce([
        { tabIndex: 1 },
        { tabIndex: 2 },
        { tabIndex: 3 },
      ]);

    const tab = await service.openTab(
      'business-1',
      'loc-1',
      'cashier-1',
      'shift-1',
    );

    expect(tab).toEqual({ id: 'tab-new', tabIndex: 4 });
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({ tabIndex: 4, status: 'active' }),
    );
  });

  it('allows opening exactly the 10th tab (boundary)', async () => {
    mockDb.where = jest
      .fn()
      .mockResolvedValueOnce([{ count: 9 }])
      .mockResolvedValueOnce([]);

    await expect(
      service.openTab('business-1', 'loc-1', 'cashier-1', 'shift-1'),
    ).resolves.toBeDefined();
  });

  it('throws NotFound for an unknown tab id', async () => {
    // getTab ends in .where().limit(1)
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.limit = jest.fn().mockResolvedValue([]);

    await expect(
      service.getTab('business-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
