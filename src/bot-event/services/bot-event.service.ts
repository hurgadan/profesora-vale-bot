import { Injectable } from '@nestjs/common';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';
import { BotEventRepository } from '../repositories/bot-event.repository';

@Injectable()
export class BotEventService {
  constructor(private readonly repo: BotEventRepository) {}

  async log(user: TelegramUser, action: BotAction, payload: string | null = null): Promise<BotEvent> {
    return this.repo.save({ user, action, payload });
  }
}
