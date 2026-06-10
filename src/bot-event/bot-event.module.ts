import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BotEvent } from "./dao/bot-event.entity";
import { BotEventRepository } from "./repositories/bot-event.repository";
import { BotEventService } from "./services/bot-event.service";

@Module({
  imports: [TypeOrmModule.forFeature([BotEvent])],
  providers: [BotEventRepository, BotEventService],
  exports: [BotEventService],
})
export class BotEventModule {}
