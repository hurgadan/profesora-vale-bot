import { Repository } from 'typeorm';
import { TelegramUser } from '../dao/user.entity';
export declare class UserRepository {
    private readonly repo;
    constructor(repo: Repository<TelegramUser>);
    findByTelegramId(telegramId: number): Promise<TelegramUser | null>;
    save(data: Partial<TelegramUser>): Promise<TelegramUser>;
    update(id: number, data: Partial<TelegramUser>): Promise<void>;
}
