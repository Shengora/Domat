import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'varchar' })
  transaction_type: string;

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  amount: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  transaction_hash: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
