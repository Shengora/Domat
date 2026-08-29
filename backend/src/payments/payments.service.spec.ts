import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { GramBalance } from '../database/entities/gram-balance.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockTransactionRepo;
  let mockBalanceRepo;

  beforeEach(async () => {
    mockTransactionRepo = {
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
    };
    mockBalanceRepo = {
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        execute: vi.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        {
          provide: getRepositoryToken(GramBalance),
          useValue: mockBalanceRepo,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process deposit successfully', async () => {
      mockBalanceRepo.findOne.mockResolvedValueOnce({ user_id: 1, amount: 0 }); // First findOne
      mockBalanceRepo.findOne.mockResolvedValueOnce({ user_id: 1, amount: 10 }); // Second findOne after update
      mockBalanceRepo.createQueryBuilder().execute.mockResolvedValue({ affected: 1 });
      mockTransactionRepo.findOne.mockResolvedValue(null);

      const result = await service.handleDeposit(1, 10, 'txhash123');
      expect(result).toHaveProperty('success', true);
  });

  it('should fail deposit for negative amount', async () => {
      await expect(service.handleDeposit(1, -10, 'txhash123')).rejects.toThrow('Invalid deposit amount');
  });

  it('should handle withdrawal successfully', async () => {
      mockBalanceRepo.createQueryBuilder().execute.mockResolvedValue({ affected: 1 });
      mockBalanceRepo.findOne.mockResolvedValue({ user_id: 1, amount: 40 });

      const result = await service.handleWithdraw(1, 10);
      expect(result).toHaveProperty('success', true);
  });

  it('should fail withdrawal for insufficient balance', async () => {
      mockBalanceRepo.createQueryBuilder().execute.mockResolvedValue({ affected: 0 });
      await expect(service.handleWithdraw(1, 10)).rejects.toThrow('Insufficient balance');
  });
});
