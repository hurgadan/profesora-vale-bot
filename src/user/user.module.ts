import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from './dao/user.entity';
import { UserState } from './dao/user-state.entity';
import { UserRepository } from './repositories/user.repository';
import { UserStateRepository } from './repositories/user-state.repository';
import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramUser, UserState])],
  providers: [UserRepository, UserStateRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
