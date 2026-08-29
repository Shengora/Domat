import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Game } from './game.entity.js';
import { User } from './user.entity.js';

@Entity('game_participants')
export class GameParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  game_id: string;

  @Column({ type: 'bigint' })
  @Index()
  user_id: number;

  @Column({ type: 'enum', enum: ['gram', 'gift'] })
  stake_type: 'gram' | 'gift';

  @Column({ type: 'varchar' })
  amount_or_gift_id: string;

  @ManyToOne(() => Game, game => game.participants)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
