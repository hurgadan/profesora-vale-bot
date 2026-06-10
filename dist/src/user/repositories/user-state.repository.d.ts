import { Repository } from 'typeorm';
import { UserState } from '../dao/user-state.entity';
export declare class UserStateRepository {
    private readonly repo;
    constructor(repo: Repository<UserState>);
    findByUserId(userId: number): Promise<UserState | null>;
    save(data: Partial<UserState>): Promise<UserState>;
    update(id: number, data: Partial<UserState>): Promise<void>;
}
