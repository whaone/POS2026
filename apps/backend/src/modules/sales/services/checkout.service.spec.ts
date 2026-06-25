/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckoutService } from './checkout.service';
import { VoucherService } from '../../pricing/services/voucher.service';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import { PaymentMethod } from '../dto/checkout.dto';

/**
 * REQ-driven tests for the checkout payment path.
 * Locks: FR-SAL-09 idempotency (anti double-charge), FR-SAL-08 underpayment
 * rejection (E-PAY-422), NFR-REL-01.
 */
describe('CheckoutService — idempotency & payment guards (FR-SAL-08/09)', () => {
  let service: CheckoutService;
  let mockDb: any;
  let txMock: any;
  let eventEmitter: { emit: jest.Mock };

  const BUSINESS_ID = 'business-1';

  /** A sale row locked inside the transaction. */
  function lockSale(sale: Record<string, unknown>) {
    txMock.for.mockReturnValue({
      limit: jest.fn().mockResolvedValue([sale]),
    });
  }

  beforeEach(async () => {
    txMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      for: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{}]),
    };

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      // Outer idempotency lookup ends in .limit()
      limit: jest.fn().mockResolvedValue([]),
      transaction: jest.fn(async (cb) => cb(txMock)),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
        { provide: EventEmitter2, useValue: eventEmitter },
        {
          provide: VoucherService,
          useValue: {
            validateVoucher: jest.fn(),
            redeemVoucherInTx: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('is idempotent: returns the existing paid sale and skips the transaction', async () => {
    const existing = { id: 'sale-1', status: 'paid', grandTotal: 100000 };
    mockDb.limit.mockResolvedValue([existing]);

    const result = await service.processPayment(BUSINESS_ID, {
      saleId: 'sale-1',
      idempotencyKey: 'key-123',
      payments: [{ method: PaymentMethod.CASH, amount: 100000 }],
    });

    expect(result).toBe(existing);
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('enters the transaction when no prior sale carries the idempotency key', async () => {
    mockDb.limit.mockResolvedValue([]); // no existing key
    lockSale(undefined as any); // sale not found -> short-circuits before item threading
    txMock.for.mockReturnValue({ limit: jest.fn().mockResolvedValue([]) });

    await expect(
      service.processPayment(BUSINESS_ID, {
        saleId: 'sale-1',
        idempotencyKey: 'fresh-key',
        payments: [{ method: PaymentMethod.CASH, amount: 100000 }],
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);

    // Proves the idempotency guard did NOT short-circuit: we reached the tx.
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it('rejects payment below grand total with E-PAY-422 (FR-SAL-08)', async () => {
    mockDb.limit.mockResolvedValue([]);
    lockSale({ id: 'sale-1', status: 'held', grandTotal: 100000 });

    await expect(
      service.processPayment(BUSINESS_ID, {
        saleId: 'sale-1',
        idempotencyKey: 'key-under',
        payments: [{ method: PaymentMethod.CASH, amount: 50000 }],
      } as any),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'E-PAY-422' }),
    });
  });

  it('rejects re-paying a sale already marked paid', async () => {
    mockDb.limit.mockResolvedValue([]); // key not seen, but sale itself is paid
    lockSale({ id: 'sale-1', status: 'paid', grandTotal: 100000 });

    await expect(
      service.processPayment(BUSINESS_ID, {
        saleId: 'sale-1',
        idempotencyKey: 'key-x',
        payments: [{ method: PaymentMethod.CASH, amount: 100000 }],
      } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('throws NotFound when the sale does not exist', async () => {
    mockDb.limit.mockResolvedValue([]);
    lockSale(undefined as any); // for('update').limit -> []
    txMock.for.mockReturnValue({ limit: jest.fn().mockResolvedValue([]) });

    await expect(
      service.processPayment(BUSINESS_ID, {
        saleId: 'missing',
        idempotencyKey: 'key-y',
        payments: [{ method: PaymentMethod.CASH, amount: 100000 }],
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
