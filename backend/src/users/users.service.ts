import { Injectable } from '@nestjs/common';
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
    if (!user) {
      user = this.usersRepository.create({ telegram_id, username });
    } else if (username && user.username !== username) {
      user.username = username;
    }
    return this.usersRepository.save(user);
  }
}
