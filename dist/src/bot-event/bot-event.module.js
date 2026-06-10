"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotEventModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bot_event_entity_1 = require("./dao/bot-event.entity");
const bot_event_repository_1 = require("./repositories/bot-event.repository");
const bot_event_service_1 = require("./services/bot-event.service");
let BotEventModule = class BotEventModule {
};
exports.BotEventModule = BotEventModule;
exports.BotEventModule = BotEventModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([bot_event_entity_1.BotEvent])],
        providers: [bot_event_repository_1.BotEventRepository, bot_event_service_1.BotEventService],
        exports: [bot_event_service_1.BotEventService],
    })
], BotEventModule);
//# sourceMappingURL=bot-event.module.js.map