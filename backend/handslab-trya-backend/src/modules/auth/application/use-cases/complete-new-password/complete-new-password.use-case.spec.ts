import { Test, TestingModule } from '@nestjs/testing';
import { CompleteNewPasswordUseCase } from './complete-new-password.use-case';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { CompleteNewPasswordDto } from './complete-new-password.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';
import { AuthTokens } from '../../../domain/value-objects/auth-tokens.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

describe('CompleteNewPasswordUseCase', () => {
  let useCase: CompleteNewPasswordUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;
  let otpRepository: jest.Mocked<IOtpRepository>;

  // Mock data
  const mockTokens = new AuthTokens(
    'mock-access-token',
    'mock-refresh-token',
    'mock-id-token',
    3600,
  );

  const mockUser = new User(
    'user-id-123',
    'test@example.com',
    'Test User',
    UserRole.DOCTOR,
    'tenant-123',
    true,
    new Date(),
    new Date(),
  );

  const validCompletePasswordDto: CompleteNewPasswordDto = {
    email: 'test@example.com',
    newPassword: 'NewPassword123!',
    session: 'mock-session-token',
    otpCode: '123456',
  };

  beforeEach(async () => {
    // Create mock repositories
    const mockAuthRepository: jest.Mocked<IAuthRepository> = {
      signIn: jest.fn(),
      completeNewPasswordChallenge: jest.fn(),
      refreshToken: jest.fn(),
      signOut: jest.fn(),
      getUserInfo: jest.fn(),
      verifyToken: jest.fn(),
    };

    const mockOtpRepository: jest.Mocked<IOtpRepository> = {
      generateOtp: jest.fn(),
      storeOtp: jest.fn(),
      validateOtp: jest.fn(),
      removeOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteNewPasswordUseCase,
        {
          provide: AUTH_REPOSITORY_TOKEN,
          useValue: mockAuthRepository,
        },
        {
          provide: OTP_REPOSITORY_TOKEN,
          useValue: mockOtpRepository,
        },
      ],
    }).compile();

    useCase = module.get<CompleteNewPasswordUseCase>(
      CompleteNewPasswordUseCase,
    );
    authRepository = module.get(AUTH_REPOSITORY_TOKEN);
    otpRepository = module.get(OTP_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully complete new password with valid OTP', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      const result = await useCase.execute(validCompletePasswordDto);

      // Assert
      expect(otpRepository.validateOtp).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
      );
      expect(authRepository.completeNewPasswordChallenge).toHaveBeenCalledWith(
        'test@example.com',
        'NewPassword123!',
        'mock-session-token',
      );
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should successfully complete new password with tenantId validation', async () => {
      // Arrange
      const dtoWithTenant: CompleteNewPasswordDto = {
        ...validCompletePasswordDto,
        tenantId: 'tenant-123',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      const result = await useCase.execute(dtoWithTenant);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should throw InvalidOtpError when OTP is invalid', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(validCompletePasswordDto)).rejects.toThrow(
        InvalidOtpError,
      );
      expect(otpRepository.validateOtp).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
      );
      expect(
        authRepository.completeNewPasswordChallenge,
      ).not.toHaveBeenCalled();
    });

    it('should throw InvalidOtpError when OTP is expired', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(validCompletePasswordDto)).rejects.toThrow(
        InvalidOtpError,
      );
      expect(
        authRepository.completeNewPasswordChallenge,
      ).not.toHaveBeenCalled();
    });

    it('should throw error when user does not belong to specified tenant', async () => {
      // Arrange
      const dtoWithDifferentTenant: CompleteNewPasswordDto = {
        ...validCompletePasswordDto,
        tenantId: 'different-tenant',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser, // mockUser has tenantId: 'tenant-123'
      });

      // Act & Assert
      await expect(useCase.execute(dtoWithDifferentTenant)).rejects.toThrow(
        'Usuário não pertence ao tenant especificado',
      );
    });

    it('should validate OTP before calling auth repository', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(validCompletePasswordDto)).rejects.toThrow(
        InvalidOtpError,
      );

      // Verify OTP validation was called first
      expect(otpRepository.validateOtp).toHaveBeenCalledTimes(1);
      // Verify auth repository was never called
      expect(
        authRepository.completeNewPasswordChallenge,
      ).not.toHaveBeenCalled();
    });

    it('should handle different OTP codes', async () => {
      // Arrange
      const dtoWithDifferentOtp: CompleteNewPasswordDto = {
        ...validCompletePasswordDto,
        otpCode: '654321',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      await useCase.execute(dtoWithDifferentOtp);

      // Assert
      expect(otpRepository.validateOtp).toHaveBeenCalledWith(
        'test@example.com',
        '654321',
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(true);
      const repositoryError = new Error('Cognito service unavailable');
      authRepository.completeNewPasswordChallenge.mockRejectedValue(
        repositoryError,
      );

      // Act & Assert
      await expect(useCase.execute(validCompletePasswordDto)).rejects.toThrow(
        'Cognito service unavailable',
      );
    });

    it('should return correct response structure', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      const result = await useCase.execute(validCompletePasswordDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).not.toHaveProperty('idToken'); // idToken should not be in response
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should normalize email when validating OTP', async () => {
      // Arrange
      const dtoWithUnnormalizedEmail: CompleteNewPasswordDto = {
        ...validCompletePasswordDto,
        email: '  TEST@EXAMPLE.COM  ',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      await useCase.execute(dtoWithUnnormalizedEmail);

      // Assert
      // The email should be passed as-is to validateOtp (normalization is done in OTP repository)
      expect(otpRepository.validateOtp).toHaveBeenCalledWith(
        '  TEST@EXAMPLE.COM  ',
        '123456',
      );
    });

    it('should work without tenantId in DTO', async () => {
      // Arrange
      const dtoWithoutTenant: CompleteNewPasswordDto = {
        email: 'test@example.com',
        newPassword: 'NewPassword123!',
        session: 'mock-session-token',
        otpCode: '123456',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      const result = await useCase.execute(dtoWithoutTenant);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockTokens.accessToken);
    });

    it('should throw InvalidOtpError with correct error structure', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(false);

      // Act & Assert
      try {
        await useCase.execute(validCompletePasswordDto);
        fail('Should have thrown InvalidOtpError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidOtpError);
        expect(error.getResponse()).toEqual({
          statusCode: 400,
          message: 'Código OTP inválido ou expirado',
          error: 'INVALID_OTP',
        });
      }
    });

    it('should handle user with empty tenantId', async () => {
      // Arrange
      const userWithoutTenant = new User(
        'user-id-456',
        'test@example.com',
        'Test User',
        UserRole.DOCTOR,
        '', // empty tenantId
        true,
        new Date(),
        new Date(),
      );

      const dtoWithTenant: CompleteNewPasswordDto = {
        ...validCompletePasswordDto,
        tenantId: 'tenant-123',
      };

      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: userWithoutTenant,
      });

      // Act & Assert
      await expect(useCase.execute(dtoWithTenant)).rejects.toThrow(
        'Usuário não pertence ao tenant especificado',
      );
    });

    it('should call validateOtp exactly once', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      await useCase.execute(validCompletePasswordDto);

      // Assert
      expect(otpRepository.validateOtp).toHaveBeenCalledTimes(1);
    });

    it('should call completeNewPasswordChallenge exactly once when OTP is valid', async () => {
      // Arrange
      otpRepository.validateOtp.mockResolvedValue(true);
      authRepository.completeNewPasswordChallenge.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      // Act
      await useCase.execute(validCompletePasswordDto);

      // Assert
      expect(authRepository.completeNewPasswordChallenge).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
