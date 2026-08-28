import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service.js';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');
  private gameTimer: any = null;

  constructor(private gameService: GameService) {}

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
    const activeGame = await this.gameService.getActiveGame();

    // For demo purposes, immediately start countdown if waiting
    if (activeGame.status === 'waiting') {
        await this.gameService.updateGameStatus(activeGame, 'starting');

        let countdown = 10; // short for testing
        this.server.emit('game_starting', { countdown });

        this.gameTimer = setInterval(async () => {
            countdown -= 1;
            this.server.emit('game_tick', { countdown });
            if (countdown <= 0) {
                clearInterval(this.gameTimer);
                await this.gameService.updateGameStatus(activeGame, 'live');

                // Calculate winner right now to send to frontend for animation
                const result = await this.gameService.processGameFinished(activeGame.game_id);
                this.server.emit('game_live', { game_id: activeGame.game_id, winner_factor: result?.winningFactor, winner_id: result?.winner_id });

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
