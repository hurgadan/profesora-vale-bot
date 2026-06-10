import { Repository } from 'typeorm';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';
export declare class BotEventRepository {
    private readonly repo;
    constructor(repo: Repository<BotEvent>);
    save(data: {
        user: TelegramUser;
        action: BotAction;
        payload: string | null;
    }): Promise<BotEvent>;
}
