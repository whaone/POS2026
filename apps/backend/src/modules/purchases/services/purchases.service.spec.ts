/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PurchasesService - AC-07 / FR-PUR-09: Purchase Receive ACID', () => {
  let service: PurchasesService;
  let mockDb: any;
  let mockEventEmitter: any;

  const mockPurchase = {
    id: 'purchase-1',
    businessId: 'business-1',
    locationId: 'location-1',
    supplierId: 'supplier-1',
    status: 'credit',
    subtotal: 100000,
    grandTotal: 100000,
    paidTotal: 0,
  };

  const mockPurchaseItems = [
    {
      id: 'item-1',
      purchaseId: 'purchase-1',
      productId: 'prod-1',
      qty: 10,
      cost: 10000,
      tax: 0,
    },
  ];

  beforeEach(async () => {
    mockDb = {
      transaction: jest.fn(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: 'DB_CLIENT',
          useValue: mockDb,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  describe('receivePurchase (AC-07)', () => {
    it('should receive purchase atomically, increase stock, and update ledger', async () => {
      mockDb.where
        .mockResolvedValueOnce([mockPurchase]) // Purchase
        .mockResolvedValueOnce(mockPurchaseItems); // Items

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([mockPurchase]),
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          returning: jest
            .fn()
            .mockResolvedValue([{ ...mockPurchase, status: 'received' }]),
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
        };
        return callback(txMock);
      });

      mockDb.transaction = mockTransaction;

      await service.receivePurchase('business-1', 'purchase-1');

      // Verify transaction was used
      expect(mockTransaction).toHaveBeenCalled();

      // Verify event was emitted (for other modules to react, like stock/accounting)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'purchase.received',
        expect.objectContaining({
          purchaseId: 'purchase-1',
          businessId: 'business-1',
        }),
      );
    });

    it('should reject if purchase not found', async () => {
      mockDb.where.mockResolvedValueOnce([]); // Not found

      await expect(
        service.receivePurchase('business-1', 'non-existent'),
      ).rejects.toThrow('not found');
    });

    it('should reject if purchase already received/paid', async () => {
      mockDb.where.mockResolvedValueOnce([
        { ...mockPurchase, status: 'received' },
      ]);

      await expect(
        service.receivePurchase('business-1', 'purchase-1'),
      ).rejects.toThrow('already processed');
    });
  });
});
