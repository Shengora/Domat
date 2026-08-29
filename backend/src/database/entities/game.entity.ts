import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import type { GameParticipant } from './game-participant.entity.js';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  game_id: string;

  @Column({ type: 'enum', enum: ['waiting', 'starting', 'live', 'finished'], default: 'waiting' })
  status: 'waiting' | 'starting' | 'live' | 'finished';

  @Column({ type: 'decimal', precision: 18, scale: 9, default: 0 })
  total_pool_value: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'varchar', nullable: true })
  server_seed_hash: string;

  @Column({ type: 'varchar', nullable: true })
  server_seed: string;

  @OneToMany('GameParticipant', 'game')
  participants: GameParticipant[];
}
