import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('gram_balances')
export class GramBalance {
  @PrimaryGeneratedColumn('uuid')
  balance_id: string;

  @Column({ type: 'bigint', unique: true })
  @Index()
  user_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  amount: number;

  @UpdateDateColumn()
  last_updated: Date;

  @ManyToOne(() => User, user => user.balances)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
