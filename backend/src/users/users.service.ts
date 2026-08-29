import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(telegram_id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ telegram_id });
  }

  async createOrUpdate(telegram_id: number, username?: string): Promise<User> {
    let user = await this.findOne(telegram_id);

    // Determine role based on .env config
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => Number(id.trim()));
    const isSuperAdmin = adminIds.includes(telegram_id);
    const role = isSuperAdmin ? 'superadmin' : 'user';

    if (!user) {
      user = this.usersRepository.create({ telegram_id, username, role });
    } else {
      if (username && user.username !== username) {
        user.username = username;
      }
      // Re-evaluate role on login in case config changed
      if (isSuperAdmin && user.role !== 'superadmin') {
          user.role = 'superadmin';
      }
    }

    // Prevent banned users from logging in
    if (user.is_banned) {
        throw new UnauthorizedException('User is banned from the platform');
    }

    return this.usersRepository.save(user);
  }
}
