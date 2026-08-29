import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { User } from './user.entity.js';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  gift_id: string;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'enum', enum: ['free', 'staked'], default: 'free' })
  status: 'free' | 'staked';

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  estimated_value: number;

  @ManyToOne('User', 'gifts')
  @JoinColumn({ name: 'user_id' })
  user: User;
}
