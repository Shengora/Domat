import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity()
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  owner: User;

  @Column({ type: 'varchar' })
  giftType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedValue: number;

  @Column({ type: 'varchar', default: 'free' })
  status: string;

  @CreateDateColumn()
  acquiredAt: Date;
}
