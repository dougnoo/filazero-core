import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { NewMessageDto } from './dto/new-message.dto';
import { AwsbedrockService } from '@modules/awsbedrock/awsbedrock.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockChatService = {
    chat: jest.fn().mockImplementation((newMessage: NewMessageDto) => {
      return {
        model: newMessage.model,
        answer: 'Hello',
      };
    }),
  };

  const mockAwsbedrockService = {
    invoke: jest.fn().mockImplementation(() => {
      return {
        model: 'amazon.titan-text-lite-v1',
        answer: 'Hello',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ChatService, useValue: mockChatService }, { provide: AwsbedrockService, useValue: mockAwsbedrockService }],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the answer form the AI', () => {
    const message: NewMessageDto = {
      message: 'Hello',
      model: 'amazon.titan-text-lite-v1',
    };

    expect(service.chat(message)).toStrictEqual({
      model: message.model,
      answer: expect.any(String)
    });
  });
});
