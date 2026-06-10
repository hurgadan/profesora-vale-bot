import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
export declare class BotEvent {
    id: number;
    user: TelegramUser;
    action: BotAction;
    payload: string | null;
    createdAt: Date;
}
