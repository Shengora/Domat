import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftsController } from './gifts.controller.js';
import { GiftsService } from './gifts.service.js';
import { Gift } from '../database/entities/gift.entity.js';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Gift, GramBalance, Transaction])],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
