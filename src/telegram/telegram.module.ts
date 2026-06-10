import { Module } from '@nestjs/common';
import { BotEventModule } from '../bot-event/bot-event.module';
import { UserModule } from '../user/user.module';
import { HandlersService } from './services/handlers.service';
import { TemplateService } from './services/template.service';
import { TelegramService } from './services/telegram.service';

@Module({
  imports: [UserModule, BotEventModule],
  providers: [TelegramService, HandlersService, TemplateService],
})
export class TelegramModule {}
