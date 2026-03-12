import { Injectable, Logger } from '@nestjs/common';
import { CreateAdminDto } from './create-admin.dto';
import { CreateAdminResponseDto } from './create-admin-response.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { ConfigService } from '@nestjs/config';
import { PasswordGeneratorService } from '../../../../../shared/application/services/password-generator.service';
import type { IBeneficiaryDbRepository } from '../../../domain/repositories/beneficiary-db.repository.interface';
import { BENEFICIARY_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-db.repository.token';
import { DatabaseSaveFailedError } from '../../../domain/errors/database-save-failed.error';
import { User } from 'src/database/entities/user.entity';
import { UserAlreadyExistsError } from 'src/shared/domain/errors/user-already-exists.error';

@Injectable()
export class CreateAdminUseCase {
  private readonly logger = new Logger(CreateAdminUseCase.name);
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(BENEFICIARY_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IBeneficiaryDbRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly configService: ConfigService,
    private readonly passwordGeneratorService: PasswordGeneratorService,
  ) {}

  async execute(
    createAdminDto: CreateAdminDto,
  ): Promise<CreateAdminResponseDto> {
    const { email, name, tenantId, temporaryPassword, cpf } = createAdminDto;

    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.userExists(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // Gerar senha temporária se não fornecida
    const finalTemporaryPassword =
      temporaryPassword ||
      this.passwordGeneratorService.generateTemporaryPassword();

    // Criar o usuário admin
    const user = await this.userRepository.createUser({
      email,
      name,
      role: UserRole.ADMIN,
      tenantId,
      temporaryPassword: finalTemporaryPassword,
      phoneNumber: createAdminDto.phoneNumber,
      cpf: cpf,
    });

    // Definir senha como permanente para evitar status FORCE_CHANGE_PASSWORD
    await this.userRepository.setPasswordPermanent(
      user.username,
      finalTemporaryPassword,
    );

    // Atribuir role de ADMIN
    await this.userRepository.assignRole(user.username, UserRole.ADMIN);

    // Salvar admin no PostgreSQL
    let userCreated: User;
    try {
      userCreated = await this.userDbRepository.create({
        cognitoId: user.id,
        email,
        name,
        cpf: createAdminDto.cpf,
        tenantId,
        phone: createAdminDto.phoneNumber,
        birthDate: new Date(),
        type: UserRole.ADMIN,
      });

      // Atualizar Cognito com userId do banco
      await this.userRepository.updateCustomAttribute(
        email,
        'userId',
        userCreated.id,
      );
    } catch (dbError) {
      this.logger.error(`Erro ao salvar admin no PostgreSQL: ${dbError}`);
      this.logger.warn('Iniciando rollback: removendo usuário do Cognito...');

      try {
        await this.userRepository.deleteUser(email);
        this.logger.log(
          `Rollback concluído: usuário removido do Cognito (email: ${email})`,
        );
      } catch (rollbackError) {
        this.logger.error(
          'ERRO CRÍTICO: Falha ao fazer rollback do Cognito',
          rollbackError,
        );
        this.logger.error(
          'Ação necessária: Remover manualmente o usuário do Cognito:',
          {
            email,
            cognitoId: user.id,
            username: user.username,
          },
        );
      }

      const errorMessage =
        dbError instanceof Error ? dbError.message : 'Erro desconhecido';
      throw new DatabaseSaveFailedError(
        `Falha ao criar admin no banco de dados: ${errorMessage}`,
      );
    }

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
        'BROKER',
        tenantName,
        finalTemporaryPassword,
        loginUrl,
      );
    } catch (emailError) {
      // Log do erro mas não falha a criação do usuário
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
