import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserState } from "../dao/user-state.entity";

@Injectable()
export class UserStateRepository {
  constructor(
    @InjectRepository(UserState)
    private readonly repo: Repository<UserState>,
  ) {}

  async findByUserId(userId: number): Promise<UserState | null> {
    return this.repo.findOne({ where: { user: { id: userId } } });
  }

  async save(data: Partial<UserState>): Promise<UserState> {
    return this.repo.save(data);
  }

  async update(id: number, data: Partial<UserState>): Promise<void> {
    await this.repo.update(id, data);
  }
}
