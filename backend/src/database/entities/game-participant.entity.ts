import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Game } from './game.entity.js';
import { User } from './user.entity.js';

@Entity()
export class GameParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, (game) => game.participants)
  game: Game;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  betAmount: number;

  @Column({ type: 'varchar', default: 'gram' })
  currencyType: string;

  @CreateDateColumn()
  joinedAt: Date;
}
