"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const grammy_1 = require("grammy");
const constants_1 = require("../../bot-event/constants");
const bot_event_service_1 = require("../../bot-event/services/bot-event.service");
const constants_2 = require("../../user/constants");
const user_service_1 = require("../../user/services/user.service");
const constants_3 = require("../constants");
const template_service_1 = require("./template.service");
let HandlersService = class HandlersService {
    constructor(config, userService, botEventService, templateService) {
        this.config = config;
        this.userService = userService;
        this.botEventService = botEventService;
        this.templateService = templateService;
    }
    register(bot) {
        bot.command('start', (ctx) => this.handleStart(ctx));
        bot.callbackQuery(constants_3.CallbackData.TRIAL_SIGNUP, (ctx) => this.handleTrialSignup(ctx));
        bot.callbackQuery(constants_3.CallbackData.VIDEO_MEETING, (ctx) => this.handleVideoMeeting(ctx));
        bot.callbackQuery(constants_3.CallbackData.FREE_GUIDE, (ctx) => this.handleFreeGuide(ctx));
        bot.callbackQuery(constants_3.CallbackData.ASK_QUESTION, (ctx) => this.handleAskQuestion(ctx));
        bot.on('message:text', (ctx) => this.handleTextMessage(ctx));
    }
    async handleStart(ctx) {
        const user = await this.userService.upsert(ctx.from);
        const keyboard = new grammy_1.InlineKeyboard()
            .text('Записаться на пробный пакет (2 урока)', constants_3.CallbackData.TRIAL_SIGNUP).row()
            .text('Выбрать удобное время для видео знакомства', constants_3.CallbackData.VIDEO_MEETING).row()
            .text('Забрать бесплатный гайд', constants_3.CallbackData.FREE_GUIDE).row()
            .text('Задать вопросы Валерии', constants_3.CallbackData.ASK_QUESTION);
        await ctx.reply(this.templateService.render('welcome', { firstName: user.firstName }), { reply_markup: keyboard });
    }
    async handleTrialSignup(ctx) {
        await ctx.answerCallbackQuery();
        const user = await this.userService.upsert(ctx.from);
        await this.botEventService.log(user, constants_1.BotAction.TRIAL_SIGNUP);
        await this.notifyRecipient(ctx, user, constants_3.CallbackData.TRIAL_SIGNUP);
        await ctx.reply(this.templateService.render('confirm-trial', { firstName: user.firstName }));
    }
    async handleVideoMeeting(ctx) {
        await ctx.answerCallbackQuery();
        const user = await this.userService.upsert(ctx.from);
        await this.botEventService.log(user, constants_1.BotAction.VIDEO_MEETING);
        await this.notifyRecipient(ctx, user, constants_3.CallbackData.VIDEO_MEETING);
        await ctx.reply(this.templateService.render('confirm-video', { firstName: user.firstName }));
    }
    async handleFreeGuide(ctx) {
        await ctx.answerCallbackQuery();
        const user = await this.userService.upsert(ctx.from);
        await this.botEventService.log(user, constants_1.BotAction.FREE_GUIDE);
        await ctx.replyWithDocument(new grammy_1.InputFile(constants_3.FREE_GUIDE_PDF_PATH));
    }
    async handleAskQuestion(ctx) {
        await ctx.answerCallbackQuery();
        const user = await this.userService.upsert(ctx.from);
        await this.userService.setState(user.id, constants_2.PendingAction.AWAITING_QUESTION);
        await ctx.reply(this.templateService.render('ask-question', {}));
    }
    async handleTextMessage(ctx) {
        const user = await this.userService.upsert(ctx.from);
        const state = await this.userService.getState(user.id);
        if (state !== constants_2.PendingAction.AWAITING_QUESTION) {
            return;
        }
        const question = ctx.message?.text ?? '';
        await this.botEventService.log(user, constants_1.BotAction.ASK_QUESTION, question);
        await this.userService.clearState(user.id);
        await this.notifyRecipient(ctx, user, constants_3.CallbackData.ASK_QUESTION, question);
        await ctx.reply(this.templateService.render('question-received', { firstName: user.firstName }));
    }
    async notifyRecipient(ctx, user, action, payload) {
        const recipientId = this.config.getOrThrow('recipient');
        const text = this.templateService.render('notify-recipient', {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            telegramId: user.telegramId,
            actionLabel: constants_3.ACTION_LABELS[action],
            payload,
        });
        await ctx.api.sendMessage(recipientId, text);
    }
};
exports.HandlersService = HandlersService;
exports.HandlersService = HandlersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService,
        bot_event_service_1.BotEventService,
        template_service_1.TemplateService])
], HandlersService);
//# sourceMappingURL=handlers.service.js.map