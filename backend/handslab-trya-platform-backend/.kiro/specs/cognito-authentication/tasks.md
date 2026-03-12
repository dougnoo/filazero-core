# Implementation Plan

- [x] 1. Instalar dependências e configurar módulo base
  - Instalar @aws-sdk/client-cognito-identity-provider, @nestjs/jwt, @nestjs/passport, passport-jwt, @nestjs/config, @nestjs/swagger, class-validator, class-transformer
  - Criar estrutura de pastas do módulo auth seguindo Clean Architecture
  - Criar auth.module.ts com imports básicos (JwtModule, PassportModule, ConfigModule)
  - _Requirements: 1.1, 2.1, 4.1, 8.1_

- [x] 2. Implementar camada de domínio
  - Criar enum UserRole (ADMIN, DOCTOR) em domain/entities/user.entity.ts
  - Criar entidade User com propriedades (id, email, role, emailVerified, createdAt, updatedAt)
  - Criar entidade AuthTokens com propriedades (accessToken, refreshToken, expiresIn, tokenType)
  - Criar interface IAuthRepository em domain/repositories/auth.repository.interface.ts com todos os métodos (signIn, signUp, verifyEmail, resendVerificationCode, refreshToken, forgotPassword, confirmForgotPassword, getCurrentUser, updateProfile)
  - Criar token de injeção AUTH_REPOSITORY_TOKEN
  - Criar erros de domínio: AuthenticationError, UserNotConfirmedError, UserAlreadyExistsError, UserNotFoundError, InvalidVerificationCodeError, CodeExpiredError
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 3.1, 3.2, 5.2, 5.3, 10.1, 10.2, 10.3_

- [x] 3. Implementar configuração AWS e JWT
  - Criar config/aws.config.ts com configurações do Cognito (region, accessKeyId, secretAccessKey, userPoolId, clientId)
  - Criar config/jwt.config.ts com configurações JWT (secret, expiresIn)
  - Registrar configurações no ConfigModule
  - _Requirements: 1.1, 4.1, 8.1_

- [x] 4. Implementar camada de infraestrutura - Repositório Cognito
  - Criar CognitoAuthRepository implementando IAuthRepository
  - Implementar método signIn usando InitiateAuthCommand com USER_PASSWORD_AUTH
  - Implementar método signUp usando SignUpCommand com atributo custom:role
  - Implementar método verifyEmail usando ConfirmSignUpCommand
  - Implementar método resendVerificationCode usando ResendConfirmationCodeCommand
  - Implementar método refreshToken usando InitiateAuthCommand com REFRESH_TOKEN_AUTH
  - Implementar método forgotPassword usando ForgotPasswordCommand
  - Implementar método confirmForgotPassword usando ConfirmForgotPasswordCommand
  - Implementar método getCurrentUser usando GetUserCommand
  - Implementar método updateProfile usando UpdateUserAttributesCommand
  - Implementar handleCognitoError para mapear erros do Cognito para erros de domínio
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 9.1, 10.1, 10.2, 10.3_

- [x] 5. Implementar UserMapper
  - Criar UserMapper em infrastructure/mappers/user.mapper.ts
  - Implementar método estático toDomain que converte resposta do Cognito para entidade User
  - Mapear atributos do Cognito (sub, email, custom:role, email_verified, UserCreateDate, UserLastModifiedDate)
  - _Requirements: 1.4, 6.1_

- [x] 6. Implementar JWT Strategy
  - Criar JwtStrategy em infrastructure/strategies/jwt.strategy.ts estendendo PassportStrategy
  - Configurar extração de token do header Authorization Bearer
  - Implementar método validate que retorna payload com userId, email e role
  - _Requirements: 8.1, 8.5_

- [x] 7. Implementar casos de uso - Sign In e Sign Up
  - Criar SignInUseCase com SignInDto (email, password) e SignInResponseDto
  - Implementar lógica de sign in chamando authRepository.signIn
  - Criar SignUpUseCase com SignUpDto (email, password, role) e SignUpResponseDto
  - Implementar lógica de sign up chamando authRepository.signUp
  - Adicionar validações com class-validator nos DTOs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4, 2.5, 2.6_

- [x] 8. Implementar casos de uso - Verificação de Email
  - Criar VerifyEmailUseCase com VerifyEmailDto (email, code de 6 dígitos)
  - Implementar lógica chamando authRepository.verifyEmail
  - Criar ResendVerificationUseCase com ResendVerificationDto (email)
  - Implementar lógica chamando authRepository.resendVerificationCode
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9. Implementar casos de uso - Token Refresh
  - Criar RefreshTokenUseCase com RefreshTokenDto (refreshToken) e RefreshTokenResponseDto
  - Implementar lógica chamando authRepository.refreshToken
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 10. Implementar casos de uso - Reset de Senha
  - Criar ForgotPasswordUseCase com ForgotPasswordDto (email)
  - Implementar lógica chamando authRepository.forgotPassword
  - Criar ConfirmForgotPasswordUseCase com ConfirmForgotPasswordDto (email, code de 6 dígitos, newPassword)
  - Implementar lógica chamando authRepository.confirmForgotPassword
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Implementar casos de uso - Perfil do Usuário
  - Criar GetCurrentUserUseCase com GetCurrentUserResponseDto
  - Implementar lógica chamando authRepository.getCurrentUser
  - Criar UpdateProfileUseCase com UpdateProfileDto e UpdateProfileResponseDto
  - Implementar lógica chamando authRepository.updateProfile
  - _Requirements: 6.1, 9.1, 9.3, 9.4_

- [x] 12. Implementar Guards
  - Criar JwtAuthGuard estendendo AuthGuard('jwt')
  - Implementar lógica para verificar metadata IS_PUBLIC_KEY e bypass autenticação se público
  - Criar RolesGuard implementando CanActivate
  - Implementar lógica para verificar metadata ROLES_KEY e validar role do usuário
  - Lançar ForbiddenException se usuário não tem role requerida
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Implementar Decorators
  - Criar decorator @Public() usando SetMetadata com IS_PUBLIC_KEY
  - Criar decorator @Roles(...roles) usando SetMetadata com ROLES_KEY
  - Criar decorator @CurrentUser() usando createParamDecorator para extrair user da request
  - _Requirements: 7.4, 8.4_

- [x] 14. Implementar AuthController com Swagger
  - Criar AuthController com tag @ApiTags('Autenticação')
  - Implementar endpoint POST /auth/sign-in (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/sign-up (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/verify-email (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/resend-verification (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/refresh-token (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/forgot-password (público) com documentação Swagger em português
  - Implementar endpoint POST /auth/confirm-forgot-password (público) com documentação Swagger em português
  - Implementar endpoint GET /auth/me (protegido) com documentação Swagger em português
  - Implementar endpoint PATCH /auth/profile (protegido) com documentação Swagger em português
  - Adicionar @ApiResponse para todos os status codes possíveis
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3, 4.1, 5.1, 5.2, 6.1, 6.2, 9.1_

- [x] 15. Implementar filtro de exceções de domínio
  - Criar DomainExceptionFilter em shared/presentation/filters/domain-exception.filter.ts
  - Mapear AuthenticationError para HttpStatus.UNAUTHORIZED
  - Mapear UserNotConfirmedError para HttpStatus.FORBIDDEN
  - Mapear UserAlreadyExistsError para HttpStatus.CONFLICT
  - Mapear UserNotFoundError para HttpStatus.NOT_FOUND
  - Mapear InvalidVerificationCodeError para HttpStatus.BAD_REQUEST
  - Mapear CodeExpiredError para HttpStatus.BAD_REQUEST
  - Retornar JSON com statusCode, message e timestamp
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 16. Configurar módulo e guards globais
  - Registrar todos os providers no AuthModule (repository, strategy, use cases, guards)
  - Configurar JwtModule.registerAsync com ConfigService
  - Exportar JwtAuthGuard e RolesGuard
  - Aplicar JwtAuthGuard e RolesGuard como APP_GUARD no AppModule
  - Aplicar DomainExceptionFilter como APP_FILTER no AppModule
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 10.1_

- [x] 17. Criar arquivo .env.example
  - Documentar variáveis de ambiente necessárias (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, JWT_SECRET, JWT_EXPIRATION)
  - Adicionar comentários explicativos para cada variável
  - _Requirements: 1.1, 4.1, 8.1_

- [x] 18. Implementar logging no CognitoAuthRepository
  - Injetar Logger do NestJS no construtor do CognitoAuthRepository
  - Adicionar log de erro no método handleCognitoError antes de lançar exceções de domínio
  - Logar informações relevantes sem expor dados sensíveis (email mascarado, tipo de erro, timestamp)
  - Não logar senhas, tokens ou códigos de verificação
  - Usar níveis apropriados de log (error para falhas, warn para tentativas inválidas)
  - _Requirements: 10.4_

- [x] 19. Implementar logging no DomainExceptionFilter
  - Injetar Logger do NestJS no construtor do DomainExceptionFilter
  - Adicionar log de erro no método catch antes de retornar resposta HTTP
  - Logar stack trace completo para erros internos do servidor
  - Logar informações de contexto (método HTTP, URL, status code) sem expor dados sensíveis
  - Usar logger.error() para erros 5xx e logger.warn() para erros 4xx
  - _Requirements: 10.4_

- [x] 20. Adicionar logging nos Guards
  - Adicionar Logger no JwtAuthGuard para logar tentativas de acesso não autorizadas
  - Adicionar Logger no RolesGuard para logar tentativas de acesso sem permissão
  - Logar informações de contexto (endpoint, role requerida, role do usuário) sem expor tokens
  - _Requirements: 7.3, 8.2, 10.4_
