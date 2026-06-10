import { PendingAction } from '../constants';
import { TelegramUser } from './user.entity';
export declare class UserState {
    id: number;
    user: TelegramUser;
    pendingAction: PendingAction | null;
    updatedAt: Date;
}
