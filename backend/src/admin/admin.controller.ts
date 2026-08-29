import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles('moderator', 'superadmin')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users/:id/ban')
  @Roles('moderator', 'superadmin')
  async toggleBan(@Param('id') id: string) {
    return this.adminService.toggleBanUser(Number(id));
  }

  @Post('users/:id/balance')
  @Roles('superadmin') // Only superadmin can modify balance directly
  async modifyBalance(@Param('id') id: string, @Body('amountChange') amountChange: number) {
    return this.adminService.modifyUserBalance(Number(id), amountChange);
  }

  @Get('transactions')
  @Roles('moderator', 'superadmin')
  async getTransactions() {
    return this.adminService.getAllTransactions();
  }

  @Get('games')
  @Roles('moderator', 'superadmin')
  async getGames() {
    return this.adminService.getAllGames();
  }
}
