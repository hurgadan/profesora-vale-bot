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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../repositories/user.repository");
const user_state_repository_1 = require("../repositories/user-state.repository");
let UserService = class UserService {
    constructor(userRepo, stateRepo) {
        this.userRepo = userRepo;
        this.stateRepo = stateRepo;
    }
    async upsert(from) {
        const existing = await this.userRepo.findByTelegramId(from.id);
        const data = {
            firstName: from.first_name,
            lastName: from.last_name ?? null,
            username: from.username ?? null,
        };
        if (existing) {
            return this.userRepo.save({ ...existing, ...data });
        }
        return this.userRepo.save({ telegramId: from.id, ...data });
    }
    async getState(userId) {
        const state = await this.stateRepo.findByUserId(userId);
        return state?.pendingAction ?? null;
    }
    async setState(userId, action) {
        const existing = await this.stateRepo.findByUserId(userId);
        if (existing) {
            await this.stateRepo.update(existing.id, { pendingAction: action });
        }
        else {
            await this.stateRepo.save({ user: { id: userId }, pendingAction: action });
        }
    }
    async clearState(userId) {
        const existing = await this.stateRepo.findByUserId(userId);
        if (existing) {
            await this.stateRepo.update(existing.id, { pendingAction: null });
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        user_state_repository_1.UserStateRepository])
], UserService);
//# sourceMappingURL=user.service.js.map