import type { Update } from "@grammyjs/types";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Bot } from "grammy";
import { Repository } from "typeorm";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { getRepository } from "../_common/utils/tests/get-repository";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { BotEventModule } from "../bot-event/bot-event.module";
import { BotAction } from "../bot-event/constants";
import { BotEvent } from "../bot-event/dao/bot-event.entity";
import { HandlersService } from "../telegram/services/handlers.service";
import { TelegramService } from "../telegram/services/telegram.service";
import { TelegramModule } from "../telegram/telegram.module";
import { PendingAction } from "../user/constants";
import { UserState } from "../user/dao/user-state.entity";
import { TelegramUser } from "../user/dao/user.entity";
import { UserModule } from "../user/user.module";

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeStartUpdate(
  userId: number,
  firstName: string,
  username?: string,
): Update {
  return {
    update_id: userId,
    message: {
      message_id: 1,
      from: { id: userId, is_bot: false, first_name: firstName, username },
      chat: { id: userId, type: "private", first_name: firstName },
      date: Math.floor(Date.now() / 1000),
      text: "/start",
      entities: [{ offset: 0, length: 6, type: "bot_command" }],
    },
  } as unknown as Update;
}

function makeCallbackUpdate(
  userId: number,
  firstName: string,
  callbackData: string,
): Update {
  return {
    update_id: userId + 100,
    callback_query: {
      id: `cq_${userId}`,
      from: { id: userId, is_bot: false, first_name: firstName },
      message: {
        message_id: 2,
        chat: { id: userId, type: "private", first_name: firstName },
        date: Math.floor(Date.now() / 1000),
        text: "Welcome",
      },
      chat_instance: "test",
      data: callbackData,
    },
  } as unknown as Update;
}

function makeTextUpdate(
  userId: number,
  firstName: string,
  text: string,
): Update {
  return {
    update_id: userId + 200,
    message: {
      message_id: 3,
      from: { id: userId, is_bot: false, first_name: firstName },
      chat: { id: userId, type: "private", first_name: firstName },
      date: Math.floor(Date.now() / 1000),
      text,
    },
  } as unknown as Update;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("Bot flow (e2e)", () => {
  let moduleFixture: TestingModule;
  let telegramService: TelegramService;
  let userRepo: Repository<TelegramUser>;
  let stateRepo: Repository<UserState>;
  let botEventRepo: Repository<BotEvent>;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([TelegramUser, UserState, BotEvent]),
        UserModule,
        BotEventModule,
        TelegramModule,
      ],
    })
      .overrideProvider(TelegramService)
      .useFactory({
        factory: (config: ConfigService, handlers: HandlersService) => {
          const svc = {
            bot: new Bot("test_token_does_not_matter"),
            onModuleInit: async () => {
              // Intercept ALL outgoing Telegram API calls — no real HTTP
              svc.bot.api.config.use((async (_prev, method) => {
                if (method === "getMe") {
                  return {
                    ok: true,
                    result: {
                      id: 1,
                      is_bot: true,
                      first_name: "TestBot",
                      username: "test_bot",
                      can_join_groups: false,
                      can_read_all_group_messages: false,
                      supports_inline_queries: false,
                    },
                  };
                }
                if (
                  method === "sendMessage" ||
                  method === "sendDocument" ||
                  method === "copyMessage"
                ) {
                  return {
                    ok: true,
                    result: {
                      message_id: 1,
                      chat: { id: 1, type: "private" },
                      date: 0,
                    },
                  };
                }
                return { ok: true, result: true };
              }) as unknown as Parameters<typeof svc.bot.api.config.use>[0]);
              await svc.bot.init(); // calls getMe once (intercepted above)
              handlers.register(svc.bot);
              // Deliberately NOT calling bot.start() — tests drive updates manually
            },
            onModuleDestroy: async () => {
              // nothing to stop
            },
          };
          return svc;
        },
        inject: [ConfigService, HandlersService],
      })
      .compile();

    await moduleFixture.init(); // triggers onModuleInit on overridden service

    telegramService = moduleFixture.get(TelegramService);
    userRepo = getRepository<TelegramUser>(moduleFixture, TelegramUser);
    stateRepo = getRepository<UserState>(moduleFixture, UserState);
    botEventRepo = getRepository<BotEvent>(moduleFixture, BotEvent);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
  });

  // -------------------------------------------------------------------------
  // Scenario 1: /start creates new user
  // -------------------------------------------------------------------------
  it("creates a new user on /start", async () => {
    await telegramService.bot.handleUpdate(
      makeStartUpdate(111, "Anna", "anna_test"),
    );

    const user = await userRepo.findOne({ where: { telegramId: 111 } });
    expect(user).not.toBeNull();
    expect(user!.firstName).toBe("Anna");
    expect(user!.username).toBe("anna_test");
  });

  // -------------------------------------------------------------------------
  // Scenario 2: /start again updates user, no duplicate
  // -------------------------------------------------------------------------
  it("updates existing user on repeated /start, no duplicate created", async () => {
    await telegramService.bot.handleUpdate(makeStartUpdate(222, "OldName"));
    await telegramService.bot.handleUpdate(
      makeStartUpdate(222, "NewName", "new_handle"),
    );

    const users = await userRepo.find({ where: { telegramId: 222 } });
    expect(users).toHaveLength(1);
    expect(users[0].firstName).toBe("NewName");
    expect(users[0].username).toBe("new_handle");
  });

  // -------------------------------------------------------------------------
  // Scenario 3: trial_signup button logs BotEvent
  // -------------------------------------------------------------------------
  it("logs trial_signup event when button pressed", async () => {
    await telegramService.bot.handleUpdate(makeStartUpdate(333, "Boris"));
    await telegramService.bot.handleUpdate(
      makeCallbackUpdate(333, "Boris", "trial_signup"),
    );

    const event = await botEventRepo.findOne({
      where: { action: BotAction.TRIAL_SIGNUP },
    });
    expect(event).not.toBeNull();
    expect(event!.action).toBe(BotAction.TRIAL_SIGNUP);
  });

  // -------------------------------------------------------------------------
  // Scenario 4: video_meeting button logs BotEvent
  // -------------------------------------------------------------------------
  it("logs video_meeting event when button pressed", async () => {
    await telegramService.bot.handleUpdate(makeStartUpdate(444, "Carla"));
    await telegramService.bot.handleUpdate(
      makeCallbackUpdate(444, "Carla", "video_meeting"),
    );

    const event = await botEventRepo.findOne({
      where: { action: BotAction.VIDEO_MEETING },
    });
    expect(event).not.toBeNull();
    expect(event!.action).toBe(BotAction.VIDEO_MEETING);
  });

  // -------------------------------------------------------------------------
  // Scenario 5: free_guide button logs BotEvent
  // -------------------------------------------------------------------------
  it("logs free_guide event when button pressed", async () => {
    await telegramService.bot.handleUpdate(makeStartUpdate(555, "Dana"));
    await telegramService.bot.handleUpdate(
      makeCallbackUpdate(555, "Dana", "free_guide"),
    );

    const event = await botEventRepo.findOne({
      where: { action: BotAction.FREE_GUIDE },
    });
    expect(event).not.toBeNull();
    expect(event!.action).toBe(BotAction.FREE_GUIDE);
  });

  // -------------------------------------------------------------------------
  // Scenario 6: ask_question button sets awaiting_question state
  // -------------------------------------------------------------------------
  it("sets awaiting_question state when ask_question button pressed", async () => {
    await telegramService.bot.handleUpdate(makeStartUpdate(666, "Eve"));
    await telegramService.bot.handleUpdate(
      makeCallbackUpdate(666, "Eve", "ask_question"),
    );

    const user = await userRepo.findOne({ where: { telegramId: 666 } });
    expect(user).not.toBeNull();

    const state = await stateRepo.findOne({
      where: { user: { id: user!.id } },
    });
    expect(state).not.toBeNull();
    expect(state!.pendingAction).toBe(PendingAction.AWAITING_QUESTION);
  });

  // -------------------------------------------------------------------------
  // Scenario 7: follow-up text message logs ask_question event, clears state
  // -------------------------------------------------------------------------
  it("logs ask_question event and clears state when user replies with question", async () => {
    const questionText = "Когда следующий урок?";

    await telegramService.bot.handleUpdate(makeStartUpdate(777, "Frank"));
    await telegramService.bot.handleUpdate(
      makeCallbackUpdate(777, "Frank", "ask_question"),
    );
    await telegramService.bot.handleUpdate(
      makeTextUpdate(777, "Frank", questionText),
    );

    const user = await userRepo.findOne({ where: { telegramId: 777 } });
    expect(user).not.toBeNull();

    const event = await botEventRepo.findOne({
      where: { action: BotAction.ASK_QUESTION },
    });
    expect(event).not.toBeNull();
    expect(event!.action).toBe(BotAction.ASK_QUESTION);
    expect(event!.payload).toBe(questionText);

    const state = await stateRepo.findOne({
      where: { user: { id: user!.id } },
    });
    // State record exists but pendingAction must be cleared (null)
    if (state) {
      expect(state.pendingAction).toBeNull();
    }
  });
});
