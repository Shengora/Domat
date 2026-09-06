import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { GameParticipant } from './game-participant.entity.js';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: 'waiting' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPool: number;

  @Column({ type: 'varchar', nullable: true })
  winnerId: string;

  @OneToMany(() => GameParticipant, (participant) => participant.game)
  participants: GameParticipant[];

  @CreateDateColumn()
  createdAt: Date;
}
