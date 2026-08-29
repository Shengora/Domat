import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service.js';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');
  private gameTimer: any = null;

  constructor(
      private gameService: GameService,
      private jwtService: JwtService
  ) {}

  private extractUserId(client: Socket): number | null {
      try {
        const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
        if (token) {
            const payload = this.jwtService.verify(token);
            return payload.sub;
        }
      } catch (e) {
          // Token verification failed
      }
      return null;
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const activeGame = await this.gameService.getActiveGame();
    client.emit('game_state', {
        game_id: activeGame.game_id,
        status: activeGame.status,
        server_seed_hash: activeGame.server_seed_hash
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(client: Socket, payload: any) {
    let userId = this.extractUserId(client);

    if (!userId) {
        // Fallback for tests if token isn't provided/valid,
        // in production we should reject the request.
        if (process.env.NODE_ENV !== 'production') {
            userId = 123456;
        } else {
            client.emit('error', { message: 'Unauthorized' });
            return;
        }
    }

    const activeGame = await this.gameService.getActiveGame();
    await this.gameService.addParticipant(activeGame.game_id, userId, payload.betAmount || 1);

    const updatedGame = await this.gameService.getActiveGame();

    // Broadcast updated game state with players
    this.server.emit('game_state', {
        game_id: updatedGame.game_id,
        status: updatedGame.status,
        server_seed_hash: updatedGame.server_seed_hash,
        players: updatedGame.participants
    });

    if (updatedGame.status === 'waiting' && updatedGame.participants && updatedGame.participants.length >= 2) {
        await this.gameService.updateGameStatus(updatedGame, 'starting');

        let countdown = 10; // short for testing
        this.server.emit('game_starting', { countdown });

        this.gameTimer = setInterval(async () => {
            countdown -= 1;
            this.server.emit('game_tick', { countdown });
            if (countdown <= 0) {
                clearInterval(this.gameTimer);
                await this.gameService.updateGameStatus(updatedGame, 'live');

                // Calculate winner right now to send to frontend for animation
                const result = await this.gameService.processGameFinished(updatedGame.game_id);
                this.server.emit('game_live', { game_id: updatedGame.game_id, winner_factor: result?.winningFactor, winner_id: result?.winner_id });

                // Wait for animation to finish before broadcasting 'finished'
                setTimeout(async () => {
                    this.server.emit('game_finished', result);

                    // Create next game
                    const nextGame = await this.gameService.createNewGame();
                    this.server.emit('game_state', {
                        game_id: nextGame.game_id,
                        status: nextGame.status,
                        server_seed_hash: nextGame.server_seed_hash
                    });
                }, 8000); // 8 sec animation
            }
        }, 1000);
    }
  }
}
