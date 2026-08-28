import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Gift } from '../database/entities/gift.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';

@Injectable()
export class GiftsService {
  private readonly WITHDRAWAL_FEE = 0.25;

  constructor(
    @InjectRepository(Gift) private giftRepository: Repository<Gift>,
    @InjectRepository(GramBalance) private balanceRepository: Repository<GramBalance>,
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
  ) {}

  async getUserGifts(userId: number) {
    return this.giftRepository.find({
      where: { user_id: userId, status: 'free' },
    });
  }

  async withdrawGifts(userId: number, giftIds: string[]) {
    if (!giftIds || giftIds.length === 0) {
      throw new BadRequestException('No gifts selected for withdrawal');
    }

    // Verify all selected gifts belong to the user and are free
    const gifts = await this.giftRepository.find({
      where: {
        gift_id: In(giftIds),
        user_id: userId,
        status: 'free',
      },
    });

    if (gifts.length !== giftIds.length) {
      throw new BadRequestException('Some selected gifts are unavailable or not owned by you');
    }

    const totalFee = gifts.length * this.WITHDRAWAL_FEE;

    // Deduct fee atomically
    const result = await this.balanceRepository
      .createQueryBuilder()
      .update(GramBalance)
      .set({ amount: () => `"amount" - ${totalFee}` })
      .where('user_id = :userId', { userId })
      .andWhere('amount >= :totalFee', { totalFee })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException(`Insufficient GRAM balance. Need ${totalFee} GRAM for commission.`);
    }

    // Record fee transaction
    const tx = this.transactionRepository.create({
      user_id: userId,
      type: 'withdraw', // treat fee as a withdrawal of gram
      amount: totalFee,
    });
    await this.transactionRepository.save(tx);

    // Remove the gifts from DB (since they are sent to the user's telegram)
    await this.giftRepository.remove(gifts);

    // Fetch updated balance to return to frontend
    const updatedBal = await this.balanceRepository.findOne({ where: { user_id: userId } });

    // In a real production system, you would call a Telegram API/Bot here to actually send the gifts.

    return {
        success: true,
        message: 'Gifts withdrawn successfully',
        withdrawnCount: gifts.length,
        feePaid: totalFee,
        new_balance: updatedBal ? Number(updatedBal.amount) : 0
    };
  }

  // Mock endpoint for testing receiving a gift
  async mockDepositGift(userId: number, type: string = 'Star', estimatedValue: number = 10) {
    const gift = this.giftRepository.create({
      user_id: userId,
      type,
      estimated_value: estimatedValue,
      status: 'free',
    });
    await this.giftRepository.save(gift);
    return gift;
  }
}
