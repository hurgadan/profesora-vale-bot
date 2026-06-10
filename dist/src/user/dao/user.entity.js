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
exports.TelegramUser = void 0;
const typeorm_1 = require("typeorm");
let TelegramUser = class TelegramUser {
};
exports.TelegramUser = TelegramUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TelegramUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'telegram_id',
        type: 'bigint',
        unique: true,
        transformer: { to: (v) => v, from: (v) => parseInt(v, 10) },
    }),
    __metadata("design:type", Number)
], TelegramUser.prototype, "telegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], TelegramUser.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], TelegramUser.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], TelegramUser.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TelegramUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TelegramUser.prototype, "updatedAt", void 0);
exports.TelegramUser = TelegramUser = __decorate([
    (0, typeorm_1.Entity)('telegram_users')
], TelegramUser);
//# sourceMappingURL=user.entity.js.map