import { Test, TestingModule } from "@nestjs/testing";

import { UserService } from "./user.service";
import { PendingAction } from "../constants";
import { UserState } from "../dao/user-state.entity";
import { TelegramUser } from "../dao/user.entity";
import { UserStateRepository } from "../repositories/user-state.repository";
import { UserRepository } from "../repositories/user.repository";

const mockUserRepo = {
  findByTelegramId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockStateRepo = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: UserStateRepository, useValue: mockStateRepo },
      ],
    }).compile();
    service = module.get(UserService);
  });

  describe("upsert", () => {
    it("creates a new user when not found", async () => {
      mockUserRepo.findByTelegramId.mockResolvedValue(null);
      mockUserRepo.save.mockResolvedValue({
        id: 1,
        telegramId: 123,
        firstName: "Ivan",
      } as TelegramUser);

      const result = await service.upsert({
        id: 123,
        first_name: "Ivan",
        last_name: undefined,
        username: "ivan_test",
      });

      expect(mockUserRepo.findByTelegramId).toHaveBeenCalledWith(123);
      expect(mockUserRepo.save).toHaveBeenCalledWith({
        telegramId: 123,
        firstName: "Ivan",
        lastName: null,
        username: "ivan_test",
      });
      expect(result.telegramId).toBe(123);
    });

    it("updates existing user when found", async () => {
      const existing = {
        id: 5,
        telegramId: 123,
        firstName: "Old",
      } as TelegramUser;
      mockUserRepo.findByTelegramId.mockResolvedValue(existing);
      mockUserRepo.save.mockResolvedValue({
        ...existing,
        firstName: "Ivan",
      } as TelegramUser);

      const result = await service.upsert({
        id: 123,
        first_name: "Ivan",
        last_name: null,
        username: null,
      });

      expect(mockUserRepo.save).toHaveBeenCalledWith({
        id: 5,
        telegramId: 123,
        firstName: "Ivan",
        lastName: null,
        username: null,
      });
      expect(result.firstName).toBe("Ivan");
    });
  });

  describe("setState", () => {
    it("creates state when none exists", async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);
      mockStateRepo.save.mockResolvedValue({} as UserState);

      await service.setState(1, PendingAction.AWAITING_QUESTION);

      expect(mockStateRepo.save).toHaveBeenCalledWith({
        user: { id: 1 },
        pendingAction: PendingAction.AWAITING_QUESTION,
      });
    });

    it("updates state when already exists", async () => {
      const existing = { id: 10, pendingAction: null } as UserState;
      mockStateRepo.findByUserId.mockResolvedValue(existing);
      mockStateRepo.update.mockResolvedValue(undefined);

      await service.setState(1, PendingAction.AWAITING_QUESTION);

      expect(mockStateRepo.update).toHaveBeenCalledWith(10, {
        pendingAction: PendingAction.AWAITING_QUESTION,
      });
    });
  });

  describe("getState", () => {
    it("returns pendingAction when state exists", async () => {
      mockStateRepo.findByUserId.mockResolvedValue({
        pendingAction: PendingAction.AWAITING_QUESTION,
      } as UserState);

      const result = await service.getState(1);

      expect(result).toBe(PendingAction.AWAITING_QUESTION);
    });

    it("returns null when no state exists", async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getState(1);

      expect(result).toBeNull();
    });
  });

  describe("clearState", () => {
    it("does nothing when no state exists", async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);

      await service.clearState(1);

      expect(mockStateRepo.update).not.toHaveBeenCalled();
    });

    it("sets pendingAction to null when state exists", async () => {
      mockStateRepo.findByUserId.mockResolvedValue({
        id: 10,
        pendingAction: PendingAction.AWAITING_QUESTION,
      } as UserState);
      mockStateRepo.update.mockResolvedValue(undefined);

      await service.clearState(1);

      expect(mockStateRepo.update).toHaveBeenCalledWith(10, {
        pendingAction: null,
      });
    });
  });
});
