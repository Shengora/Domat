import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GiftsService } from './gifts.service.js';

@Controller('gifts')
@UseGuards(JwtAuthGuard)
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  async getGifts(@Request() req: any) {
    return this.giftsService.getUserGifts(req.user.userId);
  }

  @Post('withdraw')
  async withdrawGifts(@Request() req: any, @Body('giftIds') giftIds: string[]) {
    return this.giftsService.withdrawGifts(req.user.userId, giftIds);
  }

  @Post('mock-deposit')
  async mockDepositGift(@Request() req: any, @Body() body: { type?: string, estimatedValue?: number }) {
    return this.giftsService.mockDepositGift(req.user.userId, body.type, body.estimatedValue);
  }
}
