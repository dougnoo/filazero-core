import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import type { IBeneficiaryDbRepository } from '../../../../user-management/domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/beneficiary-db.repository.token';
import type { ITenantRepository } from '../../../../tenant/domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../../tenant/domain/repositories/tenant.repository.token';
import { Credentials } from '../../../domain/value-objects/credentials.vo';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { SignInDto } from './sign-in.dto';
import { SignInResponseDto } from './sign-in-response.dto';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import { NewPasswordRequiredError } from '../../../domain/errors/new-password-required.error';
import { TenantMismatchError } from '../../../domain/errors/tenant-mismatch.error';
import { InvalidRepositoryResponseError } from '../../../domain/errors/invalid-repository-response.error';
import { FirstLoginCPFError } from '../../../domain/errors/first-login-cpf.error';
import { CheckTermAcceptanceUseCase } from '../../../../terms/application/use-cases/check-term-acceptance/check-term-acceptance.use-case';
import { UserNotFoundError } from 'src/shared/domain/errors/user-not-found.error';
import { normalizeTenantName } from 'src/shared/domain/tenant-mapping';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IBeneficiaryDbRepository,
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
    private readonly userMapper: UserMapper,
    private readonly checkTermAcceptanceUseCase: CheckTermAcceptanceUseCase,
  ) {}

  /**
   * Resolve tenantName para tenantId
   * Se tenantId já estiver definido, retorna ele
   * Se tenantName estiver definido, busca o tenant pelo nome
   */
  private async resolveTenantId(dto: SignInDto): Promise<string | undefined> {
    if (dto.tenantId) {
      return dto.tenantId;
    }

    if (dto.tenantName) {
      const normalizedName = normalizeTenantName(dto.tenantName);
      const tenant = await this.tenantRepository.findByName(normalizedName);
      if (tenant) {
        return tenant.id;
      }
      // Se não encontrou pelo nome normalizado, tenta pelo nome original
      const tenantByOriginal = await this.tenantRepository.findByName(
        dto.tenantName,
      );
      return tenantByOriginal?.id;
    }

    return undefined;
  }

  async execute(dto: SignInDto): Promise<SignInResponseDto> {
    // Detectar se é email ou CPF
    const isEmail = dto.email.includes('@');
    const userExists = isEmail
      ? await this.userDbRepository.findByEmail(dto.email)
      : await this.userDbRepository.findByCpf(dto.email);

    if (!userExists) {
      throw new UserNotFoundError(dto.email);
    }

    if (
      userExists.cognitoId === null &&
      userExists.type === UserRole.BENEFICIARY
    ) {
      throw new FirstLoginCPFError();
    }

    // Validar que o usuário possui email cadastrado (necessário para autenticação)
    if (!userExists.email) {
      throw new InvalidRepositoryResponseError(
        'Usuário não possui email cadastrado para autenticação',
      );
    }

    // Criar value object de credenciais (com validação)
    // Usar email para autenticar (Cognito aceita email como alias)
    const credentials = Credentials.create(userExists.email, dto.password);

    // Autenticar com o repositório (Cognito)
    const result = await this.authRepository.signIn(credentials);

    // Se for um challenge NEW_PASSWORD_REQUIRED, gerar OTP e enviar
    if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
      // Gerar código OTP
      const otp = this.otpRepository.generateOtp();

      // Validar que o usuário tem email para receber o OTP
      if (!userExists.email) {
        throw new InvalidRepositoryResponseError(
          'Usuário não possui email cadastrado para receber OTP',
        );
      }

      // Armazenar OTP com expiração de 5 minutos para primeiro login
      await this.otpRepository.storeOtp(
        userExists.email,
        otp,
        300,
        OtpType.FIRST_LOGIN,
      );

      // Enviar OTP por email com branding do tenant
      await this.notificationRepository.sendOtpEmail(
        userExists.email,
        otp,
        result.user?.name,
        dto.tenantName,
      );

      throw new NewPasswordRequiredError(
        result.session || '',
        result.requiredAttributes || [],
      );
    }

    // Fluxo normal de autenticação bem-sucedida
    if (!result.tokens || !result.user) {
      throw new InvalidRepositoryResponseError(
        'Resposta inválida do repositório de autenticação',
      );
    }

    // Resolver e validar tenant se fornecido no DTO (por ID ou nome)
    const resolvedTenantId = await this.resolveTenantId(dto);
    if (resolvedTenantId && result.user.tenantId !== resolvedTenantId) {
      throw new TenantMismatchError();
    }

    // Verificar aceite de termos (não bloqueia login, apenas informa ao front)
    const missingTerms = await this.checkTermAcceptanceUseCase.execute(
      userExists.id,
    );

    // Retornar DTO de resposta com tokens + termos pendentes (se houver)
    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
      missingTerms: missingTerms.length > 0 ? missingTerms : undefined,
    };
  }
}
