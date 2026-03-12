import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { NewMessageDto } from './dto/new-message.dto';
import { AwsbedrockService } from '@modules/awsbedrock/awsbedrock.service';

describe('ChatController', () => {
  let controller: ChatController;
  const mockChatService = {
    chat: jest.fn().mockImplementation((newMessage: NewMessageDto) => {
      return {
        model: newMessage.model,
        answer: 'Hello',
      };
    }),
  };

  const mockAwsbedrockService = {
    invoke: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService }, 
        { provide: AwsbedrockService, useValue: mockAwsbedrockService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the answer form the AI', () => {
    const message: NewMessageDto = {
      message: 'Hello',
      model: 'amazon.titan-text-lite-v1',
    };

    const expectedOutput = {
      model: message.model,
      answer: 'Hello',
    };

    expect(controller.chat(message));
    expect(mockChatService.chat).toHaveBeenCalledWith(message);
    expect(mockChatService.chat).toHaveBeenCalledTimes(1);
    expect(mockChatService.chat).toHaveReturnedWith(expectedOutput);
    
  });
});
