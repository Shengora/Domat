import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'enum', enum: ['deposit', 'withdraw', 'win', 'loss'] })
  type: 'deposit' | 'withdraw' | 'win' | 'loss';

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  amount: number;

  @Column({ type: 'varchar', nullable: true, unique: true })
  transaction_hash: string; // for ton connect deposit proof

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
