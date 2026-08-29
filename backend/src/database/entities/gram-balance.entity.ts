import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { User } from './user.entity.js';

@Entity('gram_balance')
export class GramBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  amount: number;

  @ManyToOne('User', 'balances')
  @JoinColumn({ name: 'user_id' })
  user: User;
}
