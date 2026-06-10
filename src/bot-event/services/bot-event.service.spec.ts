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
