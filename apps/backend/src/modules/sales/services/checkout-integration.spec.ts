/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { CheckoutService } from './checkout.service';
import { LoyaltyService } from '../../customers/services/loyalty.service';
import { StockService } from '../../stock/stock.service';
import { VoucherService } from '../../pricing/services/voucher.service';
import { DATABASE_TOKEN } from '../../../core/database/database.module';

describe('F1-INT-01 / transaction.completed integration contract', () => {
  let eventEmitter: EventEmitter2;
  let loyaltyService: LoyaltyService;
  let stockService: StockService;
  let checkoutService: CheckoutService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      transaction: jest.fn(async (callback) => callback(mockDb)),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        CheckoutService,
        LoyaltyService,
        StockService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
        { provide: 'DB_CLIENT', useValue: mockDb },
        {
          provide: VoucherService,
          useValue: {
            validateVoucher: jest.fn(),
            redeemVoucherInTx: jest.fn(),
          },
        },
      ],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    eventEmitter = app.get(EventEmitter2);
    checkoutService = app.get(CheckoutService);
    loyaltyService = app.get(LoyaltyService);
    stockService = app.get(StockService);
  });

  it('registers transaction.completed listeners for stock and loyalty flows', () => {
    const listeners = eventEmitter.listeners('transaction.completed');

    expect(listeners.length).toBeGreaterThanOrEqual(2);
    expect(typeof loyaltyService.handleTransactionCompleted).toBe('function');
    expect(typeof stockService.handleTransactionCompleted).toBe('function');
    expect(checkoutService).toBeDefined();
  });
});
