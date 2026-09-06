import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  gift_id: string;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'decimal', precision: 18, scale: 9 })
  estimated_value: number;

  @Column({ type: 'varchar', default: 'free' })
  status: string;

  @CreateDateColumn()
  acquired_at: Date;

  @ManyToOne(() => User, user => user.gifts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
