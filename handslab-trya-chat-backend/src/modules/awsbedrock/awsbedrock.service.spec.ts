import { Test, TestingModule } from '@nestjs/testing';
import { AwsbedrockService } from './awsbedrock.service';

describe('AwsbedrockService', () => {
  let service: AwsbedrockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsbedrockService],
    }).compile();

    service = module.get<AwsbedrockService>(AwsbedrockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
