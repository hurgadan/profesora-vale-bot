import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot } from "grammy";

import { HandlersService } from "./handlers.service";
import { AppConfig } from "../../_common/types";

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  bot: Bot;

  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly handlers: HandlersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const token = this.config.getOrThrow<string>("telegramBotToken");
    this.bot = new Bot(token);
    this.handlers.register(this.bot);
    void this.bot
      .start({
        onStart: (botInfo) =>
          this.logger.log(
            `Bot @${botInfo.username} started, polling for updates`,
          ),
      })
      .catch((err) => this.logger.error("Bot polling stopped with error", err));
  }

  async onModuleDestroy(): Promise<void> {
    await this.bot.stop();
  }
}
