import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('deposit')
  async deposit(@Req() req: any, @Body('amount') amount: number, @Body('txHash') txHash: string) {
    return this.paymentsService.handleDeposit(req.user.userId, amount, txHash);
  }

  @Post('withdraw')
  async withdraw(@Req() req: any, @Body('amount') amount: number) {
      return this.paymentsService.handleWithdraw(req.user.userId, amount);
  }

  @Get('balance')
  async getBalance(@Req() req: any) {
      return this.paymentsService.getBalance(req.user.userId);
  }

  @Get('history')
  async getHistory(@Req() req: any) {
      return this.paymentsService.getHistory(req.user.userId);
  }
}
