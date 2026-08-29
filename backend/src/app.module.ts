import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { User } from './database/entities/user.entity.js';
import { GramBalance } from './database/entities/gram-balance.entity.js';
import { Gift } from './database/entities/gift.entity.js';
import { Game } from './database/entities/game.entity.js';
import { GameParticipant } from './database/entities/game-participant.entity.js';
import { Transaction } from './database/entities/transaction.entity.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { TelegramModule } from './telegram/telegram.module.js';
import { GameModule } from './game/game.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { GiftsModule } from './gifts/gifts.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'game_user',
        password: configService.get<string>('DB_PASSWORD') || 'game_password',
        database: configService.get<string>('DB_NAME') || 'game_db',
        entities: [User, GramBalance, Gift, Game, GameParticipant, Transaction],
        synchronize: true, // Auto-create tables in dev. In prod use migrations
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TelegramModule,
    GameModule,
    PaymentsModule,
    GiftsModule,
    AdminModule
  ],
})
export class AppModule {}
