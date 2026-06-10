import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TelegramUser } from "../dao/user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(TelegramUser)
    private readonly repo: Repository<TelegramUser>,
  ) {}

  async findByTelegramId(telegramId: number): Promise<TelegramUser | null> {
    return this.repo.findOne({ where: { telegramId } });
  }

  async save(data: Partial<TelegramUser>): Promise<TelegramUser> {
    return this.repo.save(data);
  }

  async update(id: number, data: Partial<TelegramUser>): Promise<void> {
    await this.repo.update(id, data);
  }
}
