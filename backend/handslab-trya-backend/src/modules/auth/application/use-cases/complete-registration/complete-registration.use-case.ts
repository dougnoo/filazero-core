import { Injectable, Inject } from '@nestjs/common';
import type { IBeneficiaryDbRepository } from '../../../../user-management/domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/beneficiary-db.repository.token';
import type { IUserRepository } from '../../../../user-management/domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../../user-management/domain/repositories/user.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import {
  CompleteRegistrationDto,
  CompleteRegistrationResponseDto,
} from './complete-registration.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { OnboardingTokenService } from '../../../infrastructure/services/onboarding-token.service';
import { PasswordUtils } from 'src/shared/utils/password.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CompleteRegistrationUseCase {
  constructor(
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryDbRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly onboardingTokenService: OnboardingTokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: CompleteRegistrationDto,
  ): Promise<CompleteRegistrationResponseDto> {
    const tokenData = this.onboardingTokenService.verifyToken(
      dto.registrationHash,
    );

    if (tokenData.step !== 'birthdate_verified') {
      throw new Error('Token inválido para esta etapa');
    }

    const user = await this.beneficiaryRepository.findById(tokenData.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const emailExists = await this.beneficiaryRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new Error('Email já cadastrado');
    }

    const tempPassword = PasswordUtils.generateTempPassword();

    const formattedPhone =
      dto.phone && dto.phone.trim()
        ? dto.phone.startsWith('+55')
          ? dto.phone
          : `+55${dto.phone}`
        : '+55000000000';

    const cognitoUser = await this.userRepository.createUser({
      email: dto.email,
      name: user.name,
      cpf: user.cpf ?? '',
      tenantId: user.tenantId ?? undefined,
      role: user.type,
      temporaryPassword: tempPassword,
      phoneNumber: formattedPhone,
    });

    await this.userRepository.updateUser(dto.email, {
      userId: user.id,
    });

    await this.userRepository.assignRole(
      cognitoUser.username,
      user.type,
    );

    await this.beneficiaryRepository.updateDb(user.id, {
      cognitoId: cognitoUser.id,
      email: dto.email,
      phone: formattedPhone,
    });

    const baseUrl = this.configService.get<string>(
      'app.frontendUrl',
      'http://localhost:3000',
    );
    const tenantName: string = user.tenant?.name ?? 'Sistema Trya';
    const tenantSlug = user.tenant?.id;
    const loginUrl = `${baseUrl}/login?tenant=${tenantSlug}`;

    await this.notificationRepository.sendWelcomeBeneficiaryEmail(
      dto.email,
      user.name,
      tenantName,
      tempPassword,
      loginUrl,
    );

    return {
      message: 'Cadastro concluído. Verifique seu email para primeiro acesso.',
      email: dto.email,
    };
  }
}
