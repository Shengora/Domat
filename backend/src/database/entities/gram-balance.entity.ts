import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('gram_balance')
export class GramBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  amount: number;

  @ManyToOne(() => User, user => user.balances)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
