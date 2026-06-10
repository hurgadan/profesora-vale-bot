import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../_common/app/config';
import typeOrmModule from '../_common/app/app-modules/type-orm';
import { BotEventModule } from './bot-event/bot-event.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    typeOrmModule,
    UserModule,
    BotEventModule,
    TelegramModule,
  ],
})
export class AppModule {}
