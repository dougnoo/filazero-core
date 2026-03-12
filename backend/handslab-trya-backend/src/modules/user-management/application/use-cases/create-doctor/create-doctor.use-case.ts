import { Injectable, Logger } from '@nestjs/common';
import { CreateDoctorDto } from './create-doctor.dto';
import { CreateDoctorResponseDto } from './create-doctor-response.dto';
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
export class CreateDoctorUseCase {
  private readonly logger = new Logger(CreateDoctorUseCase.name);
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
    createDoctorDto: CreateDoctorDto,
  ): Promise<CreateDoctorResponseDto> {
    const { email, name, temporaryPassword, crm, specialty } = createDoctorDto;

    const existingUser = await this.userRepository.userExists(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const finalTemporaryPassword =
      temporaryPassword ||
      this.passwordGeneratorService.generateTemporaryPassword();

    const user = await this.userRepository.createUser({
      email,
      name,
      role: UserRole.DOCTOR,
      temporaryPassword: finalTemporaryPassword,
      phoneNumber: createDoctorDto.phoneNumber,
      cpf: '',
    });

    // Definir senha como permanente para evitar status FORCE_CHANGE_PASSWORD
    await this.userRepository.setPasswordPermanent(
      user.username,
      finalTemporaryPassword,
    );

    await this.userRepository.assignRole(user.username, UserRole.DOCTOR);

    // Salvar doctor no PostgreSQL
    let userCreated: User;
    try {
      userCreated = await this.userDbRepository.create({
        cognitoId: user.id,
        email,
        name,
        phone: createDoctorDto.phoneNumber,
        birthDate: new Date(),
        type: UserRole.DOCTOR,
      });

      // Atualizar Cognito com userId do banco
      await this.userRepository.updateCustomAttribute(
        email,
        'user_id',
        userCreated.id,
      );
    } catch (dbError) {
      this.logger.error(`Erro ao salvar doctor no PostgreSQL: ${dbError}`);
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
        `Falha ao criar doctor no banco de dados: ${errorMessage}`,
      );
    }

    try {
      const loginUrl = this.configService.get<string>(
        'app.frontendUrl',
        'http://localhost:3000/login',
      );

      await this.notificationRepository.sendWelcomeDoctorEmail(
        email,
        name,
        'Todas as Instituições', // Médicos atuam em todas as instituições
        finalTemporaryPassword,
        loginUrl,
        crm,
        specialty,
      );
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      crm,
      specialty,
    };
  }
}
