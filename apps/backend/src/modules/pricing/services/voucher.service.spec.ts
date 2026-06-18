/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { VoucherService } from './voucher.service';
import { ConflictException } from '@nestjs/common';

describe('VoucherService - AC-02 / FR-PRC-05 / FR-PRC-08: Voucher Single-Use Atomicity', () => {
  let service: VoucherService;
  let mockDb: any;

  const mockVoucher = {
    id: 'voucher-1',
    businessId: 'business-1',
    code: 'TEST100',
    type: 'fixed',
    value: 10000,
    minPurchase: 0,
    status: 'active',
    expiryDate: new Date('2027-12-31'),
  };

  beforeEach(async () => {
    mockDb = {
      transaction: jest.fn(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: 'DB_CLIENT',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
  });

  describe('validateVoucher', () => {
    it('should validate active voucher successfully', async () => {
      mockDb.where.mockResolvedValue([mockVoucher]);

      const result = await service.validateVoucher('TEST100', 50000);

      expect(result).toEqual(mockVoucher);
    });

    it('should reject voucher below minimum purchase (E-VOUCHER-409)', async () => {
      const voucherWithMin = { ...mockVoucher, minPurchase: 100000 };
      mockDb.where.mockResolvedValue([voucherWithMin]);

      await expect(service.validateVoucher('TEST100', 50000)).rejects.toThrow(
        'Minimum purchase',
      );
    });

    it('should reject expired voucher (E-VOUCHER-409)', async () => {
      const expiredVoucher = {
        ...mockVoucher,
        expiryDate: new Date('2020-01-01'),
      };
      mockDb.where.mockResolvedValue([expiredVoucher]);

      await expect(service.validateVoucher('TEST100', 50000)).rejects.toThrow(
        'expired',
      );
    });

    it('should reject non-active voucher (E-VOUCHER-409)', async () => {
      const redeemedVoucher = { ...mockVoucher, status: 'redeemed' };
      mockDb.where.mockResolvedValue([redeemedVoucher]);

      await expect(service.validateVoucher('TEST100', 50000)).rejects.toThrow(
        'not active',
      );
    });
  });

  describe('redeemVoucher - CRITICAL: Single-Use Atomicity (AC-02)', () => {
    const redemptionPayload = {
      voucherCode: 'TEST100',
      transactionId: 'sale-1',
      branchId: 'branch-1',
      cashierId: 'cashier-1',
      amountUsed: 10000,
    };

    it('should redeem voucher atomically on first attempt', async () => {
      mockDb.where.mockResolvedValueOnce([mockVoucher]);

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([mockVoucher]),
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([
            {
              id: 'redemption-1',
              voucherId: mockVoucher.id,
              ...redemptionPayload,
            },
          ]),
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
        };
        return callback(txMock);
      });

      mockDb.transaction = mockTransaction;

      const result = await service.redeemVoucher(redemptionPayload);

      expect(result.voucherId).toBe(mockVoucher.id);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should reject duplicate redemption with 409 conflict (AC-02 / E-VOUCHER-409)', async () => {
      mockDb.where.mockResolvedValueOnce([mockVoucher]);

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([mockVoucher]),
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest
            .fn()
            .mockRejectedValue(
              new Error('duplicate key value violates unique constraint'),
            ),
        };
        return callback(txMock);
      });

      mockDb.transaction = mockTransaction;

      await expect(service.redeemVoucher(redemptionPayload)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle race condition: concurrent redemptions (AC-02)', async () => {
      mockDb.where.mockResolvedValue([mockVoucher]);

      let firstAttemptSucceeded = false;
      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue([mockVoucher]),
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockImplementation(() => {
            if (!firstAttemptSucceeded) {
              firstAttemptSucceeded = true;
              return Promise.resolve([
                {
                  id: 'redemption-1',
                  voucherId: mockVoucher.id,
                  ...redemptionPayload,
                },
              ]);
            } else {
              return Promise.reject(
                new Error('duplicate key value violates unique constraint'),
              );
            }
          }),
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
        };
        return callback(txMock);
      });

      mockDb.transaction = mockTransaction;

      const attempt1 = service.redeemVoucher(redemptionPayload);
      const attempt2 = service.redeemVoucher({
        ...redemptionPayload,
        transactionId: 'sale-2',
      });

      const [result1, result2] = await Promise.allSettled([attempt1, attempt2]);

      expect(result1.status).toBe('fulfilled');
      expect(result2.status).toBe('rejected');
      if (result2.status === 'rejected') {
        expect(result2.reason).toBeInstanceOf(ConflictException);
      }
    });
  });
});
