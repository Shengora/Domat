import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { User } from '../database/entities/user.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';
import { Game } from '../database/entities/game.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, GramBalance, Transaction, Game])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
