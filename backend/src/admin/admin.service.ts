import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';
import { Game } from '../database/entities/game.entity.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(GramBalance) private balanceRepository: Repository<GramBalance>,
    @InjectRepository(Transaction) private txRepository: Repository<Transaction>,
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find({
      relations: { balances: true },
      order: { created_at: 'DESC' },
    });
  }

  async toggleBanUser(telegram_id: number) {
    const user = await this.userRepository.findOneBy({ telegram_id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.is_banned = !user.is_banned;
    await this.userRepository.save(user);
    return { success: true, is_banned: user.is_banned };
  }

  async modifyUserBalance(telegram_id: number, amountChange: number) {
    if (isNaN(amountChange)) throw new BadRequestException('Invalid amount');

    let bal = await this.balanceRepository.findOne({ where: { user_id: telegram_id } });
    if (!bal) {
      bal = this.balanceRepository.create({ user_id: telegram_id, amount: 0 });
      await this.balanceRepository.save(bal);
    }

    const newAmount = Number(bal.amount) + Number(amountChange);
    if (newAmount < 0) {
        throw new BadRequestException('Resulting balance cannot be negative');
    }

    // Atomic update
    await this.balanceRepository
        .createQueryBuilder()
        .update(GramBalance)
        .set({ amount: () => `"amount" + ${amountChange}` })
        .where("user_id = :userId", { userId: telegram_id })
        .execute();

    const updated = await this.balanceRepository.findOne({ where: { user_id: telegram_id } });

    // Record admin intervention as transaction
    await this.txRepository.save(this.txRepository.create({
        user_id: telegram_id,
        type: amountChange > 0 ? 'deposit' : 'withdraw',
        amount: Math.abs(amountChange),
        transaction_hash: `admin_${Date.now()}`
    }));

    return { success: true, new_balance: updated ? Number(updated.amount) : newAmount };
  }

  async getAllTransactions() {
    return this.txRepository.find({
      order: { timestamp: 'DESC' },
      take: 100
    });
  }

  async getAllGames() {
    return this.gameRepository.find({
      relations: { participants: true },
      order: { created_at: 'DESC' },
      take: 50
    });
  }
}
