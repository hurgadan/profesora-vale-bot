import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';
import { BotEventRepository } from '../repositories/bot-event.repository';
export declare class BotEventService {
    private readonly repo;
    constructor(repo: BotEventRepository);
    log(user: TelegramUser, action: BotAction, payload?: string | null): Promise<BotEvent>;
}
