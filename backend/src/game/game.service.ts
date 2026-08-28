import { Injectable, Logger } from '@nestjs/common';
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

  async addParticipant(gameId: string, userId: number, amount: number) {
     const participant = this.participantRepository.create({
         game_id: gameId,
         user_id: userId,
         stake_type: 'gram',
         amount_or_gift_id: amount.toString()
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

    // Payout logic
    for (const p of game.participants) {
        if (p.stake_type === 'gram') {
             let bal = await this.balanceRepository.findOne({ where: { user_id: winner.user_id }});
             if (bal) {
                 bal.amount = Number(bal.amount) + Number(p.amount_or_gift_id);
                 await this.balanceRepository.save(bal);
             } else {
                 bal = this.balanceRepository.create({ user_id: winner.user_id, amount: Number(p.amount_or_gift_id) });
                 await this.balanceRepository.save(bal);
             }

             // Create transaction history
             await this.txRepository.save(this.txRepository.create({
                 user_id: winner.user_id,
                 type: winner.user_id === p.user_id ? 'deposit' : 'win',
                 amount: Number(p.amount_or_gift_id)
             }));
             if (winner.user_id !== p.user_id) {
                 await this.txRepository.save(this.txRepository.create({
                     user_id: p.user_id,
                     type: 'loss',
                     amount: Number(p.amount_or_gift_id)
                 }));
             }
        } else if (p.stake_type === 'gift') {
             const gift = await this.giftRepository.findOne({ where: { gift_id: p.amount_or_gift_id }});
             if (gift) {
                 gift.user_id = winner.user_id;
                 gift.status = 'free';
                 await this.giftRepository.save(gift);
             }
        }
    }

    game.status = 'finished';
    await this.gameRepository.save(game);

    return { winner_id: winner.user_id, game, unmasked_seed: game.server_seed, winningFactor };
  }
}
