# Design Document

## Visão Geral

O módulo de autenticação implementa um sistema de autenticação seguro e escalável usando AWS Cognito como provedor de identidade. O design segue os princípios da Clean Architecture com clara separação entre lógica de domínio, casos de uso da aplicação, implementações de infraestrutura e camada de apresentação. O módulo fornece autenticação baseada em JWT com controle de acesso baseado em funções (RBAC) para as roles ADMIN e DOCTOR.

### Decisões Chave de Design

1. **AWS Cognito como Provedor de Identidade**: Aproveita serviço gerenciado de autenticação para segurança, escalabilidade e conformidade
2. **Estratégia de Token JWT**: Usa tokens JWT emitidos pelo Cognito para autenticação stateless
3. **Clean Architecture**: Garante testabilidade, manutenibilidade e independência de frameworks externos
4. **Injeção de Dependência Baseada em Token**: Usa tokens de injeção para abstração de repositório
5. **Tratamento de Erros Orientado a Domínio**: Mapeia erros de infraestrutura para exceções específicas do domínio
6. **Guards Globais**: Aplica autenticação e autorização no nível da aplicação
7. **Verificação OTP**: Implementa verificação de código de uso único para confirmação de email e reset de senha

## Arquitetura

### Estrutura de Camadas

```
src/modules/auth/
├── domain/                          # Camada de lógica de negócio (sem dependências)
│   ├── entities/
│   │   ├── user.entity.ts          # Entidade de usuário do domínio
│   │   └── auth-tokens.entity.ts   # Entidade de par de tokens
│   ├── repositories/
│   │   └── auth.repository.interface.ts  # Contrato do repositório
│   └── errors/
│       ├── authentication.error.ts
│       ├── user-not-confirmed.error.ts
│       ├── user-already-exists.error.ts
│       ├── user-not-found.error.ts
│       ├── invalid-verification-code.error.ts
│       └── code-expired.error.ts
│
├── application/                     # Camada de orquestração de casos de uso
│   └── use-cases/
│       ├── sign-in/
│       │   ├── sign-in.use-case.ts
│       │   ├── sign-in.dto.ts
│       │   └── sign-in-response.dto.ts
│       ├── sign-up/
│       │   ├── sign-up.use-case.ts
│       │   ├── sign-up.dto.ts
│       │   └── sign-up-response.dto.ts
│       ├── verify-email/
│       │   ├── verify-email.use-case.ts
│       │   └── verify-email.dto.ts
│       ├── resend-verification/
│       │   ├── resend-verification.use-case.ts
│       │   └── resend-verification.dto.ts
│       ├── refresh-token/
│       │   ├── refresh-token.use-case.ts
│       │   ├── refresh-token.dto.ts
│       │   └── refresh-token-response.dto.ts
│       ├── forgot-password/
│       │   ├── forgot-password.use-case.ts
│       │   └── forgot-password.dto.ts
│       ├── confirm-forgot-password/
│       │   ├── confirm-forgot-password.use-case.ts
│       │   └── confirm-forgot-password.dto.ts
│       ├── get-current-user/
│       │   ├── get-current-user.use-case.ts
│       │   └── get-current-user-response.dto.ts
│       └── update-profile/
│           ├── update-profile.use-case.ts
│           ├── update-profile.dto.ts
│           └── update-profile-response.dto.ts
│
├── infrastructure/                  # Camada de serviços externos
│   ├── repositories/
│   │   └── cognito-auth.repository.ts  # Implementação Cognito
│   ├── mappers/
│   │   └── user.mapper.ts          # Mapeia usuário Cognito para entidade de domínio
│   └── strategies/
│       └── jwt.strategy.ts         # Estratégia JWT do Passport
│
├── presentation/                    # Camada de API
│   ├── controllers/
│   │   └── auth.controller.ts      # Endpoints REST
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # Guard de validação JWT
│   │   └── roles.guard.ts          # Guard de autorização baseada em roles
│   └── decorators/
│       ├── public.decorator.ts     # Bypass de autenticação
│       ├── roles.decorator.ts      # Especifica roles requeridas
│       └── current-user.decorator.ts  # Extrai usuário da requisição
│
└── auth.module.ts                   # Definição do módulo
```

### Fluxo de Dependências

```
Presentation → Application → Domain ← Infrastructure
```

- **Presentation** depende de Application (casos de uso)
- **Application** depende de Domain (entidades, interfaces)
- **Infrastructure** depende de Domain (implementa interfaces)
- **Domain** não tem dependências (lógica de negócio pura)

## Componentes e Interfaces

### Camada de Domínio

#### Entidade User

```typescript
// domain/entities/user.entity.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
}

export class User {
  constructor(
    public readonly id: string,        // Cognito sub
    public readonly email: string,
    public readonly role: UserRole,
    public readonly emailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
```

#### Entidade AuthTokens

```typescript
// domain/entities/auth-tokens.entity.ts
export class AuthTokens {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresIn: number,
    public readonly tokenType: string = 'Bearer',
  ) {}
}
```

#### Interface IAuthRepository

```typescript
// domain/repositories/auth.repository.interface.ts
export interface IAuthRepository {
  // Autenticação
  signIn(email: string, password: string): Promise<{ tokens: AuthTokens; user: User }>;
  signUp(email: string, password: string, role: UserRole): Promise<{ userId: string }>;
  
  // Verificação de email com código OTP
  verifyEmail(email: string, code: string): Promise<void>;
  resendVerificationCode(email: string): Promise<void>;
  
  // Refresh de token
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  
  // Reset de senha com código OTP
  forgotPassword(email: string): Promise<void>;
  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void>;
  
  // Perfil do usuário
  getCurrentUser(accessToken: string): Promise<User>;
  updateProfile(userId: string, attributes: Record<string, string>): Promise<User>;
}

export const AUTH_REPOSITORY_TOKEN = Symbol('AUTH_REPOSITORY_TOKEN');
```

#### Erros de Domínio

```typescript
// domain/errors/authentication.error.ts
export class AuthenticationError extends Error {
  constructor(message: string = 'Falha na autenticação') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// domain/errors/user-not-confirmed.error.ts
export class UserNotConfirmedError extends Error {
  constructor(message: string = 'Email do usuário não confirmado') {
    super(message);
    this.name = 'UserNotConfirmedError';
  }
}

// domain/errors/user-already-exists.error.ts
export class UserAlreadyExistsError extends Error {
  constructor(message: string = 'Usuário já existe') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

// domain/errors/user-not-found.error.ts
export class UserNotFoundError extends Error {
  constructor(message: string = 'Usuário não encontrado') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

// domain/errors/invalid-verification-code.error.ts
export class InvalidVerificationCodeError extends Error {
  constructor(message: string = 'Código de verificação inválido') {
    super(message);
    this.name = 'InvalidVerificationCodeError';
  }
}

// domain/errors/code-expired.error.ts
export class CodeExpiredError extends Error {
  constructor(message: string = 'Código de verificação expirado') {
    super(message);
    this.name = 'CodeExpiredError';
  }
}
```

### Camada de Aplicação

#### Exemplo de Caso de Uso: Sign In

```typescript
// application/use-cases/sign-in/sign-in.use-case.ts
@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: SignInDto): Promise<SignInResponseDto> {
    const { tokens, user } = await this.authRepository.signIn(dto.email, dto.password);
    
    return new SignInResponseDto(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn,
      user.id,
      user.email,
      user.role,
    );
  }
}
```

#### DTOs com Validação

```typescript
// application/use-cases/sign-in/sign-in.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// application/use-cases/sign-up/sign-up.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// application/use-cases/verify-email/verify-email.dto.ts
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)  // Código OTP de 6 dígitos
  code: string;
}

// application/use-cases/confirm-forgot-password/confirm-forgot-password.dto.ts
import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ConfirmForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)  // Código OTP de 6 dígitos
  code: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

### Camada de Infraestrutura

#### CognitoAuthRepository

```typescript
// infrastructure/repositories/cognito-auth.repository.ts
@Injectable()
export class CognitoAuthRepository implements IAuthRepository {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private configService: ConfigService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async signIn(email: string, password: string): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.configService.get('COGNITO_CLIENT_ID'),
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(command);
      
      // Get user details
      const user = await this.getUserByAccessToken(response.AuthenticationResult.AccessToken);
      
      const tokens = new AuthTokens(
        response.AuthenticationResult.AccessToken,
        response.AuthenticationResult.RefreshToken,
        response.AuthenticationResult.ExpiresIn,
      );

      return { tokens, user };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.configService.get('COGNITO_CLIENT_ID'),
        Username: email,
        ConfirmationCode: code,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.configService.get('COGNITO_CLIENT_ID'),
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  private handleCognitoError(error: any): never {
    if (error.name === 'NotAuthorizedException') {
      throw new AuthenticationError('Credenciais inválidas');
    }
    if (error.name === 'UserNotConfirmedException') {
      throw new UserNotConfirmedError();
    }
    if (error.name === 'UserNotFoundException') {
      throw new UserNotFoundError();
    }
    if (error.name === 'UsernameExistsException') {
      throw new UserAlreadyExistsError();
    }
    if (error.name === 'CodeMismatchException') {
      throw new InvalidVerificationCodeError();
    }
    if (error.name === 'ExpiredCodeException') {
      throw new CodeExpiredError();
    }
    throw error;
  }
}
```

#### UserMapper

```typescript
// infrastructure/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(cognitoUser: any): User {
    const attributes = cognitoUser.UserAttributes || cognitoUser.Attributes;
    const attributeMap = attributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    return new User(
      attributeMap['sub'],
      attributeMap['email'],
      attributeMap['custom:role'] as UserRole,
      attributeMap['email_verified'] === 'true',
      new Date(cognitoUser.UserCreateDate || Date.now()),
      new Date(cognitoUser.UserLastModifiedDate || Date.now()),
    );
  }
}
```

#### JWT Strategy

```typescript
// infrastructure/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload['custom:role'],
    };
  }
}
```

### Presentation Layer

#### AuthController

```typescript
// presentation/controllers/auth.controller.ts
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Fazer login com email e senha' })
  @ApiResponse({ status: 200, description: 'Autenticado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 403, description: 'Email não confirmado' })
  async signIn(@Body() dto: SignInDto): Promise<SignInResponseDto> {
    return this.signInUseCase.execute(dto);
  }

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso. Código de verificação enviado por email.' })
  @ApiResponse({ status: 400, description: 'Erro de validação' })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async signUp(@Body() dto: SignUpDto): Promise<SignUpResponseDto> {
    return this.signUpUseCase.execute(dto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar email com código OTP' })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  @ApiResponse({ status: 400, description: 'Código inválido ou expirado' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    return this.verifyEmailUseCase.execute(dto);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Reenviar código de verificação de email' })
  @ApiResponse({ status: 200, description: 'Código reenviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<void> {
    return this.resendVerificationUseCase.execute(dto);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar reset de senha' })
  @ApiResponse({ status: 200, description: 'Código de reset enviado por email' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Public()
  @Post('confirm-forgot-password')
  @ApiOperation({ summary: 'Confirmar reset de senha com código OTP' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Código inválido ou expirado' })
  async confirmForgotPassword(@Body() dto: ConfirmForgotPasswordDto): Promise<void> {
    return this.confirmForgotPasswordUseCase.execute(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter informações do usuário atual' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Informações do usuário obtidas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getCurrentUser(@CurrentUser() user: any): Promise<GetCurrentUserResponseDto> {
    return this.getCurrentUserUseCase.execute(user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.updateProfileUseCase.execute(user.userId, dto);
  }
}
```

#### Guards

```typescript
// presentation/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}

// presentation/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
}
```

#### Decorators

```typescript
// presentation/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// presentation/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../domain/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// presentation/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Data Models

### Cognito User Attributes

Stored in AWS Cognito user pool:

```typescript
{
  sub: string;                    // Cognito user ID (UUID)
  email: string;                  // User email (username)
  email_verified: boolean;        // Email verification status
  'custom:role': 'ADMIN' | 'DOCTOR';  // User role
}
```

### JWT Payload

```typescript
{
  sub: string;                    // User ID
  email: string;                  // User email
  'custom:role': string;          // User role
  iat: number;                    // Issued at
  exp: number;                    // Expiration time
}
```

### Request User Object

Attached to request after JWT validation:

```typescript
{
  userId: string;
  email: string;
  role: UserRole;
}
```

## Configuration

### Environment Variables

```typescript
// Required AWS Cognito configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

// JWT configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=3600  // 1 hour in seconds
```

### ConfigService Integration

```typescript
// config/aws.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
  },
}));

// config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '3600',
}));
```

## Tratamento de Erros

### Estratégia de Mapeamento de Erros

Erros de infraestrutura são mapeados para erros de domínio:

```typescript
Erro do Cognito                  → Erro de Domínio
─────────────────────────────────────────────────────────
NotAuthorizedException          → AuthenticationError
UserNotConfirmedException       → UserNotConfirmedError
UsernameExistsException         → UserAlreadyExistsError
UserNotFoundException           → UserNotFoundError
CodeMismatchException           → InvalidVerificationCodeError
ExpiredCodeException            → CodeExpiredError
InvalidPasswordException        → ValidationError
```

### Filtro de Exceções HTTP

```typescript
// shared/presentation/filters/domain-exception.filter.ts
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof AuthenticationError) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    } else if (exception instanceof UserNotConfirmedError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
    } else if (exception instanceof UserAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof UserNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof InvalidVerificationCodeError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof CodeExpiredError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Estratégia de Testes

### Testes Unitários

1. **Camada de Domínio**
   - Criação e validação de entidades
   - Instanciação de erros

2. **Camada de Aplicação (Casos de Uso)**
   - Mock da interface do repositório
   - Testar fluxos de lógica de negócio
   - Validar transformações de DTOs
   - Testar tratamento de erros

3. **Camada de Infraestrutura**
   - Mock do cliente Cognito
   - Testar mapeamento de erros
   - Testar transformações do user mapper

4. **Camada de Apresentação**
   - Mock dos casos de uso
   - Testar endpoints do controller
   - Testar lógica dos guards
   - Testar comportamento dos decorators

### Testes de Integração

1. **Fluxo de Autenticação End-to-End**
   - Sign up → Verificar email com OTP → Sign in
   - Fluxo de reset de senha com OTP
   - Fluxo de refresh de token

2. **Testes de Autorização**
   - Controle de acesso baseado em roles
   - Acesso a endpoints públicos
   - Acesso a endpoints protegidos

### Exemplo de Estrutura de Teste

```typescript
// application/use-cases/sign-in/sign-in.use-case.spec.ts
describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let mockRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockRepository = {
      signIn: jest.fn(),
    } as any;
    
    useCase = new SignInUseCase(mockRepository);
  });

  it('should return tokens and user on successful sign in', async () => {
    const mockTokens = new AuthTokens('access', 'refresh', 3600);
    const mockUser = new User('123', 'test@example.com', UserRole.ADMIN, true, new Date(), new Date());
    
    mockRepository.signIn.mockResolvedValue({ tokens: mockTokens, user: mockUser });

    const result = await useCase.execute({ email: 'test@example.com', password: 'password' });

    expect(result.accessToken).toBe('access');
    expect(result.email).toBe('test@example.com');
  });

  it('should throw AuthenticationError on invalid credentials', async () => {
    mockRepository.signIn.mockRejectedValue(new AuthenticationError());

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'wrong' })
    ).rejects.toThrow(AuthenticationError);
  });
});
```

## Registro do Módulo

### AuthModule

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Repositório
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: CognitoAuthRepository,
    },
    // Estratégias
    JwtStrategy,
    // Casos de Uso
    SignInUseCase,
    SignUpUseCase,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ConfirmForgotPasswordUseCase,
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
    // Guards
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
```

### Aplicação de Guards Globais

```typescript
// main.ts or app.module.ts
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

## Considerações de Segurança

1. **Política de Senha**: Aplicada pelo Cognito (mínimo 8 caracteres, requisitos de complexidade)
2. **Expiração de Token**: Access tokens expiram em 1 hora, refresh tokens em 30 dias
3. **Apenas HTTPS**: Todos os endpoints de autenticação devem usar HTTPS em produção
4. **Rate Limiting**: Implementar rate limiting nos endpoints de autenticação
5. **Logging**: Registrar tentativas de autenticação sem expor dados sensíveis
6. **Mensagens de Erro**: Mensagens genéricas de erro para prevenir enumeração de usuários
7. **CORS**: Configurar CORS apropriadamente para aplicações frontend
8. **Códigos OTP**: Códigos de 6 dígitos com expiração de 24 horas (padrão Cognito)

## Dependências a Instalar

```bash
npm install @aws-sdk/client-cognito-identity-provider
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express

npm install -D @types/passport-jwt
```
