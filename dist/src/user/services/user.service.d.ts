import { PendingAction } from '../constants';
import { TelegramUser } from '../dao/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserStateRepository } from '../repositories/user-state.repository';
interface TelegramFrom {
    id: number;
    first_name: string;
    last_name?: string | null;
    username?: string | null;
}
export declare class UserService {
    private readonly userRepo;
    private readonly stateRepo;
    constructor(userRepo: UserRepository, stateRepo: UserStateRepository);
    upsert(from: TelegramFrom): Promise<TelegramUser>;
    getState(userId: number): Promise<PendingAction | null>;
    setState(userId: number, action: PendingAction): Promise<void>;
    clearState(userId: number): Promise<void>;
}
export {};
