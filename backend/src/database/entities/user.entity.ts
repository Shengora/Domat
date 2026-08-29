import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { GramBalance } from './gram-balance.entity.js';
import { Gift } from './gift.entity.js';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'enum', enum: ['user', 'moderator', 'superadmin'], default: 'user' })
  role: 'user' | 'moderator' | 'superadmin';

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => GramBalance, balance => balance.user)
  balances: GramBalance[];

  @OneToMany(() => Gift, gift => gift.user)
  gifts: Gift[];
}
