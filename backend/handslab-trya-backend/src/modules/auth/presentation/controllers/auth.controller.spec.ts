import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SignInUseCase } from '../../application/use-cases/sign-in/sign-in.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { SignOutUseCase } from '../../application/use-cases/sign-out/sign-out.use-case';
import { CompleteNewPasswordUseCase } from '../../application/use-cases/complete-new-password/complete-new-password.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password/reset-password.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/verify-otp/verify-otp.use-case';
import { GetUserInfoUseCase } from '../../application/use-cases/get-user-info/get-user-info.use-case';
import { GetUserInfoByIdUseCase } from '../../application/use-cases/get-user-info/get-user-info-by-id.use-case';
import { SignInDto } from '../../application/use-cases/sign-in/sign-in.dto';
import { SignInResponseDto } from '../../application/use-cases/sign-in/sign-in-response.dto';
import { NewPasswordRequiredError } from '../../domain/errors/new-password-required.error';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { AUTH_REPOSITORY_TOKEN } from '../../domain/repositories/auth.repository.token';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../shared/domain/repositories/notification.repository.token';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

describe('AuthController - Login Route', () => {
  let controller: AuthController;
  let signInUseCase: jest.Mocked<SignInUseCase>;
  let getUserInfoUseCase: jest.Mocked<GetUserInfoUseCase>;
  let getUserInfoByIdUseCase: jest.Mocked<GetUserInfoByIdUseCase>;
  let authRepository: jest.Mocked<IAuthRepository>;

  const mockSignInResponse: SignInResponseDto = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };

  beforeEach(async () => {
    // Create mock use cases
    const mockSignInUseCase = {
      execute: jest.fn(),
    };

    const mockRefreshTokenUseCase = {
      execute: jest.fn(),
    };

    const mockSignOutUseCase = {
      execute: jest.fn(),
    };

    const mockCompleteNewPasswordUseCase = {
      execute: jest.fn(),
    };

    const mockForgotPasswordUseCase = {
      execute: jest.fn(),
    };

    const mockResetPasswordUseCase = {
      execute: jest.fn(),
    };

    const mockVerifyOtpUseCase = {
      execute: jest.fn(),
    };

    const mockGetUserInfoUseCase = {
      execute: jest.fn(),
      executeDto: jest.fn(),
    };

    const mockGetUserInfoByIdUseCase = {
      execute: jest.fn(),
    };

    const mockVerifyCpfUseCase = {
      execute: jest.fn(),
    };

    const mockVerifyBirthdateUseCase = {
      execute: jest.fn(),
    };

    const mockCompleteRegistrationUseCase = {
      execute: jest.fn(),
    };

    const mockNotificationRepository = {};

    const mockAuthRepository: jest.Mocked<Partial<IAuthRepository>> = {
      signIn: jest.fn(),
      refreshToken: jest.fn(),
      signOut: jest.fn(),
      getUserInfo: jest.fn(),
      verifyToken: jest.fn(),
      completeNewPasswordChallenge: jest.fn(),
      getAuthorizationUrl: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SignInUseCase,
          useValue: mockSignInUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
        {
          provide: SignOutUseCase,
          useValue: mockSignOutUseCase,
        },
        {
          provide: CompleteNewPasswordUseCase,
          useValue: mockCompleteNewPasswordUseCase,
        },
        {
          provide: ForgotPasswordUseCase,
          useValue: mockForgotPasswordUseCase,
        },
        {
          provide: ResetPasswordUseCase,
          useValue: mockResetPasswordUseCase,
        },
        {
          provide: VerifyOtpUseCase,
          useValue: mockVerifyOtpUseCase,
        },
        {
          provide: GetUserInfoUseCase,
          useValue: mockGetUserInfoUseCase,
        },
        {
          provide: GetUserInfoByIdUseCase,
          useValue: mockGetUserInfoByIdUseCase,
        },
        {
          provide: 'VERIFY_CPF_USE_CASE',
          useValue: mockVerifyCpfUseCase,
        },
        {
          provide: 'VERIFY_BIRTHDATE_USE_CASE',
          useValue: mockVerifyBirthdateUseCase,
        },
        {
          provide: 'COMPLETE_REGISTRATION_USE_CASE',
          useValue: mockCompleteRegistrationUseCase,
        },
        {
          provide: NOTIFICATION_REPOSITORY_TOKEN,
          useValue: mockNotificationRepository,
        },
        {
          provide: AUTH_REPOSITORY_TOKEN,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signInUseCase = module.get(SignInUseCase);
    getUserInfoUseCase = module.get(GetUserInfoUseCase);
    getUserInfoByIdUseCase = module.get(GetUserInfoByIdUseCase);
    authRepository = module.get(AUTH_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledTimes(1);
      expect(signInUseCase.execute).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(mockSignInResponse);
    });

    it('should login with tenantId in body', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        tenantId: 'tenant-123',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          tenantId: 'tenant-123',
        }),
      );
      expect(result).toEqual(mockSignInResponse);
    });

    it('should login with tenantId from header when not in body', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };
      const headerTenantId = 'tenant-from-header';

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto, headerTenantId);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          tenantId: 'tenant-from-header',
        }),
      );
      expect(result).toEqual(mockSignInResponse);
    });

    it('should prioritize tenantId from body over header', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        tenantId: 'tenant-from-body',
      };
      const headerTenantId = 'tenant-from-header';

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto, headerTenantId);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          tenantId: 'tenant-from-body', // Should keep body tenantId
        }),
      );
      expect(result).toEqual(mockSignInResponse);
    });

    it('should throw NewPasswordRequiredError when password change is required', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'TemporaryPass123!',
      };

      const newPasswordError = new NewPasswordRequiredError(
        'mock-session-token',
        ['name', 'email'],
      );

      signInUseCase.execute.mockRejectedValue(newPasswordError);

      // Act & Assert
      await expect(controller.login(signInDto)).rejects.toThrow(
        NewPasswordRequiredError,
      );
      expect(signInUseCase.execute).toHaveBeenCalledWith(signInDto);
    });

    it('should throw InvalidCredentialsError for wrong password', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const invalidCredentialsError = new InvalidCredentialsError(
        'Email ou senha inválidos',
      );

      signInUseCase.execute.mockRejectedValue(invalidCredentialsError);

      // Act & Assert
      await expect(controller.login(signInDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(signInUseCase.execute).toHaveBeenCalledWith(signInDto);
    });

    it('should throw InvalidCredentialsError for invalid email format', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
      };

      const invalidCredentialsError = new InvalidCredentialsError(
        'Email inválido',
      );

      signInUseCase.execute.mockRejectedValue(invalidCredentialsError);

      // Act & Assert
      await expect(controller.login(signInDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should throw error when user does not belong to tenant', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        tenantId: 'wrong-tenant',
      };

      const tenantError = new Error(
        'Usuário não pertence ao tenant especificado',
      );

      signInUseCase.execute.mockRejectedValue(tenantError);

      // Act & Assert
      await expect(controller.login(signInDto)).rejects.toThrow(
        'Usuário não pertence ao tenant especificado',
      );
    });

    it('should handle generic errors from use case', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      const genericError = new Error('Cognito service unavailable');
      signInUseCase.execute.mockRejectedValue(genericError);

      // Act & Assert
      await expect(controller.login(signInDto)).rejects.toThrow(
        'Cognito service unavailable',
      );
    });

    it('should pass empty tenantId when not provided in body or header', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      await controller.login(signInDto, undefined);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPassword123!',
        }),
      );
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.not.objectContaining({
          tenantId: expect.anything(),
        }),
      );
    });

    it('should return correct response structure', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.expiresIn).toBe(3600);
    });

    it('should handle empty header tenantId gracefully', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      await controller.login(signInDto, '');

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(signInDto);
      // Empty string should not set tenantId
      expect(signInDto.tenantId).toBeUndefined();
    });

    it('should mutate signInDto with header tenantId', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };
      const headerTenantId = 'tenant-xyz';

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      await controller.login(signInDto, headerTenantId);

      // Assert
      expect(signInDto.tenantId).toBe('tenant-xyz');
    });

    it('should not mutate signInDto when tenantId already exists in body', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        tenantId: 'original-tenant',
      };
      const headerTenantId = 'header-tenant';

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      await controller.login(signInDto, headerTenantId);

      // Assert
      expect(signInDto.tenantId).toBe('original-tenant');
    });

    it('should call use case exactly once per request', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      await controller.login(signInDto);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different email formats correctly', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'User.Name+Tag@Example.COM',
        password: 'ValidPassword123!',
      };

      signInUseCase.execute.mockResolvedValue(mockSignInResponse);

      // Act
      const result = await controller.login(signInDto);

      // Assert
      expect(signInUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'User.Name+Tag@Example.COM',
        }),
      );
      expect(result).toEqual(mockSignInResponse);
    });
  });

  describe('GET /auth/me', () => {
    it('should use dbId when available', async () => {
      const now = new Date();
      const user = new User(
        'cognito-id',
        'test@example.com',
        'Test User',
        UserRole.BENEFICIARY,
        'tenant-1',
        true,
        now,
        now,
        undefined,
        'db-user-id',
      );

      const response = { id: 'db-user-id' } as any;
      getUserInfoByIdUseCase.execute.mockResolvedValue(response);

      const result = await controller.getMe(user);

      expect(getUserInfoByIdUseCase.execute).toHaveBeenCalledWith('db-user-id');
      expect(getUserInfoUseCase.executeDto).not.toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should fallback to email when dbId is missing', async () => {
      const now = new Date();
      const user = new User(
        'cognito-id',
        'test@example.com',
        'Test User',
        UserRole.BENEFICIARY,
        'tenant-1',
        true,
        now,
        now,
      );

      const response = { id: 'db-user-id' } as any;
      getUserInfoUseCase.executeDto.mockResolvedValue(response);

      const result = await controller.getMe(user);

      expect(getUserInfoUseCase.executeDto).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(getUserInfoByIdUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });
});
