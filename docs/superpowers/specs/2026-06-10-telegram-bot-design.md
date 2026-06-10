# Дизайн: Telegram-бот для преподавателя (profesora_vale_bot)

**Дата:** 2026-06-10  
**Статус:** Approved

---

## 1. Цель

Реализовать Telegram-бот для преподавателя Валерии. Бот показывает приветственное сообщение с 4 кнопками при `/start`, маршрутизирует действия пользователей, уведомляет получателя (RECIPIENT) и отправляет PDF-гайд. Все действия и пользователи сохраняются в PostgreSQL.

---

## 2. Архитектура

### Стек

- **NestJS** — основной фреймворк
- **grammY** — Telegram Bot API library (long polling, без webhook)
- **TypeORM + PostgreSQL** — хранение пользователей, состояний, событий
- **Handlebars** — шаблоны текстовых ответов бота

### Модули

```
src/
  main.ts
  app.module.ts
  telegram/          ← бот, хендлеры, grammY интеграция
  user/              ← TelegramUser + UserState
  bot-event/         ← BotEvent (лог действий)
```

---

## 3. Сущности и схема БД

### `TelegramUser` (модуль `user`)

| Поле | Тип | Описание |
|---|---|---|
| `id` | serial PK | |
| `telegramId` | bigint UNIQUE NOT NULL | ID пользователя в Telegram |
| `firstName` | varchar NOT NULL | |
| `lastName` | varchar nullable | |
| `username` | varchar nullable | @username без @ |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `UserState` (модуль `user`)

| Поле | Тип | Описание |
|---|---|---|
| `id` | serial PK | |
| `user` | OneToOne → TelegramUser | FK, CASCADE DELETE |
| `pendingAction` | enum nullable | `awaiting_question` |
| `updatedAt` | timestamp | |

### `BotEvent` (модуль `bot-event`)

| Поле | Тип | Описание |
|---|---|---|
| `id` | serial PK | |
| `user` | ManyToOne → TelegramUser | FK |
| `action` | enum NOT NULL | `trial_signup`, `video_meeting`, `free_guide`, `ask_question` |
| `payload` | text nullable | текст вопроса для `ask_question` |
| `createdAt` | timestamp | |

---

## 4. Bot Flow

### `/start`
1. Upsert `TelegramUser` (создать или обновить firstName/lastName/username)
2. Отправить приветственное сообщение (шаблон `welcome.hbs`) с 4 inline-кнопками

### Кнопка 1 — «Записаться на пробный пакет (2 урока)»
1. Залогировать `BotEvent { action: trial_signup }`
2. Отправить RECIPIENT уведомление: имя + @username нажавшего (шаблон `notify-recipient.hbs`)
3. Ответить пользователю подтверждением (шаблон `confirm-trial.hbs`)

### Кнопка 2 — «Выбрать удобное время для видео знакомства»
1. Залогировать `BotEvent { action: video_meeting }`
2. Отправить RECIPIENT уведомление (шаблон `notify-recipient.hbs`)
3. Ответить пользователю подтверждением (шаблон `confirm-video.hbs`)

### Кнопка 3 — «Забрать бесплатный гайд»
1. Залогировать `BotEvent { action: free_guide }`
2. Отправить файл `assets/cv.pdf` пользователю через `InputFile`

### Кнопка 4 — «Задать вопросы Валерии» (многошаговый диалог)
1. Установить `UserState.pendingAction = awaiting_question`
2. Ответить пользователю: «Напишите ваш вопрос» (шаблон `ask-question.hbs`)
3. Следующее входящее сообщение от этого пользователя:
   - Залогировать `BotEvent { action: ask_question, payload: текст вопроса }`
   - Очистить `UserState.pendingAction = null`
   - Переслать вопрос RECIPIENT с именем и @username (шаблон `notify-recipient.hbs`)
   - Ответить пользователю подтверждением (шаблон `question-received.hbs`)

---

## 5. grammY + NestJS интеграция

`TelegramService` создаёт `Bot` из grammY как NestJS-провайдер:

```typescript
@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;

  async onModuleInit() {
    this.bot = new Bot(token);
    // регистрация хендлеров через HandlersService
    await this.bot.start(); // grammY запускает long polling в фоне
  }

  async onModuleDestroy() {
    await this.bot.stop();
  }
}
```

`HandlersService` принимает `Bot` и регистрирует все обработчики. Зависит от `UserService` и `BotEventService`.

### Структура модуля `telegram`

```
src/telegram/
  telegram.module.ts
  constants/
    index.ts              ← enum BotAction, callback_data константы
  services/
    telegram.service.ts   ← Bot провайдер, lifecycle
    handlers.service.ts   ← регистрация хендлеров, бизнес-логика
  templates/
    welcome.hbs
    confirm-trial.hbs
    confirm-video.hbs
    ask-question.hbs
    question-received.hbs
    notify-recipient.hbs
```

---

## 6. Конфигурация

### Новые переменные окружения

```
TELEGRAM_BOT_TOKEN=    ← токен бота от @BotFather
RECIPIENT=             ← числовой Telegram chat_id получателя (Валерии)
```

> **Важно:** `RECIPIENT` должен быть числовым `chat_id`, а не `@username`. Получить его можно, написав боту [@userinfobot](https://t.me/userinfobot) в Telegram. Получатель должен предварительно запустить бота (`/start`), иначе Telegram не позволит боту отправить ему сообщение.

### Изменения в коде

- `AppConfig` — добавить поля `telegramBotToken: string` и `recipient: string`
- `config.ts` — добавить чтение `TELEGRAM_BOT_TOKEN`

### Новые зависимости

```json
"grammy": "^1.x",
"handlebars": "^4.x"
```

---

## 7. Миграции

Три миграции в порядке создания:

1. `{timestamp}-create-telegram-users.ts`
2. `{timestamp}-create-user-states.ts`
3. `{timestamp}-create-bot-events.ts`

---

## 8. Тестирование

### Unit tests

- `UserService` — upsert-логика, `setState` / `getState` / `clearState` (репозитории замоканы)
- `BotEventService` — создание и обновление событий (репозиторий замокан)
- `HandlersService` — логика каждой кнопки, сценарий ask_question (Bot, UserService, BotEventService замоканы)

### e2e tests

> Запускаются **только** через `npm run docker:test` — изолированный PostgreSQL на tmpfs.

Симуляция через `bot.handleUpdate(fakeUpdate)`. Исходящие вызовы к Telegram API мокируются через grammY API-трансформер.

**Сценарии:**

| Сценарий | Проверка |
|---|---|
| `/start` (новый пользователь) | `TelegramUser` создан в БД |
| `/start` повторно | `TelegramUser` обновлён, не задублирован |
| Кнопка 1 | `BotEvent { action: trial_signup }` создан |
| Кнопка 2 | `BotEvent { action: video_meeting }` создан |
| Кнопка 3 | `BotEvent { action: free_guide }` создан |
| Кнопка 4 → сообщение | `UserState` установлен → очищен; `BotEvent { action: ask_question, payload }` создан |

---

## 9. Структура файлов (итог)

```
src/
  main.ts
  app.module.ts
  telegram/
    telegram.module.ts
    constants/index.ts
    services/
      telegram.service.ts
      handlers.service.ts
    templates/
      welcome.hbs
      confirm-trial.hbs
      confirm-video.hbs
      ask-question.hbs
      question-received.hbs
      notify-recipient.hbs
  user/
    user.module.ts
    constants/index.ts
    dao/
      user.entity.ts
      user-state.entity.ts
      migrations/
        {timestamp}-create-telegram-users.ts
        {timestamp}-create-user-states.ts
    repositories/
      user.repository.ts
      user-state.repository.ts
    services/
      user.service.ts
  bot-event/
    bot-event.module.ts
    constants/index.ts
    dao/
      bot-event.entity.ts
      migrations/
        {timestamp}-create-bot-events.ts
    repositories/
      bot-event.repository.ts
    services/
      bot-event.service.ts
assets/
  cv.pdf
```
