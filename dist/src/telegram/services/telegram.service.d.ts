import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { AppConfig } from '../../../_common/types';
import { HandlersService } from './handlers.service';
export declare class TelegramService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly handlers;
    bot: Bot;
    constructor(config: ConfigService<AppConfig>, handlers: HandlersService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
