import { Test, TestingModule } from '@nestjs/testing';
import { GiftsService } from './gifts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Gift } from '../database/entities/gift.entity';
import { GramBalance } from '../database/entities/gram-balance.entity';
import { Transaction } from '../database/entities/transaction.entity';

describe('GiftsService', () => {
  let service: GiftsService;
  let mockGiftRepo;
  let mockBalanceRepo;
  let mockTransactionRepo;

  beforeEach(async () => {
    mockGiftRepo = {
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };
    mockTransactionRepo = {
      save: vi.fn(),
      create: vi.fn().mockImplementation((dto) => dto),
    };
    mockBalanceRepo = {
      findOne: vi.fn(),
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
        GiftsService,
        {
          provide: getRepositoryToken(Gift),
          useValue: mockGiftRepo,
        },
        {
          provide: getRepositoryToken(GramBalance),
          useValue: mockBalanceRepo,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        }
      ],
    }).compile();

    service = module.get<GiftsService>(GiftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get user gifts', async () => {
      mockGiftRepo.find.mockResolvedValue([{ id: 1, type: 'star' }]);
      const gifts = await service.getUserGifts(1);
      expect(gifts).toHaveLength(1);
  });

  it('should process gift withdrawal with sufficient fee', async () => {
      mockGiftRepo.find.mockResolvedValue([{ gift_id: 'g1', type: 'star', status: 'free', user_id: 1 }]);
      mockBalanceRepo.createQueryBuilder().execute.mockResolvedValue({ affected: 1 });

      const result = await service.withdrawGifts(1, ['g1']);

      expect(mockGiftRepo.remove).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
  });

  it('should fail gift withdrawal for insufficient fee', async () => {
      mockGiftRepo.find.mockResolvedValue([{ gift_id: 'g1', type: 'star', status: 'free', user_id: 1 }]);
      mockBalanceRepo.createQueryBuilder().execute.mockResolvedValue({ affected: 0 });

      await expect(service.withdrawGifts(1, ['g1'])).rejects.toThrow(/Insufficient GRAM balance/);
  });
});
