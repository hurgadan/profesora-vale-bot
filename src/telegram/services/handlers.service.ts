import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot, Context, InlineKeyboard, InputFile } from "grammy";

import { AppConfig } from "../../../_common/types";
import { BotAction } from "../../bot-event/constants";
import { BotEventService } from "../../bot-event/services/bot-event.service";
import { PendingAction } from "../../user/constants";
import { TelegramUser } from "../../user/dao/user.entity";
import { UserService } from "../../user/services/user.service";
import { ACTION_LABELS, CallbackData, FREE_GUIDE_PDF_PATH } from "../constants";
import { TemplateService } from "./template.service";

@Injectable()
export class HandlersService {
  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly userService: UserService,
    private readonly botEventService: BotEventService,
    private readonly templateService: TemplateService,
  ) {}

  register(bot: Bot): void {
    bot.command("start", (ctx) => this.handleStart(ctx));
    bot.callbackQuery(CallbackData.TRIAL_SIGNUP, (ctx) =>
      this.handleTrialSignup(ctx),
    );
    bot.callbackQuery(CallbackData.VIDEO_MEETING, (ctx) =>
      this.handleVideoMeeting(ctx),
    );
    bot.callbackQuery(CallbackData.FREE_GUIDE, (ctx) =>
      this.handleFreeGuide(ctx),
    );
    bot.callbackQuery(CallbackData.ASK_QUESTION, (ctx) =>
      this.handleAskQuestion(ctx),
    );
    bot.on("message:text", (ctx) => this.handleTextMessage(ctx));
  }

  async handleStart(ctx: Context): Promise<void> {
    const user = await this.userService.upsert(ctx.from!);
    const keyboard = new InlineKeyboard()
      .text("Записаться на пробный пакет (2 урока)", CallbackData.TRIAL_SIGNUP)
      .row()
      .text(
        "Выбрать удобное время для видео знакомства",
        CallbackData.VIDEO_MEETING,
      )
      .row()
      .text("Забрать бесплатный гайд", CallbackData.FREE_GUIDE)
      .row()
      .text("Задать вопросы Валерии", CallbackData.ASK_QUESTION);
    await ctx.reply(
      this.templateService.render("welcome", { firstName: user.firstName }),
      { reply_markup: keyboard },
    );
  }

  async handleTrialSignup(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.TRIAL_SIGNUP);
    await this.notifyRecipient(ctx, user, CallbackData.TRIAL_SIGNUP);
    await ctx.reply(
      this.templateService.render("confirm-trial", {
        firstName: user.firstName,
      }),
    );
  }

  async handleVideoMeeting(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.VIDEO_MEETING);
    await this.notifyRecipient(ctx, user, CallbackData.VIDEO_MEETING);
    await ctx.reply(
      this.templateService.render("confirm-video", {
        firstName: user.firstName,
      }),
    );
  }

  async handleFreeGuide(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.FREE_GUIDE);
    await ctx.replyWithDocument(new InputFile(FREE_GUIDE_PDF_PATH));
  }

  async handleAskQuestion(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.userService.setState(user.id, PendingAction.AWAITING_QUESTION);
    await ctx.reply(this.templateService.render("ask-question", {}));
  }

  async handleTextMessage(ctx: Context): Promise<void> {
    const user = await this.userService.upsert(ctx.from!);
    const state = await this.userService.getState(user.id);

    if (state !== PendingAction.AWAITING_QUESTION) {
      return;
    }

    const question = ctx.message?.text ?? "";
    await this.botEventService.log(user, BotAction.ASK_QUESTION, question);
    await this.userService.clearState(user.id);
    await this.notifyRecipient(ctx, user, CallbackData.ASK_QUESTION, question);
    await ctx.reply(
      this.templateService.render("question-received", {
        firstName: user.firstName,
      }),
    );
  }

  private async notifyRecipient(
    ctx: Context,
    user: TelegramUser,
    action: CallbackData,
    payload?: string,
  ): Promise<void> {
    const recipientId = this.config.getOrThrow<string>("recipient");
    const text = this.templateService.render("notify-recipient", {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telegramId: user.telegramId,
      actionLabel: ACTION_LABELS[action],
      payload,
    });
    await ctx.api.sendMessage(recipientId, text);
  }
}
