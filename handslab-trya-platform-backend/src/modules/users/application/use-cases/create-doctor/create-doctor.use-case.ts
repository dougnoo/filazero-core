import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/repositories/doctor.repository.token';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { PasswordGeneratorService } from '../../services/password-generator.service';
import { UserAlreadyExistsError } from '../../../domain/errors/user-already-exists.error';
import { DatabaseSaveFailedError } from '../../../domain/errors/database-save-failed.error';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { CreateDoctorDto } from './create-doctor.dto';
import { CreateDoctorResponseDto } from './create-doctor-response.dto';

@Injectable()
export class CreateDoctorUseCase {
  private readonly logger = new Logger(CreateDoctorUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly configService: ConfigService,
    private readonly passwordGeneratorService: PasswordGeneratorService,
  ) {}

  async execute(dto: CreateDoctorDto): Promise<CreateDoctorResponseDto> {
    // Check if user already exists in Cognito
    const exists = await this.userRepository.userExists(dto.email);
    if (exists) {
      throw new UserAlreadyExistsError(dto.email);
    }

    // Generate or use provided temporary password
    const temporaryPassword =
      dto.temporaryPassword ||
      this.passwordGeneratorService.generateTemporaryPassword();

    let cognitoUser;
    let createdUser;
    let createdDoctor;

    try {
      // Create user in Cognito
      cognitoUser = await this.userRepository.createUser({
        email: dto.email,
        name: dto.name,
        role: UserRole.DOCTOR,
        phoneNumber: dto.phoneNumber,
        gender: dto.gender,
        temporaryPassword,
      });

      // Assign DOCTOR role in Cognito
      await this.userRepository.assignRole(
        cognitoUser.username,
        UserRole.DOCTOR,
      );

      try {
        // Create User record in PostgreSQL
        createdUser = await this.userDbRepository.create({
          cognitoId: cognitoUser.cognitoId,
          email: dto.email,
          name: dto.name,
          role: UserRole.DOCTOR,
          phone: dto.phoneNumber,
          gender: dto.gender,
        });

        // Create Doctor record in PostgreSQL
        createdDoctor = await this.doctorRepository.create({
          userId: createdUser.id,
          specialty: dto.specialty,
          boardCode: dto.boardCode,
          boardNumber: dto.boardNumber,
          boardState: dto.boardState,
        });
      } catch (error) {
        // PostgreSQL operation failed - rollback Cognito user
        this.logger.error(
          `PostgreSQL operation failed for user ${dto.email}. Attempting rollback...`,
          error,
        );

        try {
          await this.userRepository.deleteUser(dto.email);
          this.logger.log(`Successfully rolled back Cognito user ${dto.email}`);
        } catch (rollbackError) {
          // Rollback failed - log critical error with cleanup instructions
          this.logger.error(
            `CRITICAL: Failed to rollback Cognito user after PostgreSQL failure. Manual cleanup required!
            Email: ${dto.email}
            CognitoId: ${cognitoUser.cognitoId}
            Username: ${cognitoUser.username}
            Please manually delete this user from Cognito.`,
            rollbackError,
          );
        }

        throw new DatabaseSaveFailedError(
          `Failed to save user data to database: ${error.message}`,
        );
      }

      // Send welcome email notification (non-critical)
      try {
        const frontendUrl = this.configService.get<string>(
          'FRONTEND_URL',
          'http://localhost:3000/login',
        );

        await this.notificationRepository.sendWelcomeDoctorEmail(
          dto.email,
          dto.name,
          temporaryPassword,
          frontendUrl,
          dto.specialty,
        );
      } catch (error) {
        // Log error but don't fail the operation
        this.logger.error(
          `Failed to send welcome email to ${dto.email}: ${error.message}`,
          error,
        );
      }

      // Return response
      return {
        id: createdDoctor.id,
        email: createdUser.email,
        name: createdUser.name,
        gender: createdUser.gender,
        specialty: createdDoctor.specialty,
        boardCode: createdDoctor.boardCode!,
        boardNumber: createdDoctor.boardNumber!,
        boardState: createdDoctor.boardState!,
      };
    } catch (error) {
      // If error is already a domain error, rethrow it
      if (
        error instanceof UserAlreadyExistsError ||
        error instanceof DatabaseSaveFailedError
      ) {
        throw error;
      }

      // Otherwise, wrap in a generic error
      this.logger.error(`Unexpected error creating doctor ${dto.email}`, error);
      throw new DatabaseSaveFailedError(
        `Unexpected error creating doctor: ${error.message}`,
      );
    }
  }
}
