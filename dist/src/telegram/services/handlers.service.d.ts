import { ConfigService } from '@nestjs/config';
import { Bot, Context } from 'grammy';
import { AppConfig } from '../../../_common/types';
import { BotEventService } from '../../bot-event/services/bot-event.service';
import { UserService } from '../../user/services/user.service';
import { TemplateService } from './template.service';
export declare class HandlersService {
    private readonly config;
    private readonly userService;
    private readonly botEventService;
    private readonly templateService;
    constructor(config: ConfigService<AppConfig>, userService: UserService, botEventService: BotEventService, templateService: TemplateService);
    register(bot: Bot): void;
    handleStart(ctx: Context): Promise<void>;
    handleTrialSignup(ctx: Context): Promise<void>;
    handleVideoMeeting(ctx: Context): Promise<void>;
    handleFreeGuide(ctx: Context): Promise<void>;
    handleAskQuestion(ctx: Context): Promise<void>;
    handleTextMessage(ctx: Context): Promise<void>;
    private notifyRecipient;
}
