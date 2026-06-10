import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { BotEventModule } from "./bot-event/bot-event.module";
import { TelegramModule } from "./telegram/telegram.module";
import { UserModule } from "./user/user.module";
import typeOrmModule from "../_common/app/app-modules/type-orm";
import config from "../_common/app/config";

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
