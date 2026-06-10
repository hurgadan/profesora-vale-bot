import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserState } from "./dao/user-state.entity";
import { TelegramUser } from "./dao/user.entity";
import { UserStateRepository } from "./repositories/user-state.repository";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([TelegramUser, UserState])],
  providers: [UserRepository, UserStateRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
