import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateHrDto } from './create-hr.dto';
import { CreateHrResponseDto } from './create-hr-response.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { ConfigService } from '@nestjs/config';
import { PasswordGeneratorService } from '../../../../../shared/application/services/password-generator.service';

import { CpfAlreadyExistsError } from '../../../domain/errors/cpf-already-exists.error';
import { TenantIdRequiredError } from '../../../domain/errors/tenant-id-required.error';
import { InsufficientPermissionsError } from '../../../domain/errors/insufficient-permissions.error';
import type { User as AuthUser } from '../../../../auth/domain/entities/user.entity';
import { UserAlreadyExistsError } from 'src/shared/domain/errors/user-already-exists.error';

@Injectable()
export class CreateHrUseCase {
  private readonly logger = new Logger(CreateHrUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly beneficiaryDbRepository: IBeneficiaryDbRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly configService: ConfigService,
    private readonly passwordGeneratorService: PasswordGeneratorService,
  ) {}

  async execute(
    createHrDto: CreateHrDto,
    currentUser: AuthUser,
  ): Promise<CreateHrResponseDto> {
    const { email, name, cpf, birthDate, temporaryPassword } = createHrDto;

    let tenantId: string;
    if (
      currentUser.role === UserRole.SUPER_ADMIN ||
      currentUser.role === UserRole.ADMIN
    ) {
      if (!createHrDto.tenantId) {
        throw new TenantIdRequiredError();
      }
      tenantId = createHrDto.tenantId;
    } else if (currentUser.role === UserRole.HR) {
      tenantId = currentUser.tenantId;
    } else {
      throw new InsufficientPermissionsError(
        'Usuário não tem permissão para criar HR',
      );
    }

    this.logger.log(`Criando HR: ${email} para tenant: ${tenantId}`);

    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.userExists(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const cleanCpf = cpf.replace(/[^\d]/g, '');
    const existingCpf = await this.beneficiaryDbRepository.findByCpf(cleanCpf);
    if (existingCpf) {
      throw new CpfAlreadyExistsError();
    }

    // Gerar senha temporária se não fornecida
    const finalTemporaryPassword =
      temporaryPassword ||
      this.passwordGeneratorService.generateTemporaryPassword();

    // Criar o usuário HR
    const user = await this.userRepository.createUser({
      email,
      name,
      role: UserRole.HR,
      tenantId,
      temporaryPassword: finalTemporaryPassword,
      phoneNumber: createHrDto.phoneNumber,
      cpf: cleanCpf,
    });

    // Definir senha como permanente para evitar status FORCE_CHANGE_PASSWORD
    await this.userRepository.setPasswordPermanent(
      user.username,
      finalTemporaryPassword,
    );

    // Atribuir role de HR
    await this.userRepository.assignRole(user.username, UserRole.HR);

    await this.beneficiaryDbRepository.create({
      cognitoId: user.id,
      email,
      name,
      cpf: cleanCpf,
      tenantId,
      phone: createHrDto.phoneNumber,
      birthDate: new Date(birthDate),
      type: UserRole.HR,
    });

    // Enviar email de boas-vindas
    try {
      const loginUrl = this.configService.get<string>(
        'app.frontendUrl',
        'http://localhost:3000/login',
      );
      const tenantName = tenantId; // Por enquanto usar o ID, pode ser melhorado para buscar o nome real

      await this.notificationRepository.sendWelcomeAdminEmail(
        email,
        name,
        'RH',
        tenantName,
        finalTemporaryPassword,
        loginUrl,
      );
    } catch (emailError) {
      // Log do erro mas não falha a criação do usuário
      this.logger.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    this.logger.log(`HR criado com sucesso: ${email}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
