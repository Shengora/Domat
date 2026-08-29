import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GramBalance } from '../database/entities/gram-balance.entity.js';
import { Transaction } from '../database/entities/transaction.entity.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([GramBalance, Transaction])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
