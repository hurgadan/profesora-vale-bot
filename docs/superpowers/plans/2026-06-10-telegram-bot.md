# Telegram Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Telegram bot for language teacher Valeria with 4 inline buttons, PostgreSQL user tracking, and action logging.

**Architecture:** grammY bot integrated as a NestJS service using long polling. Three domain modules: `user` (TelegramUser + UserState), `bot-event` (action log), `telegram` (bot lifecycle + handlers + Handlebars templates). App bootstrap uses `NestFactory.createApplicationContext` — no HTTP server needed.

**Tech Stack:** NestJS 11, grammY, TypeORM 0.3, PostgreSQL, Handlebars, Jest 30

---

## File Map

```
tsconfig.json                                    ← create (required for nest build)
nest-cli.json                                    ← create (.hbs asset copy to dist)
database/data-source.ts                          ← fix wrong import path
src/main.ts                                      ← create
src/app.module.ts                                ← create
src/user/
  user.module.ts
  constants/index.ts
  dao/user.entity.ts
  dao/user-state.entity.ts
  dao/migrations/1749600000000-create-telegram-users.ts
  dao/migrations/1749600001000-create-user-states.ts
  repositories/user.repository.ts
  repositories/user-state.repository.ts
  services/user.service.ts
  services/user.service.spec.ts
src/bot-event/
  bot-event.module.ts
  constants/index.ts
  dao/bot-event.entity.ts
  dao/migrations/1749600002000-create-bot-events.ts
  repositories/bot-event.repository.ts
  services/bot-event.service.ts
  services/bot-event.service.spec.ts
src/telegram/
  telegram.module.ts
  constants/index.ts
  services/template.service.ts
  services/telegram.service.ts
  services/handlers.service.ts
  services/handlers.service.spec.ts
  templates/welcome.hbs
  templates/confirm-trial.hbs
  templates/confirm-video.hbs
  templates/ask-question.hbs
  templates/question-received.hbs
  templates/notify-recipient.hbs
src/tests/
  bot-flow.e2e.spec.ts
```

---

## Task 1: Build config, dependencies, fix data-source import

**Files:**
- Create: `tsconfig.json`
- Create: `nest-cli.json`
- Modify: `package.json` (add grammy, handlebars)
- Modify: `database/data-source.ts` (fix import path)

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false
  },
  "include": ["src/**/*", "_common/**/*", "database/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Create `nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "assets": [
      { "include": "**/templates/*.hbs", "watchAssets": true }
    ],
    "tsConfigPath": "tsconfig.json"
  }
}
```

- [ ] **Step 3: Install grammy and handlebars**

```bash
npm install grammy handlebars
```

Expected: packages added to `node_modules`, `package.json` updated with `"grammy"` and `"handlebars"` in `dependencies`.

- [ ] **Step 4: Fix `database/data-source.ts` import**

Current line 5: `import config from '../config';`
Replace with: `import config from '../_common/app/config';`

Result:
```typescript
import * as path from 'node:path';

import { DataSource } from 'typeorm';

import config from '../_common/app/config';

export const AppDataSource = new DataSource({
  ...config().databaseConnectionOptions,
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', '**', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
});
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: `dist/` directory created, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json nest-cli.json package.json package-lock.json database/data-source.ts _common/types/app-config.type.ts _common/app/config.ts .env.dist CLAUDE.md
git commit -m "chore: add build config, grammy+handlebars deps, fix AppConfig type and data-source import"
```

---

## Task 2: User constants, entities, migrations

**Files:**
- Create: `src/user/constants/index.ts`
- Create: `src/user/dao/user.entity.ts`
- Create: `src/user/dao/user-state.entity.ts`
- Create: `src/user/dao/migrations/1749600000000-create-telegram-users.ts`
- Create: `src/user/dao/migrations/1749600001000-create-user-states.ts`

- [ ] **Step 1: Create `src/user/constants/index.ts`**

```typescript
export enum PendingAction {
  AWAITING_QUESTION = 'awaiting_question',
}
```

- [ ] **Step 2: Create `src/user/dao/user.entity.ts`**

```typescript
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('telegram_users')
export class TelegramUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'telegram_id',
    type: 'bigint',
    unique: true,
    transformer: { to: (v: number) => v, from: (v: string) => parseInt(v, 10) },
  })
  telegramId: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  username: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 3: Create `src/user/dao/user-state.entity.ts`**

```typescript
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PendingAction } from '../constants';
import { TelegramUser } from './user.entity';

@Entity('user_states')
export class UserState {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TelegramUser, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: TelegramUser;

  @Column({ name: 'pending_action', type: 'varchar', nullable: true })
  pendingAction: PendingAction | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 4: Create migration `src/user/dao/migrations/1749600000000-create-telegram-users.ts`**

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTelegramUsers1749600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'telegram_users',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'telegram_id', type: 'bigint', isNullable: false },
          { name: 'first_name', type: 'varchar', isNullable: false },
          { name: 'last_name', type: 'varchar', isNullable: true },
          { name: 'username', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'telegram_users',
      new TableIndex({ name: 'UQ_telegram_users_telegram_id', columnNames: ['telegram_id'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('telegram_users');
  }
}
```

- [ ] **Step 5: Create migration `src/user/dao/migrations/1749600001000-create-user-states.ts`**

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserStates1749600001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_states',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'pending_action', type: 'varchar', isNullable: true },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'user_states',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'telegram_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_states');
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/user/
git commit -m "feat(user): add TelegramUser and UserState entities with migrations"
```

---

## Task 3: User repositories, service (TDD), module

**Files:**
- Create: `src/user/repositories/user.repository.ts`
- Create: `src/user/repositories/user-state.repository.ts`
- Create: `src/user/services/user.service.spec.ts`
- Create: `src/user/services/user.service.ts`
- Create: `src/user/user.module.ts`

- [ ] **Step 1: Create `src/user/repositories/user.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramUser } from '../dao/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(TelegramUser)
    private readonly repo: Repository<TelegramUser>,
  ) {}

  async findByTelegramId(telegramId: number): Promise<TelegramUser | null> {
    return this.repo.findOne({ where: { telegramId } });
  }

  async save(data: Partial<TelegramUser>): Promise<TelegramUser> {
    return this.repo.save(data);
  }

  async update(id: number, data: Partial<TelegramUser>): Promise<void> {
    await this.repo.update(id, data);
  }
}
```

- [ ] **Step 2: Create `src/user/repositories/user-state.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserState } from '../dao/user-state.entity';

@Injectable()
export class UserStateRepository {
  constructor(
    @InjectRepository(UserState)
    private readonly repo: Repository<UserState>,
  ) {}

  async findByUserId(userId: number): Promise<UserState | null> {
    return this.repo.findOne({ where: { user: { id: userId } } });
  }

  async save(data: Partial<UserState>): Promise<UserState> {
    return this.repo.save(data);
  }

  async update(id: number, data: Partial<UserState>): Promise<void> {
    await this.repo.update(id, data);
  }
}
```

- [ ] **Step 3: Write failing unit tests `src/user/services/user.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserStateRepository } from '../repositories/user-state.repository';
import { PendingAction } from '../constants';
import { TelegramUser } from '../dao/user.entity';
import { UserState } from '../dao/user-state.entity';

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

describe('UserService', () => {
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

  describe('upsert', () => {
    it('creates a new user when not found', async () => {
      mockUserRepo.findByTelegramId.mockResolvedValue(null);
      mockUserRepo.save.mockResolvedValue({ id: 1, telegramId: 123, firstName: 'Ivan' } as TelegramUser);

      const result = await service.upsert({ id: 123, first_name: 'Ivan', last_name: undefined, username: 'ivan_test' });

      expect(mockUserRepo.findByTelegramId).toHaveBeenCalledWith(123);
      expect(mockUserRepo.save).toHaveBeenCalledWith({
        telegramId: 123,
        firstName: 'Ivan',
        lastName: null,
        username: 'ivan_test',
      });
      expect(result.telegramId).toBe(123);
    });

    it('updates existing user when found', async () => {
      const existing = { id: 5, telegramId: 123, firstName: 'Old' } as TelegramUser;
      mockUserRepo.findByTelegramId.mockResolvedValue(existing);
      mockUserRepo.update.mockResolvedValue(undefined);
      mockUserRepo.save.mockResolvedValue({ ...existing, firstName: 'Ivan' } as TelegramUser);

      await service.upsert({ id: 123, first_name: 'Ivan', last_name: null, username: null });

      expect(mockUserRepo.update).toHaveBeenCalledWith(5, {
        firstName: 'Ivan',
        lastName: null,
        username: null,
      });
    });
  });

  describe('setState', () => {
    it('creates state when none exists', async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);
      mockStateRepo.save.mockResolvedValue({} as UserState);

      await service.setState(1, PendingAction.AWAITING_QUESTION);

      expect(mockStateRepo.save).toHaveBeenCalledWith({
        user: { id: 1 },
        pendingAction: PendingAction.AWAITING_QUESTION,
      });
    });

    it('updates state when already exists', async () => {
      const existing = { id: 10, pendingAction: null } as UserState;
      mockStateRepo.findByUserId.mockResolvedValue(existing);
      mockStateRepo.update.mockResolvedValue(undefined);

      await service.setState(1, PendingAction.AWAITING_QUESTION);

      expect(mockStateRepo.update).toHaveBeenCalledWith(10, { pendingAction: PendingAction.AWAITING_QUESTION });
    });
  });

  describe('getState', () => {
    it('returns pendingAction when state exists', async () => {
      mockStateRepo.findByUserId.mockResolvedValue({
        pendingAction: PendingAction.AWAITING_QUESTION,
      } as UserState);

      const result = await service.getState(1);

      expect(result).toBe(PendingAction.AWAITING_QUESTION);
    });

    it('returns null when no state exists', async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getState(1);

      expect(result).toBeNull();
    });
  });

  describe('clearState', () => {
    it('does nothing when no state exists', async () => {
      mockStateRepo.findByUserId.mockResolvedValue(null);

      await service.clearState(1);

      expect(mockStateRepo.update).not.toHaveBeenCalled();
    });

    it('sets pendingAction to null when state exists', async () => {
      mockStateRepo.findByUserId.mockResolvedValue({ id: 10, pendingAction: PendingAction.AWAITING_QUESTION } as UserState);
      mockStateRepo.update.mockResolvedValue(undefined);

      await service.clearState(1);

      expect(mockStateRepo.update).toHaveBeenCalledWith(10, { pendingAction: null });
    });
  });
});
```

- [ ] **Step 4: Run tests — expect FAIL**

```bash
npm run test:unit -- --testPathPattern=user.service
```

Expected: FAIL — `Cannot find module './user.service'`

- [ ] **Step 5: Create `src/user/services/user.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PendingAction } from '../constants';
import { TelegramUser } from '../dao/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserStateRepository } from '../repositories/user-state.repository';

interface TelegramFrom {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly stateRepo: UserStateRepository,
  ) {}

  async upsert(from: TelegramFrom): Promise<TelegramUser> {
    const existing = await this.userRepo.findByTelegramId(from.id);
    const data = {
      firstName: from.first_name,
      lastName: from.last_name ?? null,
      username: from.username ?? null,
    };

    if (existing) {
      await this.userRepo.update(existing.id, data);
      return { ...existing, ...data };
    }

    return this.userRepo.save({ telegramId: from.id, ...data });
  }

  async getState(userId: number): Promise<PendingAction | null> {
    const state = await this.stateRepo.findByUserId(userId);
    return state?.pendingAction ?? null;
  }

  async setState(userId: number, action: PendingAction): Promise<void> {
    const existing = await this.stateRepo.findByUserId(userId);
    if (existing) {
      await this.stateRepo.update(existing.id, { pendingAction: action });
    } else {
      await this.stateRepo.save({ user: { id: userId }, pendingAction: action });
    }
  }

  async clearState(userId: number): Promise<void> {
    const existing = await this.stateRepo.findByUserId(userId);
    if (existing) {
      await this.stateRepo.update(existing.id, { pendingAction: null });
    }
  }
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npm run test:unit -- --testPathPattern=user.service
```

Expected: PASS, 7 tests passing.

- [ ] **Step 7: Create `src/user/user.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from './dao/user.entity';
import { UserState } from './dao/user-state.entity';
import { UserRepository } from './repositories/user.repository';
import { UserStateRepository } from './repositories/user-state.repository';
import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramUser, UserState])],
  providers: [UserRepository, UserStateRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
```

- [ ] **Step 8: Commit**

```bash
git add src/user/
git commit -m "feat(user): add repositories, UserService with TDD, and UserModule"
```

---

## Task 4: BotEvent — entity, migration, repository, service (TDD), module

**Files:**
- Create: `src/bot-event/constants/index.ts`
- Create: `src/bot-event/dao/bot-event.entity.ts`
- Create: `src/bot-event/dao/migrations/1749600002000-create-bot-events.ts`
- Create: `src/bot-event/repositories/bot-event.repository.ts`
- Create: `src/bot-event/services/bot-event.service.spec.ts`
- Create: `src/bot-event/services/bot-event.service.ts`
- Create: `src/bot-event/bot-event.module.ts`

- [ ] **Step 1: Create `src/bot-event/constants/index.ts`**

```typescript
export enum BotAction {
  TRIAL_SIGNUP = 'trial_signup',
  VIDEO_MEETING = 'video_meeting',
  FREE_GUIDE = 'free_guide',
  ASK_QUESTION = 'ask_question',
}
```

- [ ] **Step 2: Create `src/bot-event/dao/bot-event.entity.ts`**

```typescript
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';

@Entity('bot_events')
export class BotEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TelegramUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: TelegramUser;

  @Column({ type: 'varchar' })
  action: BotAction;

  @Column({ type: 'text', nullable: true })
  payload: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 3: Create migration `src/bot-event/dao/migrations/1749600002000-create-bot-events.ts`**

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBotEvents1749600002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bot_events',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: false },
          { name: 'action', type: 'varchar', isNullable: false },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'bot_events',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'telegram_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bot_events');
  }
}
```

- [ ] **Step 4: Create `src/bot-event/repositories/bot-event.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';

@Injectable()
export class BotEventRepository {
  constructor(
    @InjectRepository(BotEvent)
    private readonly repo: Repository<BotEvent>,
  ) {}

  async save(data: { user: TelegramUser; action: BotAction; payload?: string | null }): Promise<BotEvent> {
    return this.repo.save({ ...data, payload: data.payload ?? null });
  }
}
```

- [ ] **Step 5: Write failing unit tests `src/bot-event/services/bot-event.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BotEventService } from './bot-event.service';
import { BotEventRepository } from '../repositories/bot-event.repository';
import { BotAction } from '../constants';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotEvent } from '../dao/bot-event.entity';

const mockRepo = {
  save: jest.fn(),
};

describe('BotEventService', () => {
  let service: BotEventService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotEventService,
        { provide: BotEventRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(BotEventService);
  });

  describe('log', () => {
    it('saves a bot event without payload', async () => {
      const user = { id: 1 } as TelegramUser;
      mockRepo.save.mockResolvedValue({ id: 99, action: BotAction.TRIAL_SIGNUP, payload: null } as BotEvent);

      const result = await service.log(user, BotAction.TRIAL_SIGNUP);

      expect(mockRepo.save).toHaveBeenCalledWith({ user, action: BotAction.TRIAL_SIGNUP, payload: null });
      expect(result.action).toBe(BotAction.TRIAL_SIGNUP);
    });

    it('saves a bot event with payload', async () => {
      const user = { id: 1 } as TelegramUser;
      mockRepo.save.mockResolvedValue({ id: 100, action: BotAction.ASK_QUESTION, payload: 'Когда следующий урок?' } as BotEvent);

      const result = await service.log(user, BotAction.ASK_QUESTION, 'Когда следующий урок?');

      expect(mockRepo.save).toHaveBeenCalledWith({ user, action: BotAction.ASK_QUESTION, payload: 'Когда следующий урок?' });
      expect(result.payload).toBe('Когда следующий урок?');
    });
  });
});
```

- [ ] **Step 6: Run tests — expect FAIL**

```bash
npm run test:unit -- --testPathPattern=bot-event.service
```

Expected: FAIL — `Cannot find module './bot-event.service'`

- [ ] **Step 7: Create `src/bot-event/services/bot-event.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { TelegramUser } from '../../user/dao/user.entity';
import { BotAction } from '../constants';
import { BotEvent } from '../dao/bot-event.entity';
import { BotEventRepository } from '../repositories/bot-event.repository';

@Injectable()
export class BotEventService {
  constructor(private readonly repo: BotEventRepository) {}

  async log(user: TelegramUser, action: BotAction, payload: string | null = null): Promise<BotEvent> {
    return this.repo.save({ user, action, payload });
  }
}
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
npm run test:unit -- --testPathPattern=bot-event.service
```

Expected: PASS, 2 tests passing.

- [ ] **Step 9: Create `src/bot-event/bot-event.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from '../user/dao/user.entity';
import { BotEvent } from './dao/bot-event.entity';
import { BotEventRepository } from './repositories/bot-event.repository';
import { BotEventService } from './services/bot-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([BotEvent, TelegramUser])],
  providers: [BotEventRepository, BotEventService],
  exports: [BotEventService],
})
export class BotEventModule {}
```

- [ ] **Step 10: Commit**

```bash
git add src/bot-event/
git commit -m "feat(bot-event): add BotEvent entity, migration, BotEventService with TDD, and BotEventModule"
```

---

## Task 5: Handlebars templates and TemplateService

**Files:**
- Create: `src/telegram/templates/welcome.hbs`
- Create: `src/telegram/templates/confirm-trial.hbs`
- Create: `src/telegram/templates/confirm-video.hbs`
- Create: `src/telegram/templates/ask-question.hbs`
- Create: `src/telegram/templates/question-received.hbs`
- Create: `src/telegram/templates/notify-recipient.hbs`
- Create: `src/telegram/services/template.service.ts`

- [ ] **Step 1: Create `src/telegram/templates/welcome.hbs`**

```handlebars
Привет, {{firstName}}! 👋

Я помогу тебе записаться на занятия с Валерией. Выбери, что тебя интересует:
```

- [ ] **Step 2: Create `src/telegram/templates/confirm-trial.hbs`**

```handlebars
Отлично, {{firstName}}! 🎓

Валерия получила твою заявку на пробный пакет (2 урока) и свяжется с тобой в ближайшее время.
```

- [ ] **Step 3: Create `src/telegram/templates/confirm-video.hbs`**

```handlebars
Хорошо, {{firstName}}! 📅

Валерия получила твою заявку и свяжется с тобой, чтобы выбрать удобное время для видео знакомства.
```

- [ ] **Step 4: Create `src/telegram/templates/ask-question.hbs`**

```handlebars
Напишите ваш вопрос, и я передам его Валерии ✍️
```

- [ ] **Step 5: Create `src/telegram/templates/question-received.hbs`**

```handlebars
Спасибо, {{firstName}}! 💬

Ваш вопрос передан Валерии. Она ответит в ближайшее время.
```

- [ ] **Step 6: Create `src/telegram/templates/notify-recipient.hbs`**

```handlebars
📩 Новое действие от пользователя:

Имя: {{firstName}}{{#if lastName}} {{lastName}}{{/if}}
{{#if username}}Username: @{{username}}
{{/if}}Telegram ID: {{telegramId}}

Действие: {{actionLabel}}{{#if payload}}

Вопрос: {{payload}}{{/if}}
```

- [ ] **Step 7: Create `src/telegram/services/template.service.ts`**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly cache = new Map<string, Handlebars.TemplateDelegate>();

  render(templateName: string, context: Record<string, unknown> = {}): string {
    if (!this.cache.has(templateName)) {
      const filePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
      const source = fs.readFileSync(filePath, 'utf-8');
      this.cache.set(templateName, Handlebars.compile(source));
    }
    return this.cache.get(templateName)!(context);
  }
}
```

> Note: `__dirname` in compiled output (`dist/telegram/services/`) makes `path.join(__dirname, '..', 'templates')` resolve to `dist/telegram/templates/`. The `nest-cli.json` assets config copies `.hbs` files there on build.

- [ ] **Step 8: Commit**

```bash
git add src/telegram/templates/ src/telegram/services/template.service.ts
git commit -m "feat(telegram): add Handlebars templates and TemplateService"
```

---

## Task 6: Telegram constants, HandlersService (TDD), TelegramService, module

**Files:**
- Create: `src/telegram/constants/index.ts`
- Create: `src/telegram/services/handlers.service.spec.ts`
- Create: `src/telegram/services/handlers.service.ts`
- Create: `src/telegram/services/telegram.service.ts`
- Create: `src/telegram/telegram.module.ts`

- [ ] **Step 1: Create `src/telegram/constants/index.ts`**

```typescript
export enum CallbackData {
  TRIAL_SIGNUP = 'trial_signup',
  VIDEO_MEETING = 'video_meeting',
  FREE_GUIDE = 'free_guide',
  ASK_QUESTION = 'ask_question',
}

export const ACTION_LABELS: Record<CallbackData, string> = {
  [CallbackData.TRIAL_SIGNUP]: 'Запись на пробный пакет (2 урока)',
  [CallbackData.VIDEO_MEETING]: 'Выбор времени для видео знакомства',
  [CallbackData.FREE_GUIDE]: 'Запрос бесплатного гайда',
  [CallbackData.ASK_QUESTION]: 'Вопрос Валерии',
};
```

- [ ] **Step 2: Write failing unit tests `src/telegram/services/handlers.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HandlersService } from './handlers.service';
import { UserService } from '../../user/services/user.service';
import { BotEventService } from '../../bot-event/services/bot-event.service';
import { TemplateService } from './template.service';
import { BotAction } from '../../bot-event/constants';
import { PendingAction } from '../../user/constants';
import { TelegramUser } from '../../user/dao/user.entity';
import { CallbackData } from '../constants';

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
  render: jest.fn().mockReturnValue('rendered text'),
};

const mockConfig = {
  getOrThrow: jest.fn().mockReturnValue('123456789'),
};

const mockCtx = {
  from: { id: 100, first_name: 'Test', last_name: null, username: 'testuser', is_bot: false },
  reply: jest.fn().mockResolvedValue({}),
  replyWithDocument: jest.fn().mockResolvedValue({}),
  answerCallbackQuery: jest.fn().mockResolvedValue({}),
  message: { text: 'My question' },
  api: { sendMessage: jest.fn().mockResolvedValue({}) },
};

describe('HandlersService', () => {
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

  const user = { id: 1, telegramId: 100, firstName: 'Test', lastName: null, username: 'testuser' } as TelegramUser;

  describe('handleStart', () => {
    it('upserts user and sends welcome message with keyboard', async () => {
      mockUserService.upsert.mockResolvedValue(user);

      await service.handleStart(mockCtx as any);

      expect(mockUserService.upsert).toHaveBeenCalledWith(mockCtx.from);
      expect(mockTemplateService.render).toHaveBeenCalledWith('welcome', { firstName: 'Test' });
      expect(mockCtx.reply).toHaveBeenCalledWith('rendered text', expect.objectContaining({ reply_markup: expect.anything() }));
    });
  });

  describe('handleTrialSignup', () => {
    it('logs event, notifies recipient, and confirms to user', async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleTrialSignup(mockCtx as any);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(user, BotAction.TRIAL_SIGNUP);
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith('123456789', 'rendered text');
      expect(mockCtx.reply).toHaveBeenCalledWith('rendered text');
    });
  });

  describe('handleVideoMeeting', () => {
    it('logs event, notifies recipient, and confirms to user', async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleVideoMeeting(mockCtx as any);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(user, BotAction.VIDEO_MEETING);
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith('123456789', 'rendered text');
      expect(mockCtx.reply).toHaveBeenCalledWith('rendered text');
    });
  });

  describe('handleFreeGuide', () => {
    it('logs event and sends PDF document', async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleFreeGuide(mockCtx as any);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockBotEventService.log).toHaveBeenCalledWith(user, BotAction.FREE_GUIDE);
      expect(mockCtx.replyWithDocument).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('handleAskQuestion', () => {
    it('sets pending state and prompts user', async () => {
      mockUserService.upsert.mockResolvedValue(user);

      await service.handleAskQuestion(mockCtx as any);

      expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
      expect(mockUserService.setState).toHaveBeenCalledWith(1, PendingAction.AWAITING_QUESTION);
      expect(mockCtx.reply).toHaveBeenCalledWith('rendered text');
    });
  });

  describe('handleTextMessage', () => {
    it('ignores message when no pending state', async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockUserService.getState.mockResolvedValue(null);

      await service.handleTextMessage(mockCtx as any);

      expect(mockBotEventService.log).not.toHaveBeenCalled();
    });

    it('forwards question to recipient when awaiting_question state', async () => {
      mockUserService.upsert.mockResolvedValue(user);
      mockUserService.getState.mockResolvedValue(PendingAction.AWAITING_QUESTION);
      mockBotEventService.log.mockResolvedValue({});

      await service.handleTextMessage(mockCtx as any);

      expect(mockBotEventService.log).toHaveBeenCalledWith(user, BotAction.ASK_QUESTION, 'My question');
      expect(mockUserService.clearState).toHaveBeenCalledWith(1);
      expect(mockCtx.api.sendMessage).toHaveBeenCalledWith('123456789', 'rendered text');
      expect(mockCtx.reply).toHaveBeenCalledWith('rendered text');
    });
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm run test:unit -- --testPathPattern=handlers.service
```

Expected: FAIL — `Cannot find module './handlers.service'`

- [ ] **Step 4: Create `src/telegram/services/handlers.service.ts`**

```typescript
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context, InlineKeyboard, InputFile } from 'grammy';
import { AppConfig } from '../../../_common/types';
import { BotAction } from '../../bot-event/constants';
import { BotEventService } from '../../bot-event/services/bot-event.service';
import { PendingAction } from '../../user/constants';
import { TelegramUser } from '../../user/dao/user.entity';
import { UserService } from '../../user/services/user.service';
import { ACTION_LABELS, CallbackData } from '../constants';
import { TemplateService } from './template.service';

@Injectable()
export class HandlersService {
  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly userService: UserService,
    private readonly botEventService: BotEventService,
    private readonly templateService: TemplateService,
  ) {}

  register(bot: Bot): void {
    bot.command('start', (ctx) => this.handleStart(ctx));
    bot.callbackQuery(CallbackData.TRIAL_SIGNUP, (ctx) => this.handleTrialSignup(ctx));
    bot.callbackQuery(CallbackData.VIDEO_MEETING, (ctx) => this.handleVideoMeeting(ctx));
    bot.callbackQuery(CallbackData.FREE_GUIDE, (ctx) => this.handleFreeGuide(ctx));
    bot.callbackQuery(CallbackData.ASK_QUESTION, (ctx) => this.handleAskQuestion(ctx));
    bot.on('message:text', (ctx) => this.handleTextMessage(ctx));
  }

  async handleStart(ctx: Context): Promise<void> {
    const user = await this.userService.upsert(ctx.from!);
    const keyboard = new InlineKeyboard()
      .text('Записаться на пробный пакет (2 урока)', CallbackData.TRIAL_SIGNUP).row()
      .text('Выбрать удобное время для видео знакомства', CallbackData.VIDEO_MEETING).row()
      .text('Забрать бесплатный гайд', CallbackData.FREE_GUIDE).row()
      .text('Задать вопросы Валерии', CallbackData.ASK_QUESTION);
    await ctx.reply(
      this.templateService.render('welcome', { firstName: user.firstName }),
      { reply_markup: keyboard },
    );
  }

  async handleTrialSignup(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.TRIAL_SIGNUP);
    await this.notifyRecipient(ctx, user, CallbackData.TRIAL_SIGNUP);
    await ctx.reply(this.templateService.render('confirm-trial', { firstName: user.firstName }));
  }

  async handleVideoMeeting(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.VIDEO_MEETING);
    await this.notifyRecipient(ctx, user, CallbackData.VIDEO_MEETING);
    await ctx.reply(this.templateService.render('confirm-video', { firstName: user.firstName }));
  }

  async handleFreeGuide(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.botEventService.log(user, BotAction.FREE_GUIDE);
    const pdfPath = path.join(process.cwd(), 'assets', 'cv.pdf');
    await ctx.replyWithDocument(new InputFile(pdfPath));
  }

  async handleAskQuestion(ctx: Context): Promise<void> {
    await ctx.answerCallbackQuery();
    const user = await this.userService.upsert(ctx.from!);
    await this.userService.setState(user.id, PendingAction.AWAITING_QUESTION);
    await ctx.reply(this.templateService.render('ask-question', {}));
  }

  async handleTextMessage(ctx: Context): Promise<void> {
    const user = await this.userService.upsert(ctx.from!);
    const state = await this.userService.getState(user.id);

    if (state !== PendingAction.AWAITING_QUESTION) {
      return;
    }

    const question = ctx.message?.text ?? '';
    await this.botEventService.log(user, BotAction.ASK_QUESTION, question);
    await this.userService.clearState(user.id);
    await this.notifyRecipient(ctx, user, CallbackData.ASK_QUESTION, question);
    await ctx.reply(this.templateService.render('question-received', { firstName: user.firstName }));
  }

  private async notifyRecipient(
    ctx: Context,
    user: TelegramUser,
    action: CallbackData,
    payload?: string,
  ): Promise<void> {
    const recipientId = this.config.getOrThrow<string>('recipient');
    const text = this.templateService.render('notify-recipient', {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telegramId: user.telegramId,
      actionLabel: ACTION_LABELS[action],
      payload,
    });
    await ctx.api.sendMessage(recipientId, text);
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm run test:unit -- --testPathPattern=handlers.service
```

Expected: PASS, 6 tests passing.

- [ ] **Step 6: Create `src/telegram/services/telegram.service.ts`**

```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { AppConfig } from '../../../_common/types';
import { HandlersService } from './handlers.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  bot: Bot;

  constructor(
    private readonly config: ConfigService<AppConfig>,
    private readonly handlers: HandlersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const token = this.config.getOrThrow<string>('telegramBotToken');
    this.bot = new Bot(token);
    this.handlers.register(this.bot);
    void this.bot.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.bot.stop();
  }
}
```

- [ ] **Step 7: Create `src/telegram/telegram.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { BotEventModule } from '../bot-event/bot-event.module';
import { UserModule } from '../user/user.module';
import { HandlersService } from './services/handlers.service';
import { TemplateService } from './services/template.service';
import { TelegramService } from './services/telegram.service';

@Module({
  imports: [UserModule, BotEventModule],
  providers: [TelegramService, HandlersService, TemplateService],
})
export class TelegramModule {}
```

- [ ] **Step 8: Run all unit tests**

```bash
npm run test:unit
```

Expected: PASS, all tests passing.

- [ ] **Step 9: Commit**

```bash
git add src/telegram/
git commit -m "feat(telegram): add TelegramService, HandlersService with TDD, and TelegramModule"
```

---

## Task 7: App bootstrap

**Files:**
- Create: `src/main.ts`
- Create: `src/app.module.ts`

- [ ] **Step 1: Create `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../_common/app/config';
import typeOrmModule from '../_common/app/app-modules/type-orm';
import { BotEventModule } from './bot-event/bot-event.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    typeOrmModule,
    UserModule,
    BotEventModule,
    TelegramModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Create `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  await NestFactory.createApplicationContext(AppModule);
}

void bootstrap();
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: `dist/` built without errors. `dist/telegram/templates/*.hbs` files present (copied by nest-cli assets).

```bash
ls dist/telegram/templates/
```

Expected: `welcome.hbs  confirm-trial.hbs  confirm-video.hbs  ask-question.hbs  question-received.hbs  notify-recipient.hbs`

- [ ] **Step 4: Commit**

```bash
git add src/main.ts src/app.module.ts
git commit -m "feat: add AppModule and main.ts bootstrap"
```

---

## Task 8: e2e tests

**Files:**
- Create: `src/tests/bot-flow.e2e.spec.ts`

> **ВАЖНО:** e2e тесты запускаются **только** через `npm run docker:test`. Никогда не запускать `npm run test:e2e` напрямую на локальной машине — это очистит таблицы dev-базы.

The e2e tests use `bot.handleUpdate()` from grammY to simulate incoming updates without a real Telegram connection. Outgoing API calls are intercepted by a grammY API transformer that prevents real HTTP requests.

- [ ] **Step 1: Create `src/tests/bot-flow.e2e.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Bot } from 'grammy';
import type { Update, UserFromGetMe } from '@grammyjs/types';
import { clearTables } from '../../_common/utils/tests/clear-tables';
import { getTestingModuleImports } from '../../_common/utils/tests/get-testing-module-imports';
import { getRepository } from '../../_common/utils/tests/get-repository';
import { BotEventModule } from '../bot-event/bot-event.module';
import { BotAction } from '../bot-event/constants';
import { BotEvent } from '../bot-event/dao/bot-event.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { TelegramService } from '../telegram/services/telegram.service';
import { UserModule } from '../user/user.module';
import { PendingAction } from '../user/constants';
import { TelegramUser } from '../user/dao/user.entity';
import { UserState } from '../user/dao/user-state.entity';
import { Repository } from 'typeorm';

// Builds a fake /start update for a given Telegram user
function makeStartUpdate(userId: number, firstName: string, username?: string): Update {
  return {
    update_id: userId,
    message: {
      message_id: 1,
      from: { id: userId, is_bot: false, first_name: firstName, username },
      chat: { id: userId, type: 'private', first_name: firstName },
      date: Math.floor(Date.now() / 1000),
      text: '/start',
      entities: [{ offset: 0, length: 6, type: 'bot_command' }],
    },
  };
}

// Builds a fake callback query update (inline button press)
function makeCallbackUpdate(userId: number, firstName: string, callbackData: string): Update {
  return {
    update_id: userId + 100,
    callback_query: {
      id: `cq_${userId}`,
      from: { id: userId, is_bot: false, first_name: firstName },
      message: {
        message_id: 2,
        chat: { id: userId, type: 'private', first_name: firstName },
        date: Math.floor(Date.now() / 1000),
        text: 'Welcome',
      },
      chat_instance: 'test',
      data: callbackData,
    },
  };
}

// Builds a fake text message update
function makeTextUpdate(userId: number, firstName: string, text: string): Update {
  return {
    update_id: userId + 200,
    message: {
      message_id: 3,
      from: { id: userId, is_bot: false, first_name: firstName },
      chat: { id: userId, type: 'private', first_name: firstName },
      date: Math.floor(Date.now() / 1000),
      text,
    },
  };
}

// Installs a mock transformer on a grammY Bot that intercepts ALL outgoing API calls
function mockBotApi(bot: Bot): jest.Mock {
  const apiCallMock = jest.fn();
  bot.api.config.use(async (prev, method, payload, signal) => {
    apiCallMock(method, payload);
    const fakeMe: UserFromGetMe = { id: 1, is_bot: true, first_name: 'TestBot', username: 'test_bot', can_join_groups: false, can_read_all_group_messages: false, supports_inline_queries: false };
    if (method === 'getMe') return { ok: true, result: fakeMe } as any;
    if (method === 'sendDocument') return { ok: true, result: { message_id: 10, chat: { id: 1, type: 'private' }, date: 0 } } as any;
    if (method === 'sendMessage') return { ok: true, result: { message_id: 11, chat: { id: 1, type: 'private' }, date: 0 } } as any;
    if (method === 'answerCallbackQuery') return { ok: true, result: true } as any;
    return { ok: true, result: true } as any;
  });
  return apiCallMock;
}

describe('Bot flow (e2e)', () => {
  let moduleFixture: TestingModule;
  let telegramService: TelegramService;
  let userRepo: Repository<TelegramUser>;
  let stateRepo: Repository<UserState>;
  let botEventRepo: Repository<BotEvent>;
  let apiCallMock: jest.Mock;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([TelegramUser, UserState, BotEvent]),
        UserModule,
        BotEventModule,
        TelegramModule,
      ],
    }).compile();

    // Init app WITHOUT starting polling — we call bot.init() manually for getMe
    // and add a mock transformer before any real HTTP calls are made
    telegramService = moduleFixture.get(TelegramService);

    // Override onModuleInit to skip polling start, install mock transformer
    const token = process.env.TELEGRAM_BOT_TOKEN ?? 'test_token';
    telegramService.bot = new Bot(token);
    apiCallMock = mockBotApi(telegramService.bot);
    await telegramService.bot.init();  // calls getMe (intercepted by mock)

    const { HandlersService } = await import('../telegram/services/handlers.service');
    const handlers = moduleFixture.get(HandlersService);
    handlers.register(telegramService.bot);

    userRepo = getRepository<TelegramUser>(moduleFixture, TelegramUser);
    stateRepo = getRepository<UserState>(moduleFixture, UserState);
    botEventRepo = getRepository<BotEvent>(moduleFixture, BotEvent);
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  describe('/start', () => {
    it('creates a new user on first /start', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(111, 'Anna', 'anna_test'));

      const user = await userRepo.findOne({ where: { telegramId: 111 } });
      expect(user).not.toBeNull();
      expect(user!.firstName).toBe('Anna');
      expect(user!.username).toBe('anna_test');
    });

    it('updates existing user on second /start (no duplicate)', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(222, 'OldName'));
      await telegramService.bot.handleUpdate(makeStartUpdate(222, 'NewName', 'new_handle'));

      const users = await userRepo.find({ where: { telegramId: 222 } });
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe('NewName');
      expect(users[0].username).toBe('new_handle');
    });
  });

  describe('Button: Записаться на пробный пакет', () => {
    it('creates trial_signup event', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(333, 'Boris'));
      await telegramService.bot.handleUpdate(makeCallbackUpdate(333, 'Boris', 'trial_signup'));

      const events = await botEventRepo.find({ where: { action: BotAction.TRIAL_SIGNUP } });
      expect(events).toHaveLength(1);
      expect(events[0].payload).toBeNull();
    });
  });

  describe('Button: Выбрать время для видео знакомства', () => {
    it('creates video_meeting event', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(444, 'Carla'));
      await telegramService.bot.handleUpdate(makeCallbackUpdate(444, 'Carla', 'video_meeting'));

      const events = await botEventRepo.find({ where: { action: BotAction.VIDEO_MEETING } });
      expect(events).toHaveLength(1);
    });
  });

  describe('Button: Забрать бесплатный гайд', () => {
    it('creates free_guide event', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(555, 'Dana'));
      await telegramService.bot.handleUpdate(makeCallbackUpdate(555, 'Dana', 'free_guide'));

      const events = await botEventRepo.find({ where: { action: BotAction.FREE_GUIDE } });
      expect(events).toHaveLength(1);
    });
  });

  describe('Button: Задать вопрос → follow-up message', () => {
    it('sets UserState to awaiting_question after button press', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(666, 'Eve'));
      await telegramService.bot.handleUpdate(makeCallbackUpdate(666, 'Eve', 'ask_question'));

      const user = await userRepo.findOne({ where: { telegramId: 666 } });
      const state = await stateRepo.findOne({ where: { user: { id: user!.id } } });
      expect(state?.pendingAction).toBe(PendingAction.AWAITING_QUESTION);
    });

    it('creates ask_question event with payload and clears state after reply', async () => {
      await telegramService.bot.handleUpdate(makeStartUpdate(777, 'Frank'));
      await telegramService.bot.handleUpdate(makeCallbackUpdate(777, 'Frank', 'ask_question'));
      await telegramService.bot.handleUpdate(makeTextUpdate(777, 'Frank', 'Когда следующий урок?'));

      const events = await botEventRepo.find({ where: { action: BotAction.ASK_QUESTION } });
      expect(events).toHaveLength(1);
      expect(events[0].payload).toBe('Когда следующий урок?');

      const user = await userRepo.findOne({ where: { telegramId: 777 } });
      const state = await stateRepo.findOne({ where: { user: { id: user!.id } } });
      expect(state?.pendingAction).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run e2e tests via docker**

```bash
npm run docker:test
```

Expected: All e2e tests PASS. Check logs for migration output and test results.

- [ ] **Step 3: Commit**

```bash
git add src/tests/
git commit -m "test: add e2e tests for bot flow"
```

---

## Checklist: spec coverage

| Spec requirement | Task |
|---|---|
| TelegramUser entity | Task 2 |
| UserState entity | Task 2 |
| BotEvent entity | Task 4 |
| Migrations for all 3 tables | Tasks 2, 4 |
| `/start` → upsert user + welcome + keyboard | Task 6 |
| Button 1 → log + notify RECIPIENT + confirm | Task 6 |
| Button 2 → log + notify RECIPIENT + confirm | Task 6 |
| Button 3 → log + send PDF | Task 6 |
| Button 4 → set state → collect question → log + notify + clear state | Task 6 |
| Handlebars templates | Task 5 |
| grammY long polling lifecycle | Task 6 |
| App bootstrap without HTTP | Task 7 |
| Unit tests: UserService | Task 3 |
| Unit tests: BotEventService | Task 4 |
| Unit tests: HandlersService | Task 6 |
| e2e tests via docker-compose | Task 8 |
| TELEGRAM_BOT_TOKEN config | Task 1 |
| AppConfig type fix | Task 1 |
