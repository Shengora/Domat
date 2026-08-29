import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramUpdate } from './telegram.update.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    UsersModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') || 'dummy-token',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
