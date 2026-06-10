"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const bot_event_module_1 = require("../bot-event/bot-event.module");
const user_module_1 = require("../user/user.module");
const handlers_service_1 = require("./services/handlers.service");
const template_service_1 = require("./services/template.service");
const telegram_service_1 = require("./services/telegram.service");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule, bot_event_module_1.BotEventModule],
        providers: [telegram_service_1.TelegramService, handlers_service_1.HandlersService, template_service_1.TemplateService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map