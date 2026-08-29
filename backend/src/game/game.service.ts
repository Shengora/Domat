import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../database/entities/game.entity.js';
import { GameParticipant } from '../database/entities/game-participant.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Gift } from '../database/entities/gift.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';
import * as crypto from 'crypto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GameParticipant) private participantRepository: Repository<GameParticipant>,
    @InjectRepository(GramBalance) private balanceRepository: Repository<GramBalance>,
    @InjectRepository(Gift) private giftRepository: Repository<Gift>,
    @InjectRepository(Transaction) private txRepository: Repository<Transaction>,
  ) {}

  async createNewGame(): Promise<Game> {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

    const game = this.gameRepository.create({
      status: 'waiting',
      total_pool_value: 0,
      server_seed: serverSeed,
      server_seed_hash: serverSeedHash,
    });
    return this.gameRepository.save(game);
  }

  async getActiveGame(): Promise<Game> {
    let game = await this.gameRepository.findOne({
      where: [{ status: 'waiting' }, { status: 'starting' }],
      relations: { participants: true },
      order: { created_at: 'DESC' }
    });
    if (!game) {
      game = await this.createNewGame();
      game.participants = [];
    }
    return game;
  }

  async addParticipant(gameId: string, userId: number, amountOrGiftId: string | number, type: 'gram' | 'gift' = 'gram') {
     if (type === 'gram') {
         const amount = Number(amountOrGiftId);
         if (isNaN(amount) || amount <= 0) {
             throw new BadRequestException('Invalid amount');
         }

         // 1. Check if user has sufficient balance
         let bal = await this.balanceRepository.findOne({ where: { user_id: userId } });
         if (!bal || Number(bal.amount) < amount) {
             throw new BadRequestException('Insufficient balance to join game');
         }

         // 2. Deduct amount atomically
         const result = await this.balanceRepository
            .createQueryBuilder()
            .update(GramBalance)
            .set({ amount: () => `"amount" - ${amount}` })
            .where("user_id = :userId", { userId })
            .andWhere("amount >= :amount", { amount })
            .execute();

         if (result.affected === 0) {
            throw new BadRequestException('Insufficient balance to join game');
         }

         // 3. Record transaction for placing bet
         await this.txRepository.save(this.txRepository.create({
             user_id: userId,
             type: 'loss', // Temporary state before outcome
             amount: amount
         }));
     } else {
         // Handle Gift betting
         const giftId = String(amountOrGiftId);
         const gift = await this.giftRepository.findOne({ where: { gift_id: giftId, user_id: userId, status: 'free' } });

         if (!gift) {
             throw new BadRequestException('Gift not found or not available');
         }

         // Lock the gift
         gift.status = 'staked';
         await this.giftRepository.save(gift);
     }

     // 4. Add to game participants
     const participant = this.participantRepository.create({
         game_id: gameId,
         user_id: userId,
         stake_type: type,
         amount_or_gift_id: String(amountOrGiftId)
     });
     await this.participantRepository.save(participant);
  }

  async updateGameStatus(game: Game, status: 'waiting' | 'starting' | 'live' | 'finished') {
    game.status = status;
    await this.gameRepository.save(game);
  }

  async processGameFinished(gameId: string): Promise<any> {
    const game = await this.gameRepository.findOne({ where: { game_id: gameId }, relations: { participants: true } });
    if (!game || game.status === 'finished') return;

    if (game.participants.length === 0) {
      game.status = 'finished';
      await this.gameRepository.save(game);
      return null;
    }

    const combinedEntropy = game.server_seed + game.participants.map(p => p.user_id).join('-');
    const hash = crypto.createHash('sha256').update(combinedEntropy).digest('hex');
    const hashNum = BigInt('0x' + hash.substring(0, 16));
    const maxNum = BigInt('0xffffffffffffffff');
    const winningFactor = Number(hashNum) / Number(maxNum);

    let totalWeight = 0;
    const participantWeights = [];
    for (const p of game.participants) {
      let weight = 0;
      if (p.stake_type === 'gram') {
        weight = Number(p.amount_or_gift_id);
      } else if (p.stake_type === 'gift') {
        const gift = await this.giftRepository.findOne({ where: { gift_id: p.amount_or_gift_id } });
        if (gift) {
          weight = Number(gift.estimated_value);
        }
      }
      participantWeights.push({ participant: p, weight });
      totalWeight += weight;
    }

    let winner = game.participants[0];
    if (totalWeight > 0) {
      const winningValue = winningFactor * totalWeight;
      let currentSum = 0;
      for (const pw of participantWeights) {
        currentSum += pw.weight;
        if (winningValue <= currentSum) {
          winner = pw.participant;
          break;
        }
      }
    }

    this.logger.log(`Game ${gameId} won by ${winner.user_id} with winning factor ${winningFactor}`);

    // Payout logic with 5% platform fee
    let totalGramWon = 0;
    let winnerTotalGramBet = 0;

    // First, process losses and calculate total gram won by winner
    for (const p of game.participants) {
        if (winner.user_id !== p.user_id) {
            if (p.stake_type === 'gram') {
                totalGramWon += Number(p.amount_or_gift_id);
                // We already deducted and recorded 'loss' transaction when joining
            } else if (p.stake_type === 'gift') {
                const gift = await this.giftRepository.findOne({ where: { gift_id: p.amount_or_gift_id }});
                if (gift) {
                    gift.user_id = winner.user_id;
                    gift.status = 'free';
                    await this.giftRepository.save(gift);
                }
            }
        } else {
             if (p.stake_type === 'gram') {
                 winnerTotalGramBet += Number(p.amount_or_gift_id);

                 // Remove the initial 'loss' transaction since they won
                 // Simplified: we would ideally refund initial bet transaction,
                 // but here we just leave it and add a combined 'win' transaction
             } else if (p.stake_type === 'gift') {
                const gift = await this.giftRepository.findOne({ where: { gift_id: p.amount_or_gift_id }});
                if (gift) {
                    // Winner gets their own gift back
                    gift.status = 'free';
                    await this.giftRepository.save(gift);
                }
             }
        }
    }

    // Process winner's gram payout
    // Winner gets their initial bet back + net winnings from others
    const totalGramReturnedToWinner = winnerTotalGramBet;
    if (totalGramWon > 0 || winnerTotalGramBet > 0) {
        const platformFee = totalGramWon * 0.05; // 5% fee on winnings only
        const netWin = totalGramWon - platformFee;
        const totalPayout = totalGramReturnedToWinner + netWin;

        let bal = await this.balanceRepository.findOne({ where: { user_id: winner.user_id }});
        if (!bal) {
             bal = this.balanceRepository.create({ user_id: winner.user_id, amount: 0 });
             await this.balanceRepository.save(bal);
        }

        await this.balanceRepository
            .createQueryBuilder()
            .update(GramBalance)
            .set({ amount: () => `"amount" + ${totalPayout}` })
            .where("user_id = :userId", { userId: winner.user_id })
            .execute();

        // Record single combined 'win' transaction for total payout
        // Note: net change = totalPayout - winnerTotalGramBet = netWin
        await this.txRepository.save(this.txRepository.create({
             user_id: winner.user_id,
             type: 'win',
             amount: totalPayout
        }));
    }

    game.status = 'finished';
    await this.gameRepository.save(game);

    return { winner_id: winner.user_id, game, unmasked_seed: game.server_seed, winningFactor };
  }
}
