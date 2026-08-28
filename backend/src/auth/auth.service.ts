import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateTelegramData(initData: string): Promise<any> {
    const urlParams = new URLSearchParams(initData);

    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || 'dummy';

    if (botToken !== 'dummy') {
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash !== hash) {
          throw new UnauthorizedException('Invalid telegram data signature');
        }
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
        throw new UnauthorizedException('User data missing');
    }

    const user = JSON.parse(userStr);

    const dbUser = await this.usersService.createOrUpdate(user.id, user.username);

    const payload = { sub: dbUser.telegram_id, username: dbUser.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: dbUser,
    };
  }
}
