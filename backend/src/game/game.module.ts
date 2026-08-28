import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../database/entities/game.entity.js';
import { GameParticipant } from '../database/entities/game-participant.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Gift } from '../database/entities/gift.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';
import { GameService } from './game.service.js';
import { GameGateway } from './game.gateway.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameParticipant, GramBalance, Gift, Transaction])
  ],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
