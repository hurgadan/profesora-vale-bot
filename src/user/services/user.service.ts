import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly stateRepo: UserStateRepository,
  ) {}

  async upsert(from: TelegramFrom): Promise<TelegramUser> {
    const existing = await this.userRepo.findByTelegramId(from.id);
    const data = {
      firstName: from.first_name,
      lastName: from.last_name ?? null,
      username: from.username ?? null,
    };

    if (existing) {
      await this.userRepo.update(existing.id, data);
      return { ...existing, ...data };
    }

    return this.userRepo.save({ telegramId: from.id, ...data });
  }

  async getState(userId: number): Promise<PendingAction | null> {
    const state = await this.stateRepo.findByUserId(userId);
    return state?.pendingAction ?? null;
  }

  async setState(userId: number, action: PendingAction): Promise<void> {
    const existing = await this.stateRepo.findByUserId(userId);
    if (existing) {
      await this.stateRepo.update(existing.id, { pendingAction: action });
    } else {
      await this.stateRepo.save({ user: { id: userId } as TelegramUser, pendingAction: action });
    }
  }

  async clearState(userId: number): Promise<void> {
    const existing = await this.stateRepo.findByUserId(userId);
    if (existing) {
      await this.stateRepo.update(existing.id, { pendingAction: null });
    }
  }
}
