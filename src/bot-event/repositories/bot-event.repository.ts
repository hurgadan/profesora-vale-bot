import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';

@Injectable()
export class BotEventRepository {
  constructor(
    @InjectRepository(BotEvent)
    private readonly repo: Repository<BotEvent>,
  ) {}

  async save(data: { user: TelegramUser; action: BotAction; payload: string | null }): Promise<BotEvent> {
    return this.repo.save(data);
  }
}
