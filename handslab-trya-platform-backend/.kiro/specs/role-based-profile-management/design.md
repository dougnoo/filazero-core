# Design Document

## Overview

Este design implementa melhorias no sistema de autenticação e gerenciamento de usuários da Trya Platform API para fornecer experiências personalizadas baseadas em roles. As principais mudanças incluem:

1. **Endpoint /me com dados específicos por role** - Retorna campos diferentes para ADMIN vs DOCTOR
2. **Atualização de perfil baseada em role** - Permite modificação de campos específicos conforme a role
3. **Templates de email personalizados** - Emails de boas-vindas customizados para cada role
4. **Remoção do signup público** - Centraliza criação de usuários nos controllers administrativos

### Decisões Chave de Design

1. **DTOs Polimórficos**: Usar union types e discriminated unions para responses específicas por role
2. **Repository Reuse**: Reutilizar repositórios existentes do UsersModule no AuthModule
3. **Template Strategy Pattern**: Implementar estratégia de templates baseada em role
4. **Backward Breaking**: Remover completamente signup público sem compatibilidade
5. **Eager Loading Condicional**: Carregar relação doctor apenas quando necessário

## Architecture

### Módulos Afetados

```
src/modules/
├── auth/
│   ├── application/use-cases/
│   │   ├── get-current-user/          # MODIFICADO
│   │   │   ├── get-current-user.use-case.ts
│   │   │   ├── admin-profile-response.dto.ts    # NOVO
│   │   │   └── doctor-profile-response.dto.ts   # NOVO
│   │   ├── update-profile/            # MODIFICADO
│   │   │   ├── update-profile.use-case.ts
│   │   │   ├── update-admin-profile.dto.ts      # NOVO
│   │   │   └── update-doctor-profile.dto.ts     # NOVO
│   │   └── sign-up/                   # REMOVIDO
│   ├── presentation/controllers/
│   │   └── auth.controller.ts         # MODIFICADO (remover signup)
│   └── auth.module.ts                 # MODIFICADO (importar UsersModule)
│
└── users/
    ├── infrastructure/templates/
    │   ├── welcome-admin-email.html   # NOVO
    │   ├── welcome-admin-email.txt    # NOVO
    │   └── email-template.service.ts  # MODIFICADO
    └── application/use-cases/
        ├── create-admin/              # MODIFICADO (usar novo template)
        └── create-doctor/             # MODIFICADO (usar novo template)
```

### Fluxo de Dados

**GET /auth/me**
```
Client Request
    ↓
AuthController.getCurrentUser()
    ↓
GetCurrentUserUseCase.execute(userId, role)
    ↓
IUserDbRepository.findById(userId, includeDoctor: role === DOCTOR)
    ↓
if (role === DOCTOR) → DoctorProfileResponseDto
if (role === ADMIN) → AdminProfileResponseDto
    ↓
Response to Client
```

**PATCH /auth/profile**
```
Client Request (with role-specific fields)
    ↓
AuthController.updateProfile(userId, role, dto)
    ↓
UpdateProfileUseCase.execute(userId, role, dto)
    ↓
if (role === ADMIN) → Update users table only
if (role === DOCTOR) → Update users + doctors tables
    ↓
Return role-specific response DTO
```

## Components and Interfaces

### Response DTOs

**AdminProfileResponseDto**
```typescript
export class AdminProfileResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'cognito-sub-id' })
  cognitoId: string;

  @ApiProperty({ example: 'admin@trya.com' })
  email: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({ example: '+5511999999999', nullable: true })
  phone: string | null;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
```

**DoctorProfileResponseDto**
```typescript
export class DoctorProfileResponseDto extends AdminProfileResponseDto {
  @ApiProperty({ example: '123456-SP' })
  crm: string;

  @ApiProperty({ example: 'Cardiologia' })
  specialty: string;
}
```

### Update DTOs

**UpdateAdminProfileDto**
```typescript
export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'João Silva', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;
}
```

**UpdateDoctorProfileDto**
```typescript
export class UpdateDoctorProfileDto extends UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123456-SP', required: false })
  crm?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Cardiologia', required: false })
  specialty?: string;
}
```


### Use Cases

**GetCurrentUserUseCase (Modificado)**
```typescript
@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(
    userId: string,
    role: UserRole,
  ): Promise<AdminProfileResponseDto | DoctorProfileResponseDto> {
    // Buscar usuário com eager loading condicional
    const includeDoctor = role === UserRole.DOCTOR;
    const user = await this.userDbRepository.findById(userId, includeDoctor);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Retornar DTO específico baseado na role
    if (role === UserRole.DOCTOR && user.doctor) {
      return {
        id: user.id,
        cognitoId: user.cognitoId,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        active: user.active,
        crm: user.doctor.crm,
        specialty: user.doctor.specialty,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    return {
      id: user.id,
      cognitoId: user.cognitoId,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

**UpdateProfileUseCase (Modificado)**
```typescript
@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    userId: string,
    role: UserRole,
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<AdminProfileResponseDto | DoctorProfileResponseDto> {
    // Buscar usuário
    const user = await this.userDbRepository.findById(userId, role === UserRole.DOCTOR);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Atualizar campos de User (name, phone)
    const userUpdateData: Partial<User> = {};
    if (dto.name !== undefined) userUpdateData.name = dto.name;
    if (dto.phone !== undefined) userUpdateData.phone = dto.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await this.userDbRepository.update(userId, userUpdateData);
    }

    // Se for DOCTOR, atualizar campos específicos
    if (role === UserRole.DOCTOR && 'crm' in dto) {
      const doctorDto = dto as UpdateDoctorProfileDto;
      const doctorUpdateData: Partial<Doctor> = {};
      
      if (doctorDto.crm !== undefined) doctorUpdateData.crm = doctorDto.crm;
      if (doctorDto.specialty !== undefined) doctorUpdateData.specialty = doctorDto.specialty;

      if (Object.keys(doctorUpdateData).length > 0 && user.doctor) {
        await this.doctorRepository.update(user.doctor.id, doctorUpdateData);
      }
    }

    // Buscar dados atualizados
    const updatedUser = await this.userDbRepository.findById(userId, role === UserRole.DOCTOR);

    // Retornar DTO específico
    if (role === UserRole.DOCTOR && updatedUser.doctor) {
      return {
        id: updatedUser.id,
        cognitoId: updatedUser.cognitoId,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        active: updatedUser.active,
        crm: updatedUser.doctor.crm,
        specialty: updatedUser.doctor.specialty,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    }

    return {
      id: updatedUser.id,
      cognitoId: updatedUser.cognitoId,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
```

### Controller Changes

**AuthController (Modificado)**
```typescript
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    // SignUpUseCase REMOVIDO
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  // ... outros métodos mantidos ...

  // MÉTODO REMOVIDO: signUp()

  @Get('me')
  @ApiOperation({ summary: 'Obter informações do usuário atual' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Informações do usuário obtidas com sucesso',
    type: AdminProfileResponseDto,
    examples: {
      admin: {
        value: {
          id: 'uuid',
          cognitoId: 'cognito-sub',
          email: 'admin@trya.com',
          name: 'João Silva',
          role: 'ADMIN',
          phone: '+5511999999999',
          active: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      doctor: {
        value: {
          id: 'uuid',
          cognitoId: 'cognito-sub',
          email: 'doctor@trya.com',
          name: 'Dr. Maria Santos',
          role: 'DOCTOR',
          phone: '+5511888888888',
          active: true,
          crm: '123456-SP',
          specialty: 'Cardiologia',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getCurrentUser(
    @CurrentUser() user: any,
  ): Promise<AdminProfileResponseDto | DoctorProfileResponseDto> {
    return this.getCurrentUserUseCase.execute(user.userId, user.role);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil atualizado com sucesso',
    type: AdminProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<AdminProfileResponseDto | DoctorProfileResponseDto> {
    return this.updateProfileUseCase.execute(user.userId, user.role, dto);
  }
}
```

## Email Templates

### Template Strategy

**EmailTemplateService (Modificado)**
```typescript
@Injectable()
export class EmailTemplateService {
  // ... métodos existentes ...

  /**
   * Renderiza template de boas-vindas para ADMIN
   */
  renderWelcomeAdminEmail(data: {
    name: string;
    email: string;
    temporaryPassword: string;
    loginUrl: string;
  }): { html: string; text: string } {
    const html = this.loadTemplate('welcome-admin-email.html')
      .replace('{{name}}', data.name)
      .replace('{{email}}', data.email)
      .replace('{{temporaryPassword}}', data.temporaryPassword)
      .replace('{{loginUrl}}', data.loginUrl);

    const text = this.loadTemplate('welcome-admin-email.txt')
      .replace('{{name}}', data.name)
      .replace('{{email}}', data.email)
      .replace('{{temporaryPassword}}', data.temporaryPassword)
      .replace('{{loginUrl}}', data.loginUrl);

    return { html, text };
  }

  /**
   * Renderiza template de boas-vindas para DOCTOR (já existe, mas será modificado)
   */
  renderWelcomeDoctorEmail(data: {
    name: string;
    email: string;
    crm: string;
    specialty: string;
    temporaryPassword: string;
    loginUrl: string;
  }): { html: string; text: string } {
    // Implementação existente será mantida
    // ...
  }

  private loadTemplate(filename: string): string {
    const templatePath = path.join(__dirname, 'templates', filename);
    return fs.readFileSync(templatePath, 'utf-8');
  }
}
```

### Template Content

**welcome-admin-email.html**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bem-vindo à Plataforma Trya</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50;">Bem-vindo à Plataforma Trya</h1>
    
    <p>Olá <strong>{{name}}</strong>,</p>
    
    <p>Sua conta de administrador foi criada com sucesso na Plataforma Trya.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Suas credenciais de acesso:</h3>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Senha temporária:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">{{temporaryPassword}}</code></p>
    </div>
    
    <p><strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar sua senha no primeiro acesso.</p>
    
    <h3>Suas permissões administrativas incluem:</h3>
    <ul>
      <li>Gerenciar usuários e médicos</li>
      <li>Configurar módulos da plataforma</li>
      <li>Acessar relatórios e métricas</li>
      <li>Gerenciar configurações do sistema</li>
    </ul>
    
    <div style="margin: 30px 0;">
      <a href="{{loginUrl}}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Plataforma</a>
    </div>
    
    <p style="color: #6c757d; font-size: 14px;">Se você não solicitou esta conta, por favor entre em contato com o suporte imediatamente.</p>
  </div>
</body>
</html>
```

**welcome-admin-email.txt**
```
Bem-vindo à Plataforma Trya

Olá {{name}},

Sua conta de administrador foi criada com sucesso na Plataforma Trya.

SUAS CREDENCIAIS DE ACESSO:
Email: {{email}}
Senha temporária: {{temporaryPassword}}

⚠️ IMPORTANTE: Por segurança, você será solicitado a alterar sua senha no primeiro acesso.

SUAS PERMISSÕES ADMINISTRATIVAS INCLUEM:
- Gerenciar usuários e médicos
- Configurar módulos da plataforma
- Acessar relatórios e métricas
- Gerenciar configurações do sistema

Acesse a plataforma em: {{loginUrl}}

Se você não solicitou esta conta, por favor entre em contato com o suporte imediatamente.
```


## Notification Repository Changes

### INotificationRepository (Modificado)

```typescript
export interface INotificationRepository {
  /**
   * Envia email de boas-vindas para novo DOCTOR
   */
  sendWelcomeDoctorEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
    crm: string,
    specialty: string,
  ): Promise<void>;

  /**
   * Envia email de boas-vindas para novo ADMIN
   */
  sendWelcomeAdminEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void>;

  /**
   * Envia notificação para administradores (mantido)
   */
  sendAdminNotification(
    adminEmail: string,
    doctorName: string,
    doctorEmail: string,
  ): Promise<void>;
}
```

### ConsoleNotificationRepository (Modificado)

```typescript
@Injectable()
export class ConsoleNotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(ConsoleNotificationRepository.name);

  async sendWelcomeDoctorEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
    crm: string,
    specialty: string,
  ): Promise<void> {
    this.logger.log('=== EMAIL DE BOAS-VINDAS - DOCTOR ===');
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Bem-vindo à Plataforma Trya`);
    this.logger.log(`\nConteúdo:`);
    this.logger.log(`Olá Dr(a). ${name},`);
    this.logger.log(`\nSua conta médica foi criada com sucesso.`);
    this.logger.log(`\nCRM: ${crm}`);
    this.logger.log(`Especialidade: ${specialty}`);
    this.logger.log(`Email: ${email}`);
    this.logger.log(`Senha temporária: ${temporaryPassword}`);
    this.logger.log(`\nAcesse: ${loginUrl}`);
    this.logger.log('=====================================\n');
  }

  async sendWelcomeAdminEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    this.logger.log('=== EMAIL DE BOAS-VINDAS - ADMIN ===');
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Bem-vindo à Plataforma Trya`);
    this.logger.log(`\nConteúdo:`);
    this.logger.log(`Olá ${name},`);
    this.logger.log(`\nSua conta de administrador foi criada com sucesso.`);
    this.logger.log(`Email: ${email}`);
    this.logger.log(`Senha temporária: ${temporaryPassword}`);
    this.logger.log(`\nAcesse: ${loginUrl}`);
    this.logger.log('=====================================\n');
  }

  async sendAdminNotification(
    adminEmail: string,
    doctorName: string,
    doctorEmail: string,
  ): Promise<void> {
    // Implementação existente mantida
  }
}
```

### SESNotificationRepository (Modificado)

```typescript
@Injectable()
export class SESNotificationRepository implements INotificationRepository {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(SESNotificationRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async sendWelcomeDoctorEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
    crm: string,
    specialty: string,
  ): Promise<void> {
    try {
      const { html, text } = this.emailTemplateService.renderWelcomeDoctorEmail({
        name,
        email,
        crm,
        specialty,
        temporaryPassword,
        loginUrl,
      });

      await this.sendEmail(email, 'Bem-vindo à Plataforma Trya', html, text);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de boas-vindas para doctor: ${error.message}`);
      throw error;
    }
  }

  async sendWelcomeAdminEmail(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    try {
      const { html, text } = this.emailTemplateService.renderWelcomeAdminEmail({
        name,
        email,
        temporaryPassword,
        loginUrl,
      });

      await this.sendEmail(email, 'Bem-vindo à Plataforma Trya', html, text);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de boas-vindas para admin: ${error.message}`);
      throw error;
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
  ): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.configService.get('AWS_SES_FROM_EMAIL'),
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
      },
    });

    await this.sesClient.send(command);
  }

  async sendAdminNotification(
    adminEmail: string,
    doctorName: string,
    doctorEmail: string,
  ): Promise<void> {
    // Implementação existente mantida
  }
}
```

## Use Case Updates

### CreateAdminUseCase (Modificado)

```typescript
@Injectable()
export class CreateAdminUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly passwordGeneratorService: PasswordGeneratorService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateAdminDto): Promise<CreateAdminResponseDto> {
    // Verificar se usuário já existe
    const exists = await this.userRepository.userExists(dto.email);
    if (exists) {
      throw new UserAlreadyExistsError();
    }

    // Gerar ou usar senha temporária
    const temporaryPassword = dto.temporaryPassword || 
      this.passwordGeneratorService.generateTemporaryPassword();

    let cognitoUser;
    try {
      // Criar usuário no Cognito
      cognitoUser = await this.userRepository.createUser({
        email: dto.email,
        name: dto.name,
        role: UserRole.ADMIN,
        phoneNumber: dto.phoneNumber,
        temporaryPassword,
      });

      // Atribuir role no Cognito
      await this.userRepository.assignRole(dto.email, UserRole.ADMIN);

      // Criar usuário no PostgreSQL
      const user = await this.userDbRepository.create({
        cognitoId: cognitoUser.sub,
        email: dto.email,
        name: dto.name,
        role: UserRole.ADMIN,
        phone: dto.phoneNumber,
      });

      // Atualizar custom attribute no Cognito com user_id do PostgreSQL
      try {
        await this.userRepository.updateCustomAttribute(
          dto.email,
          'user_id',
          user.id,
        );
      } catch (error) {
        this.logger.warn(`Falha ao atualizar custom attribute user_id: ${error.message}`);
      }

      // Enviar email de boas-vindas personalizado para ADMIN
      try {
        const loginUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000/login');
        await this.notificationRepository.sendWelcomeAdminEmail(
          dto.email,
          dto.name,
          temporaryPassword,
          loginUrl,
        );
      } catch (error) {
        this.logger.error(`Falha ao enviar email de boas-vindas: ${error.message}`);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      // Rollback: deletar usuário do Cognito se criação no PostgreSQL falhar
      if (cognitoUser) {
        try {
          await this.userRepository.deleteUser(dto.email);
        } catch (rollbackError) {
          this.logger.error(
            `ERRO CRÍTICO: Falha no rollback do Cognito. ` +
            `Usuário órfão criado: email=${dto.email}, cognitoId=${cognitoUser.sub}. ` +
            `Limpeza manual necessária.`,
          );
        }
      }
      throw new DatabaseSaveFailedError();
    }
  }
}
```

### CreateDoctorUseCase (Modificado)

```typescript
// Similar ao CreateAdminUseCase, mas chama sendWelcomeDoctorEmail
// com os parâmetros adicionais crm e specialty
async execute(dto: CreateDoctorDto): Promise<CreateDoctorResponseDto> {
  // ... código existente até a criação do doctor ...

  // Enviar email de boas-vindas personalizado para DOCTOR
  try {
    const loginUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000/login');
    await this.notificationRepository.sendWelcomeDoctorEmail(
      dto.email,
      dto.name,
      temporaryPassword,
      loginUrl,
      dto.crm,
      dto.specialty,
    );
  } catch (error) {
    this.logger.error(`Falha ao enviar email de boas-vindas: ${error.message}`);
  }

  // ... resto do código ...
}
```

## Module Configuration

### AuthModule (Modificado)

```typescript
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
    UsersModule, // NOVO: Importar UsersModule para acessar repositórios
  ],
  providers: [
    // Repositório Cognito (mantido)
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: CognitoAuthRepository,
    },
    // Estratégias (mantidas)
    JwtStrategy,
    // Casos de Uso (SignUpUseCase REMOVIDO)
    SignInUseCase,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ConfirmForgotPasswordUseCase,
    GetCurrentUserUseCase, // Modificado para usar repositórios do UsersModule
    UpdateProfileUseCase,  // Modificado para usar repositórios do UsersModule
    // Guards (mantidos)
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController], // Método signUp removido
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
```

### UsersModule (Modificado - Exports)

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DoctorEntity]),
    ConfigModule,
  ],
  providers: [
    // ... providers existentes ...
  ],
  controllers: [UsersController, DoctorsController],
  exports: [
    USER_REPOSITORY_TOKEN,
    USER_DB_REPOSITORY_TOKEN,
    DOCTOR_REPOSITORY_TOKEN,
    NOTIFICATION_REPOSITORY_TOKEN, // NOVO: Exportar para uso no AuthModule
  ],
})
export class UsersModule {}
```

## Data Flow Diagrams

### GET /auth/me Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ GET /auth/me
       │ Authorization: Bearer <JWT>
       ▼
┌─────────────────────┐
│  JwtAuthGuard       │ Valida JWT e extrai userId + role
└──────┬──────────────┘
       │ { userId, role }
       ▼
┌─────────────────────┐
│  AuthController     │
│  getCurrentUser()   │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│  GetCurrentUserUseCase   │
│  execute(userId, role)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  IUserDbRepository       │
│  findById(userId,        │
│    includeDoctor: bool)  │
└──────┬───────────────────┘
       │
       ├─ if role === ADMIN
       │  └─> AdminProfileResponseDto
       │
       └─ if role === DOCTOR
          └─> DoctorProfileResponseDto
                (includes crm, specialty)
```

### PATCH /auth/profile Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ PATCH /auth/profile
       │ Body: { name?, phone?, crm?, specialty? }
       ▼
┌─────────────────────┐
│  JwtAuthGuard       │
└──────┬──────────────┘
       │ { userId, role }
       ▼
┌─────────────────────┐
│  AuthController     │
│  updateProfile()    │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│  UpdateProfileUseCase    │
│  execute(userId, role,   │
│          dto)            │
└──────┬───────────────────┘
       │
       ├─ Update users table (name, phone)
       │  via IUserDbRepository.update()
       │
       └─ if role === DOCTOR && (crm || specialty)
          └─ Update doctors table
             via IDoctorRepository.update()
       │
       ▼
┌──────────────────────────┐
│  Fetch updated data      │
│  Return role-specific DTO│
└──────────────────────────┘
```


## Error Handling

### Error Mapping

| Scenario | Error Thrown | HTTP Status | Response Message |
|----------|--------------|-------------|------------------|
| JWT inválido/expirado | UnauthorizedException | 401 | "Token inválido ou expirado" |
| Usuário não encontrado no DB | UserNotFoundError | 404 | "Usuário não encontrado" |
| Tentativa de atualizar email | ValidationError | 400 | "Email não pode ser alterado" |
| Validação de campos falha | ValidationError | 400 | "Dados inválidos: [detalhes]" |
| Falha ao atualizar DB | DatabaseSaveFailedError | 500 | "Falha ao atualizar perfil" |

### Validation Rules

**UpdateAdminProfileDto**
- `name`: opcional, string, mínimo 3 caracteres
- `phone`: opcional, string, formato E.164 (+5511999999999)

**UpdateDoctorProfileDto**
- Herda validações de UpdateAdminProfileDto
- `crm`: opcional, string
- `specialty`: opcional, string

**Campos Proibidos**
- `email`: Não pode ser atualizado via PATCH /auth/profile
- `role`: Não pode ser atualizado via PATCH /auth/profile
- `cognitoId`: Não pode ser atualizado via PATCH /auth/profile
- `active`: Não pode ser atualizado via PATCH /auth/profile

## Security Considerations

### Authorization

1. **JWT Validation**: Todos os endpoints de perfil requerem JWT válido
2. **User Ownership**: Usuário só pode acessar/atualizar seu próprio perfil
3. **Role-Based Fields**: Sistema ignora silenciosamente campos não permitidos para a role
4. **Immutable Fields**: Email, role, cognitoId não podem ser alterados

### Data Protection

1. **Sensitive Data**: CognitoId não é exposto em logs
2. **Password Handling**: Senhas temporárias apenas em emails, nunca em responses
3. **Email Security**: Templates não expõem informações de outros usuários
4. **Logging**: Logs não incluem tokens completos ou senhas

### Input Validation

1. **DTO Validation**: class-validator em todos os DTOs
2. **Phone Format**: Validação de formato E.164
3. **String Length**: Limites mínimos/máximos aplicados
4. **Type Safety**: TypeScript garante tipos corretos

## Testing Strategy

### Unit Tests

**GetCurrentUserUseCase**
- ✓ Deve retornar AdminProfileResponseDto para role ADMIN
- ✓ Deve retornar DoctorProfileResponseDto para role DOCTOR
- ✓ Deve incluir crm e specialty para DOCTOR
- ✓ Deve lançar UserNotFoundError se usuário não existe
- ✓ Deve fazer eager loading de doctor apenas para role DOCTOR

**UpdateProfileUseCase**
- ✓ Deve atualizar name e phone para ADMIN
- ✓ Deve atualizar name, phone, crm, specialty para DOCTOR
- ✓ Deve ignorar crm/specialty para ADMIN
- ✓ Deve lançar UserNotFoundError se usuário não existe
- ✓ Deve retornar dados atualizados no formato correto

**EmailTemplateService**
- ✓ Deve renderizar template de admin com todos os campos
- ✓ Deve renderizar template de doctor com CRM e specialty
- ✓ Deve substituir todas as variáveis corretamente
- ✓ Deve retornar HTML e texto plano

**NotificationRepository**
- ✓ ConsoleNotificationRepository deve logar formato correto
- ✓ SESNotificationRepository deve enviar email via SES
- ✓ Deve usar templates corretos baseado na role

### Integration Tests

**GET /auth/me**
- ✓ Deve retornar 401 sem JWT
- ✓ Deve retornar 404 se usuário não existe
- ✓ Deve retornar dados de ADMIN sem campos de doctor
- ✓ Deve retornar dados de DOCTOR com crm e specialty

**PATCH /auth/profile**
- ✓ Deve atualizar name e phone para ADMIN
- ✓ Deve atualizar todos os campos para DOCTOR
- ✓ Deve ignorar campos não permitidos
- ✓ Deve retornar 400 para dados inválidos
- ✓ Deve retornar dados atualizados

**POST /auth/sign-up**
- ✓ Endpoint não deve existir (404)

**POST /users e POST /doctors**
- ✓ Deve enviar email personalizado correto
- ✓ Deve criar usuário com sucesso
- ✓ Email deve conter informações específicas da role

### E2E Tests

**Fluxo Completo - ADMIN**
1. Admin cria novo ADMIN via POST /users
2. Email de boas-vindas é enviado com template de admin
3. Novo admin faz login
4. Acessa GET /auth/me e recebe AdminProfileResponseDto
5. Atualiza perfil via PATCH /auth/profile
6. Verifica dados atualizados

**Fluxo Completo - DOCTOR**
1. Admin cria novo DOCTOR via POST /doctors
2. Email de boas-vindas é enviado com template de doctor
3. Novo doctor faz login
4. Acessa GET /auth/me e recebe DoctorProfileResponseDto com CRM
5. Atualiza perfil incluindo CRM via PATCH /auth/profile
6. Verifica dados atualizados incluindo CRM

## Migration Plan

### Phase 1: Preparation
1. Criar novos DTOs (AdminProfileResponseDto, DoctorProfileResponseDto)
2. Criar templates de email para admin
3. Atualizar EmailTemplateService
4. Atualizar INotificationRepository interface

### Phase 2: Implementation
1. Modificar GetCurrentUserUseCase
2. Modificar UpdateProfileUseCase
3. Atualizar AuthController (remover signUp)
4. Atualizar notification repositories
5. Atualizar CreateAdminUseCase e CreateDoctorUseCase

### Phase 3: Testing
1. Executar testes unitários
2. Executar testes de integração
3. Executar testes E2E
4. Validar emails em ambiente de desenvolvimento

### Phase 4: Cleanup
1. Remover SignUpUseCase e arquivos relacionados
2. Remover SignUpDto e SignUpResponseDto
3. Remover testes de signup do AuthController
4. Atualizar documentação Swagger
5. Atualizar README

### Phase 5: Deployment
1. Deploy em ambiente de staging
2. Validação manual de todos os fluxos
3. Deploy em produção
4. Monitoramento de logs e erros

## Performance Considerations

### Database Queries

**Eager Loading Condicional**
- Carregar relação `doctor` apenas quando `role === DOCTOR`
- Evita JOIN desnecessário para usuários ADMIN
- Reduz payload de resposta

**Query Optimization**
```typescript
// Antes (sempre carrega doctor)
findById(userId) {
  return this.repository.findOne({
    where: { id: userId },
    relations: ['doctor'], // Sempre carrega
  });
}

// Depois (carrega condicionalmente)
findById(userId, includeDoctor = false) {
  const query = this.repository.findOne({
    where: { id: userId },
  });
  
  if (includeDoctor) {
    query.relations = ['doctor'];
  }
  
  return query;
}
```

### Response Size

**AdminProfileResponseDto**: ~200 bytes
**DoctorProfileResponseDto**: ~250 bytes (inclui CRM e specialty)

Redução de ~20% no payload para usuários ADMIN ao não incluir campos desnecessários.

### Email Sending

- Emails são enviados de forma assíncrona
- Falhas em email não bloqueiam criação de usuário
- Logs detalhados para troubleshooting

## Monitoring and Logging

### Key Metrics

1. **Profile Access Rate**: Frequência de acesso ao GET /auth/me
2. **Profile Update Rate**: Frequência de atualizações via PATCH /auth/profile
3. **Email Delivery Rate**: Taxa de sucesso de envio de emails
4. **Error Rate**: Taxa de erros por endpoint

### Log Events

```typescript
// Sucesso
logger.log(`Perfil acessado: userId=${userId}, role=${role}`);
logger.log(`Perfil atualizado: userId=${userId}, fields=${Object.keys(dto)}`);
logger.log(`Email de boas-vindas enviado: email=${email}, role=${role}`);

// Erros
logger.error(`Falha ao buscar perfil: userId=${userId}, error=${error.message}`);
logger.error(`Falha ao atualizar perfil: userId=${userId}, error=${error.message}`);
logger.warn(`Falha ao enviar email: email=${email}, error=${error.message}`);
```

### Alerts

- **Critical**: Taxa de erro > 5% em endpoints de perfil
- **Warning**: Taxa de falha de email > 10%
- **Info**: Novo usuário criado com sucesso

## Documentation Updates

### Swagger Examples

**GET /auth/me - Response Examples**
```yaml
responses:
  200:
    description: Perfil do usuário
    content:
      application/json:
        examples:
          admin:
            summary: Perfil de Administrador
            value:
              id: "uuid"
              cognitoId: "cognito-sub"
              email: "admin@trya.com"
              name: "João Silva"
              role: "ADMIN"
              phone: "+5511999999999"
              active: true
              createdAt: "2024-01-01T00:00:00.000Z"
              updatedAt: "2024-01-01T00:00:00.000Z"
          doctor:
            summary: Perfil de Médico
            value:
              id: "uuid"
              cognitoId: "cognito-sub"
              email: "doctor@trya.com"
              name: "Dr. Maria Santos"
              role: "DOCTOR"
              phone: "+5511888888888"
              active: true
              crm: "123456-SP"
              specialty: "Cardiologia"
              createdAt: "2024-01-01T00:00:00.000Z"
              updatedAt: "2024-01-01T00:00:00.000Z"
```

### README Updates

```markdown
## Criação de Usuários

### Criar Administrador
```bash
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "admin@trya.com",
  "name": "João Silva",
  "phoneNumber": "+5511999999999",
  "temporaryPassword": "Optional123!" // opcional
}
```

### Criar Médico
```bash
POST /doctors
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "doctor@trya.com",
  "name": "Dr. Maria Santos",
  "phoneNumber": "+5511888888888",
  "crm": "123456-SP",
  "specialty": "Cardiologia",
  "temporaryPassword": "Optional123!" // opcional
}
```

## Gerenciamento de Perfil

### Obter Perfil Atual
```bash
GET /auth/me
Authorization: Bearer <token>
```

### Atualizar Perfil
```bash
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

# Para ADMIN
{
  "name": "João Silva Atualizado",
  "phone": "+5511888888888"
}

# Para DOCTOR (pode incluir campos adicionais)
{
  "name": "Dr. Maria Santos Atualizada",
  "phone": "+5511777777777",
  "crm": "654321-SP",
  "specialty": "Cardiologia Pediátrica"
}
```
```

## Dependencies

Nenhuma nova dependência necessária. Todas as bibliotecas já estão instaladas:
- `@nestjs/common`
- `@nestjs/jwt`
- `@nestjs/passport`
- `@nestjs/swagger`
- `@nestjs/typeorm`
- `class-validator`
- `class-transformer`
- `@aws-sdk/client-ses`

## Rollback Plan

Se problemas forem encontrados após deploy:

1. **Reverter código**: Git revert para commit anterior
2. **Restaurar endpoint signup**: Temporariamente reativar se necessário
3. **Verificar dados**: Garantir que nenhum dado foi corrompido
4. **Logs**: Analisar logs para identificar causa raiz
5. **Hotfix**: Aplicar correção específica se identificada

## Summary

Este design implementa melhorias significativas no sistema de perfil de usuários:

✅ **Endpoint /me personalizado** - Retorna dados específicos por role
✅ **Atualização de perfil flexível** - Campos permitidos variam por role
✅ **Templates de email customizados** - Boas-vindas personalizadas
✅ **Remoção de signup público** - Maior controle sobre criação de contas
✅ **Integração limpa** - AuthModule e UsersModule trabalham juntos
✅ **Segurança aprimorada** - Validações e autorizações robustas
✅ **Performance otimizada** - Eager loading condicional
✅ **Testabilidade** - Cobertura completa de testes
