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
    // SECURITY FIX: Validate input amount to prevent SQL injection and negative deposits
    const safeAmount = Number(amount);
    if (isNaN(safeAmount) || safeAmount <= 0) {
        throw new BadRequestException('Invalid deposit amount');
    }

    // SECURITY FIX: Verify transaction on TON Blockchain
    if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_TX_VERIFICATION === 'true') {
        const platformAddress = process.env.PLATFORM_WALLET_ADDRESS;
        if (!platformAddress) {
            throw new BadRequestException('Platform wallet not configured for verification');
        }

        try {
            const response = await fetch(`https://tonapi.io/v2/blockchain/transactions/${txHash}`);
            if (!response.ok) {
                throw new Error('Transaction not found on blockchain');
            }
            const data = await response.json();

            let verifiedAmount = 0;
            let memoMatch = false;

            // Check incoming message to platform address
            if (data.in_msg && (data.in_msg.destination?.address === platformAddress || data.in_msg.destination === platformAddress)) {
                verifiedAmount = Number(data.in_msg.value) / 1e9;

                // SECURITY FIX: Prevent deposit stealing by verifying the memo contains the userId
                if (data.in_msg.decoded_body && data.in_msg.decoded_body.text === userId.toString()) {
                    memoMatch = true;
                } else if (data.in_msg.message_content && data.in_msg.message_content.body === userId.toString()) {
                    memoMatch = true;
                }
            } else if (data.out_msgs) {
                for (const msg of data.out_msgs) {
                    if (msg.destination?.address === platformAddress || msg.destination === platformAddress) {
                        verifiedAmount = Number(msg.value) / 1e9;
                        if (msg.decoded_body && msg.decoded_body.text === userId.toString()) {
                            memoMatch = true;
                        }
                        break;
                    }
                }
            }

            if (verifiedAmount <= 0 || verifiedAmount < safeAmount) {
                throw new BadRequestException('Transaction verification failed: Invalid amount or recipient');
            }
            if (!memoMatch && process.env.REQUIRE_MEMO_VERIFICATION !== 'false') {
                 // In test mode without memo verification we can bypass, but in strict production memo is required
                 throw new BadRequestException('Transaction verification failed: Memo does not match User ID');
            }

            // Use verified amount
            // eslint-disable-next-line no-param-reassign
            amount = verifiedAmount;
        } catch (e: any) {
            throw new BadRequestException(e.message || 'Failed to verify transaction on blockchain');
        }
    } else {
        // eslint-disable-next-line no-param-reassign
        amount = safeAmount;
    }

    // Idempotency check
    const existing = await this.transactionRepository.findOne({ where: { transaction_hash: txHash } });
    if (existing) {
        throw new BadRequestException('Transaction already processed');
    }

    let bal = await this.balanceRepository.findOne({ where: { user_id: userId } });
    if (!bal) {
      bal = this.balanceRepository.create({ user_id: userId, amount: 0 });
      await this.balanceRepository.save(bal);
    }

    // SECURITY FIX: Prevent race conditions using DB-level atomic increment
    await this.balanceRepository
        .createQueryBuilder()
        .update(GramBalance)
        .set({ amount: () => `"amount" + ${amount}` })
        .where("user_id = :userId", { userId })
        .execute();

    const tx = this.transactionRepository.create({
      user_id: userId,
      type: 'deposit',
      amount,
      transaction_hash: txHash
    });
    await this.transactionRepository.save(tx);

    const updatedBal = await this.balanceRepository.findOne({ where: { user_id: userId } });
    return { success: true, new_balance: updatedBal ? Number(updatedBal.amount) : amount };
  }

  async handleWithdraw(userId: number, amount: number) {
      // SECURITY FIX: Validate input amount to prevent SQL injection and negative withdrawals
      const safeAmount = Number(amount);
      if (isNaN(safeAmount) || safeAmount <= 0) {
          throw new BadRequestException('Invalid withdrawal amount');
      }

      // SECURITY FIX: Prevent race conditions using DB-level atomic decrement and WHERE clause
      const result = await this.balanceRepository
        .createQueryBuilder()
        .update(GramBalance)
        .set({ amount: () => `"amount" - ${safeAmount}` })
        .where("user_id = :userId", { userId })
        .andWhere("amount >= :amount", { amount: safeAmount })
        .execute();

      if (result.affected === 0) {
          throw new BadRequestException('Insufficient balance');
      }

      const tx = this.transactionRepository.create({
          user_id: userId,
          type: 'withdraw',
          amount: safeAmount,
      });
      await this.transactionRepository.save(tx);

      const updatedBal = await this.balanceRepository.findOne({ where: { user_id: userId } });

      // In production, initiate actual TON transfer here
      return { success: true, new_balance: updatedBal ? Number(updatedBal.amount) : 0 };
  }

  async getBalance(userId: number) {
      const bal = await this.balanceRepository.findOne({ where: { user_id: userId } });
      return { balance: bal ? Number(bal.amount) : 0 };
  }

  async getHistory(userId: number) {
      const history = await this.transactionRepository.find({
          where: { user_id: userId },
          order: { timestamp: 'DESC' },
          take: 50
      });
      return history;
  }
}
