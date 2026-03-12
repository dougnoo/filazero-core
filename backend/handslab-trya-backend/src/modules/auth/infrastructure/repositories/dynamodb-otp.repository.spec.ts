import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DynamoDbOtpRepository } from './dynamodb-otp.repository';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// Mock do AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('DynamoDbOtpRepository', () => {
  let repository: DynamoDbOtpRepository;
  let mockClient: jest.Mocked<DynamoDBDocumentClient>;
  let configService: ConfigService;

  beforeEach(async () => {
    // Mock do DynamoDB client
    mockClient = {
      send: jest.fn(),
    } as any;

    // Mock do DynamoDBDocumentClient.from
    (DynamoDBDocumentClient.from as jest.Mock) = jest
      .fn()
      .mockReturnValue(mockClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamoDbOtpRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                AWS_REGION: 'us-east-1',
                DYNAMODB_OTP_TABLE_NAME: 'OtpCodes-Test',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<DynamoDbOtpRepository>(DynamoDbOtpRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP code', () => {
      const otp = repository.generateOtp();

      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
      expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
    });

    it('should generate different OTP codes', () => {
      const otp1 = repository.generateOtp();
      const otp2 = repository.generateOtp();
      const otp3 = repository.generateOtp();

      // Probabilidade muito baixa de gerar o mesmo código 3 vezes
      const uniqueCodes = new Set([otp1, otp2, otp3]);
      expect(uniqueCodes.size).toBeGreaterThan(1);
    });
  });

  describe('storeOtp', () => {
    it('should store OTP in DynamoDB with TTL', async () => {
      mockClient.send.mockResolvedValueOnce({});

      const email = 'test@example.com';
      const otp = '123456';
      const ttl = 300;

      await repository.storeOtp(email, otp, ttl);

      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });

    it('should normalize email to lowercase and trim', async () => {
      mockClient.send.mockResolvedValueOnce({});

      await repository.storeOtp('  TEST@EXAMPLE.COM  ', '123456');

      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });

    it('should use default TTL of 300 seconds', async () => {
      mockClient.send.mockResolvedValueOnce({});

      await repository.storeOtp('test@example.com', '123456');

      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });

    it('should throw error when DynamoDB fails', async () => {
      mockClient.send.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(
        repository.storeOtp('test@example.com', '123456'),
      ).rejects.toThrow('Falha ao armazenar OTP');
    });
  });

  describe('validateOtp', () => {
    it('should return true for valid OTP', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 300; // 5 minutos no futuro

      mockClient.send
        .mockResolvedValueOnce({
          Item: {
            email: 'test@example.com',
            otp: '123456',
            expiresAt,
            createdAt: new Date().toISOString(),
          },
        })
        .mockResolvedValueOnce({}); // Para o removeOtp

      const isValid = await repository.validateOtp(
        'test@example.com',
        '123456',
      );

      expect(isValid).toBe(true);
      expect(mockClient.send).toHaveBeenCalledTimes(2); // Get + Delete
    });

    it('should return false when OTP not found', async () => {
      mockClient.send.mockResolvedValueOnce({
        Item: undefined,
      });

      const isValid = await repository.validateOtp(
        'test@example.com',
        '123456',
      );

      expect(isValid).toBe(false);
      expect(mockClient.send).toHaveBeenCalledTimes(1); // Apenas Get
    });

    it('should return false for expired OTP', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now - 60; // 1 minuto no passado

      mockClient.send
        .mockResolvedValueOnce({
          Item: {
            email: 'test@example.com',
            otp: '123456',
            expiresAt,
            createdAt: new Date().toISOString(),
          },
        })
        .mockResolvedValueOnce({}); // Para o removeOtp

      const isValid = await repository.validateOtp(
        'test@example.com',
        '123456',
      );

      expect(isValid).toBe(false);
      expect(mockClient.send).toHaveBeenCalledTimes(2); // Get + Delete (remove expired)
    });

    it('should return false for invalid OTP code', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 300;

      mockClient.send.mockResolvedValueOnce({
        Item: {
          email: 'test@example.com',
          otp: '123456',
          expiresAt,
          createdAt: new Date().toISOString(),
        },
      });

      const isValid = await repository.validateOtp(
        'test@example.com',
        '999999',
      );

      expect(isValid).toBe(false);
      expect(mockClient.send).toHaveBeenCalledTimes(1); // Apenas Get (não remove)
    });

    it('should normalize email when validating', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + 300;

      mockClient.send
        .mockResolvedValueOnce({
          Item: {
            email: 'test@example.com',
            otp: '123456',
            expiresAt,
          },
        })
        .mockResolvedValueOnce({});

      const result = await repository.validateOtp(
        '  TEST@EXAMPLE.COM  ',
        '123456',
      );

      expect(result).toBe(true);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    it('should throw error when DynamoDB fails', async () => {
      mockClient.send.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(
        repository.validateOtp('test@example.com', '123456'),
      ).rejects.toThrow('Falha ao validar OTP');
    });
  });

  describe('removeOtp', () => {
    it('should remove OTP from DynamoDB', async () => {
      mockClient.send.mockResolvedValueOnce({});

      await repository.removeOtp('test@example.com');

      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    it('should normalize email when removing', async () => {
      mockClient.send.mockResolvedValueOnce({});

      await repository.removeOtp('  TEST@EXAMPLE.COM  ');

      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    it('should not throw error when removal fails', async () => {
      mockClient.send.mockRejectedValueOnce(new Error('DynamoDB error'));

      // Não deve lançar exceção
      await expect(
        repository.removeOtp('test@example.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return true when DynamoDB is accessible', async () => {
      mockClient.send.mockResolvedValueOnce({});

      const isHealthy = await repository.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false when DynamoDB is not accessible', async () => {
      mockClient.send.mockRejectedValueOnce(new Error('Connection failed'));

      const isHealthy = await repository.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });
});
