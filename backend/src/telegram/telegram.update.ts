import { Update, Ctx, Start, Help } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UsersService } from '../users/users.service.js';

@Update()
export class TelegramUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    if (ctx.from) {
      await this.usersService.createOrUpdate(ctx.from.id, ctx.from.username);
    }
    await ctx.reply('Welcome to the Battle Game bot! Use the Web App to play.');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply('This bot allows you to play the Battle Game. Open the Mini App to deposit GRAM/Gifts and join games.');
  }
}
