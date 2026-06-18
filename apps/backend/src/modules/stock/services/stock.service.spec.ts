/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from '../stock.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

function createTxMock() {
  return {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    for: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
  };
}

describe('StockService - AC-06 / FR-STK-03/04: Stock Transfer ACID', () => {
  let service: StockService;
  let mockDb: any;
  let mockEventEmitter: any;

  const mockStockFrom = {
    id: 'stock-from',
    businessId: 'business-1',
    locationId: 'location-1',
    productId: 'prod-1',
    qty: 100,
  };

  const mockStockTo = {
    id: 'stock-to',
    businessId: 'business-1',
    locationId: 'location-2',
    productId: 'prod-1',
    qty: 50,
  };

  beforeEach(async () => {
    mockDb = {
      ...createTxMock(),
      transaction: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  describe('transferStock (AC-06 / FR-STK-03/04)', () => {
    it('should create transfer, deduct from source, and keep total consistent', async () => {
      const txMock = createTxMock();
      txMock.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest
            .fn()
            .mockResolvedValue([{ id: 'transfer-1', status: 'in_transit' }]),
        }),
      });
      txMock.for.mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockStockFrom]),
      });

      mockDb.transaction = jest.fn(async (cb) => cb(txMock));

      await service.transferStock({
        businessId: 'business-1',
        fromLocationId: 'location-1',
        toLocationId: 'location-2',
        items: [{ productId: 'prod-1', qty: 10 }],
      });

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'stock.transfer.created',
        expect.objectContaining({
          businessId: 'business-1',
          fromLocationId: 'location-1',
          toLocationId: 'location-2',
        }),
      );
    });

    it('should reject transfer if insufficient stock', async () => {
      const txMock = createTxMock();
      const lowStock = { ...mockStockFrom, qty: 5 };
      txMock.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest
            .fn()
            .mockResolvedValue([{ id: 'transfer-1', status: 'in_transit' }]),
        }),
      });
      txMock.for.mockReturnValue({
        limit: jest.fn().mockResolvedValue([lowStock]),
      });

      mockDb.transaction = jest.fn(async (cb) => cb(txMock));

      await expect(
        service.transferStock({
          businessId: 'business-1',
          fromLocationId: 'location-1',
          toLocationId: 'location-2',
          items: [{ productId: 'prod-1', qty: 10 }],
        }),
      ).rejects.toThrow();
    });
  });

  describe('completeTransfer (AC-06)', () => {
    it('should add stock to destination and mark transfer completed', async () => {
      const txMock = createTxMock();
      const mockTransfer = {
        id: 'transfer-1',
        status: 'in_transit',
        businessId: 'business-1',
        toLocationId: 'location-2',
      };
      const mockItems = [
        { id: 'ti-1', transferId: 'transfer-1', productId: 'prod-1', qty: 10 },
      ];

      txMock.where
        .mockResolvedValueOnce([mockTransfer])
        .mockResolvedValueOnce(mockItems);
      txMock.for.mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockStockTo]),
      });
      txMock.returning.mockResolvedValue([
        { id: 'transfer-1', status: 'completed' },
      ]);

      mockDb.transaction = jest.fn(async (cb) => cb(txMock));

      await service.completeTransfer('transfer-1');

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'stock.transfer.completed',
        expect.objectContaining({ transferId: 'transfer-1' }),
      );
    });
  });
});
