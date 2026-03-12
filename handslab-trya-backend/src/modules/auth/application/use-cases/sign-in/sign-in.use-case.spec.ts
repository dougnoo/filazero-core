import { Test, TestingModule } from '@nestjs/testing';
import { SignInUseCase } from './sign-in.use-case';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import { NewPasswordRequiredError } from '../../../domain/errors/new-password-required.error';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error';
import { SignInDto } from './sign-in.dto';
import { AuthTokens } from '../../../domain/value-objects/auth-tokens.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let userMapper: UserMapper;

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

  const validSignInDto: SignInDto = {
    email: 'test@example.com',
    password: 'ValidPassword123!',
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

    const mockNotificationRepository: jest.Mocked<INotificationRepository> = {
      sendOtpEmail: jest.fn(),
      sendOtpSms: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendWelcomeAdminEmail: jest.fn(),
      sendWelcomeBeneficiaryEmail: jest.fn(),
      sendWelcomeDoctorEmail: jest.fn(),
      sendContactEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        {
          provide: AUTH_REPOSITORY_TOKEN,
          useValue: mockAuthRepository,
        },
        {
          provide: OTP_REPOSITORY_TOKEN,
          useValue: mockOtpRepository,
        },
        {
          provide: NOTIFICATION_REPOSITORY_TOKEN,
          useValue: mockNotificationRepository,
        },
        UserMapper,
      ],
    }).compile();

    useCase = module.get<SignInUseCase>(SignInUseCase);
    authRepository = module.get(AUTH_REPOSITORY_TOKEN);
    otpRepository = module.get(OTP_REPOSITORY_TOKEN);
    notificationRepository = module.get(NOTIFICATION_REPOSITORY_TOKEN);
    userMapper = module.get<UserMapper>(UserMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully sign in with valid credentials', async () => {
      // Arrange
      const expectedResult = {
        tokens: mockTokens,
        user: mockUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(validSignInDto);

      // Assert
      expect(authRepository.signIn).toHaveBeenCalledTimes(1);
      expect(authRepository.signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPassword123!',
        }),
      );
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should successfully sign in with tenantId validation', async () => {
      // Arrange
      const dtoWithTenant: SignInDto = {
        ...validSignInDto,
        tenantId: 'tenant-123',
      };

      const expectedResult = {
        tokens: mockTokens,
        user: mockUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(dtoWithTenant);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
    });

    it('should throw NewPasswordRequiredError when NEW_PASSWORD_REQUIRED challenge is returned and send OTP', async () => {
      // Arrange
      const challengeResult = {
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: 'mock-session-token',
        requiredAttributes: ['name', 'email'],
        user: mockUser,
      };

      const generatedOtp = '123456';

      authRepository.signIn.mockResolvedValue(challengeResult);
      otpRepository.generateOtp.mockReturnValue(generatedOtp);
      otpRepository.storeOtp.mockResolvedValue(undefined);
      notificationRepository.sendOtpEmail.mockResolvedValue(undefined);

      // Act & Assert
      try {
        await useCase.execute(validSignInDto);
        fail('Should have thrown NewPasswordRequiredError');
      } catch (error) {
        expect(error).toBeInstanceOf(NewPasswordRequiredError);
        expect(error.getResponse()).toEqual({
          statusCode: 400,
          message:
            'Nova senha é necessária. Este é o primeiro login do usuário.',
          error: 'NEW_PASSWORD_REQUIRED',
          session: 'mock-session-token',
          requiredAttributes: ['name', 'email'],
        });
        expect(error.session).toBe('mock-session-token');
        expect(error.requiredAttributes).toEqual(['name', 'email']);
      }

      // Verify OTP was generated, stored and sent
      expect(otpRepository.generateOtp).toHaveBeenCalledTimes(1);
      expect(otpRepository.storeOtp).toHaveBeenCalledWith(
        'test@example.com',
        generatedOtp,
        300,
      );
      expect(notificationRepository.sendOtpEmail).toHaveBeenCalledWith(
        'test@example.com',
        generatedOtp,
        mockUser.name,
      );
      expect(authRepository.signIn).toHaveBeenCalledTimes(1);
    });

    it('should throw NewPasswordRequiredError with empty session when session is undefined and send OTP', async () => {
      // Arrange
      const challengeResult = {
        challengeName: 'NEW_PASSWORD_REQUIRED',
        requiredAttributes: [],
      };

      const generatedOtp = '654321';

      authRepository.signIn.mockResolvedValue(challengeResult);
      otpRepository.generateOtp.mockReturnValue(generatedOtp);
      otpRepository.storeOtp.mockResolvedValue(undefined);
      notificationRepository.sendOtpEmail.mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(validSignInDto)).rejects.toThrow(
        NewPasswordRequiredError,
      );

      // Verify OTP flow was executed
      expect(otpRepository.generateOtp).toHaveBeenCalled();
      expect(otpRepository.storeOtp).toHaveBeenCalled();
      expect(notificationRepository.sendOtpEmail).toHaveBeenCalled();
    });

    it('should throw error when tokens are missing in successful response', async () => {
      // Arrange
      const invalidResult = {
        user: mockUser,
        // tokens is missing
      };

      authRepository.signIn.mockResolvedValue(invalidResult);

      // Act & Assert
      await expect(useCase.execute(validSignInDto)).rejects.toThrow(
        'Resposta inválida do repositório de autenticação',
      );
    });

    it('should throw error when user is missing in successful response', async () => {
      // Arrange
      const invalidResult = {
        tokens: mockTokens,
        // user is missing
      };

      authRepository.signIn.mockResolvedValue(invalidResult);

      // Act & Assert
      await expect(useCase.execute(validSignInDto)).rejects.toThrow(
        'Resposta inválida do repositório de autenticação',
      );
    });

    it('should throw error when user does not belong to specified tenant', async () => {
      // Arrange
      const dtoWithDifferentTenant: SignInDto = {
        ...validSignInDto,
        tenantId: 'different-tenant-id',
      };

      const expectedResult = {
        tokens: mockTokens,
        user: mockUser, // mockUser has tenantId: 'tenant-123'
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act & Assert
      await expect(useCase.execute(dtoWithDifferentTenant)).rejects.toThrow(
        'Usuário não pertence ao tenant especificado',
      );
    });

    it('should throw InvalidCredentialsError for invalid email format', async () => {
      // Arrange
      const invalidEmailDto: SignInDto = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
      };

      // Act & Assert
      await expect(useCase.execute(invalidEmailDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(authRepository.signIn).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError for password less than 8 characters', async () => {
      // Arrange
      const shortPasswordDto: SignInDto = {
        email: 'test@example.com',
        password: 'short',
      };

      // Act & Assert
      await expect(useCase.execute(shortPasswordDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(authRepository.signIn).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError for empty email', async () => {
      // Arrange
      const emptyEmailDto: SignInDto = {
        email: '',
        password: 'ValidPassword123!',
      };

      // Act & Assert
      await expect(useCase.execute(emptyEmailDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(authRepository.signIn).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError for empty password', async () => {
      // Arrange
      const emptyPasswordDto: SignInDto = {
        email: 'test@example.com',
        password: '',
      };

      // Act & Assert
      await expect(useCase.execute(emptyPasswordDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(authRepository.signIn).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase and trim whitespace', async () => {
      // Arrange
      const unnormalizedEmailDto: SignInDto = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'ValidPassword123!',
      };

      const expectedResult = {
        tokens: mockTokens,
        user: mockUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      await useCase.execute(unnormalizedEmailDto);

      // Assert
      expect(authRepository.signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        }),
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Cognito service unavailable');
      authRepository.signIn.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validSignInDto)).rejects.toThrow(
        'Cognito service unavailable',
      );
    });

    it('should return tokens with correct structure', async () => {
      // Arrange
      const expectedResult = {
        tokens: mockTokens,
        user: mockUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(validSignInDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).not.toHaveProperty('idToken'); // idToken should not be in response
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should handle different user roles correctly', async () => {
      // Arrange
      const adminUser = new User(
        'admin-id',
        'admin@example.com',
        'Admin User',
        UserRole.ADMIN,
        'tenant-123',
        true,
        new Date(),
        new Date(),
      );

      const expectedResult = {
        tokens: mockTokens,
        user: adminUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(validSignInDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockTokens.accessToken);
    });

    it('should allow sign in without tenantId in DTO', async () => {
      // Arrange
      const dtoWithoutTenant: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      const expectedResult = {
        tokens: mockTokens,
        user: mockUser,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await useCase.execute(dtoWithoutTenant);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: mockTokens.expiresIn,
      });
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

      const dtoWithTenant: SignInDto = {
        ...validSignInDto,
        tenantId: 'tenant-123',
      };

      const expectedResult = {
        tokens: mockTokens,
        user: userWithoutTenant,
      };

      authRepository.signIn.mockResolvedValue(expectedResult);

      // Act & Assert
      await expect(useCase.execute(dtoWithTenant)).rejects.toThrow(
        'Usuário não pertence ao tenant especificado',
      );
    });
  });
});
