import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(GramBalance)
    private balanceRepository: Repository<GramBalance>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async handleDeposit(userId: number, amount: number, txHash: string) {
    // In production, we'd verify txHash using TON API here

    // Idempotency check
    const existing = await this.transactionRepository.findOne({ where: { transaction_hash: txHash } });
    if (existing) {
        throw new BadRequestException('Transaction already processed');
    }

    let bal = await this.balanceRepository.findOne({ where: { user_id: userId } });
    if (!bal) {
      bal = this.balanceRepository.create({ user_id: userId, amount: 0 });
    }
    bal.amount = Number(bal.amount) + amount;
    await this.balanceRepository.save(bal);

    const tx = this.transactionRepository.create({
      user_id: userId,
      type: 'deposit',
      amount,
      transaction_hash: txHash
    });
    await this.transactionRepository.save(tx);
    return { success: true, new_balance: bal.amount };
  }

  async handleWithdraw(userId: number, amount: number) {
      // In production, we should use a transaction to lock the balance row here.
      let bal = await this.balanceRepository.findOne({ where: { user_id: userId } });
      if (!bal || Number(bal.amount) < amount) {
          throw new BadRequestException('Insufficient balance');
      }

      // Simplified decrement for now. Real world: UPDATE SET amount = amount - X WHERE id = Y AND amount >= X
      bal.amount = Number(bal.amount) - amount;
      await this.balanceRepository.save(bal);

      const tx = this.transactionRepository.create({
          user_id: userId,
          type: 'withdraw',
          amount,
      });
      await this.transactionRepository.save(tx);

      // In production, initiate actual TON transfer here
      return { success: true, new_balance: bal.amount };
  }
}
