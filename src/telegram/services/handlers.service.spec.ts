import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import type { Context } from "grammy";

import { HandlersService } from "./handlers.service";
import { TemplateService } from "./template.service";
import { BotAction } from "../../bot-event/constants";
import { BotEventService } from "../../bot-event/services/bot-event.service";
import { PendingAction } from "../../user/constants";
import { TelegramUser } from "../../user/dao/user.entity";
import { UserService } from "../../user/services/user.service";

const mockUserService = {
  upsert: jest.fn(),
  getState: jest.fn(),
  setState: jest.fn(),
  clearState: jest.fn(),
};

const mockBotEventService = {
  log: jest.fn(),
};

const mockTemplateService = {
  render: jest.fn().mockReturnValue("rendered text"),
};

const mockConfig = {
  getOrThrow: jest.fn().mockReturnValue("123456789"),
};

const mockCtx = {
  from: {
    id: 100,
    first_name: "Test",
    last_name: null,
    username: "testuser",
    is_bot: false,
  },
  reply: jest.fn().mockResolvedValue({}),
  replyWithDocument: jest.fn().mockResolvedValue({}),
  answerCallbackQuery: jest.fn().mockResolvedValue({}),
  message: { text: "My question" },
  api: { sendMessage: jest.fn().mockResolvedValue({}) },
} as unknown as Context;

describe("HandlersService", () => {
  let service: HandlersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlersService,
        { provide: UserService, useValue: mockUserService },
        { provide: BotEventService, useValue: mockBotEventService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get(HandlersService);
  });

  const user = {
    id: 1,
    telegramId: 100,
    firstName: "Test",
    lastName: null,
    username: "testuser",
  } as TelegramUser;

  describe("handleStart", () => {
    it("upserts user and sends welcome message with keyboard", async () => {
      mockUserService.upsert.mockResolvedValue(user);

      await service.handleStart(mockCtx);

      expect(mockUserService.upsert).toHaveBeenCalledWith(mockCtx.from);
      expect(mockTemplateService.render).toHaveBeenCalledWith("welcome", {
        firstName: "Test",
      });
      expect(mockCtx.reply).toHaveBeenCalledWith(
        "rendered text",
        expect.objectContaining({ reply_markup: expect.anything() }),
      );
    });
  });

  describe("handleTrialSignup", () => {
    it("logs event, notifies recipient, and confirms to user", async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleTrialSignup(mockCtx);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(
        user,
        BotAction.TRIAL_SIGNUP,
      );
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith(
        "123456789",
        "rendered text",
      );
      expect(mockCtx.reply).toHaveBeenCalledWith("rendered text");
    });
  });

  describe("handleVideoMeeting", () => {
    it("logs event, notifies recipient, and confirms to user", async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleVideoMeeting(mockCtx);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(
        user,
        BotAction.VIDEO_MEETING,
      );
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith(
        "123456789",
        "rendered text",
      );
      expect(mockCtx.reply).toHaveBeenCalledWith("rendered text");
    });
  });

  describe("handleFreeGuide", () => {
    it("logs event and sends PDF document", async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleFreeGuide(mockCtx);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(
        user,
        BotAction.FREE_GUIDE,
      );
      expect(mockCtx.replyWithDocument).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe("handleAskQuestion", () => {
    it("sets pending state and prompts user", async () => {
      mockUserService.upsert.mockResolvedValue(user);

      await service.handleAskQuestion(mockCtx);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockUserService.setState).toHaveBeenCalledWith(
        1,
        PendingAction.AWAITING_QUESTION,
      );
      expect(mockCtx.reply).toHaveBeenCalledWith("rendered text");
    });
  });

  describe("handleTextMessage", () => {
    it("ignores message when no pending state", async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockUserService.getState.mockResolvedValue(null);

      await service.handleTextMessage(mockCtx);

      expect(mockBotEventService.log).not.toHaveBeenCalled();
    });

    it("forwards question to recipient when awaiting_question state", async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockUserService.getState.mockResolvedValue(
        PendingAction.AWAITING_QUESTION,
      );
      mockBotEventService.log.mockResolvedValue({});

      await service.handleTextMessage(mockCtx);

      expect(mockBotEventService.log).toHaveBeenCalledWith(
        user,
        BotAction.ASK_QUESTION,
        "My question",
      );
      expect(mockUserService.clearState).toHaveBeenCalledWith(1);
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith(
        "123456789",
        "rendered text",
      );
      expect(mockCtx.reply).toHaveBeenCalledWith("rendered text");
    });
  });
});
