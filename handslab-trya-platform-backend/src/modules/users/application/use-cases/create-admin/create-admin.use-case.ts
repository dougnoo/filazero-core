import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { PasswordGeneratorService } from '../../services/password-generator.service';
import { UserAlreadyExistsError } from '../../../domain/errors/user-already-exists.error';
import { DatabaseSaveFailedError } from '../../../domain/errors/database-save-failed.error';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { CreateAdminDto } from './create-admin.dto';
import { CreateAdminResponseDto } from './create-admin-response.dto';

@Injectable()
export class CreateAdminUseCase {
  private readonly logger = new Logger(CreateAdminUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly configService: ConfigService,
    private readonly passwordGeneratorService: PasswordGeneratorService,
  ) {}

  async execute(dto: CreateAdminDto): Promise<CreateAdminResponseDto> {
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

    try {
      // Create user in Cognito
      cognitoUser = await this.userRepository.createUser({
        username: dto.username,
        email: dto.email,
        name: dto.name,
        role: UserRole.ADMIN,
        phoneNumber: dto.phoneNumber,
        gender: dto.gender,
        temporaryPassword,
      });

      // Assign ADMIN role in Cognito
      await this.userRepository.assignRole(
        cognitoUser.username,
        UserRole.ADMIN,
      );

      try {
        // Create User record in PostgreSQL
        createdUser = await this.userDbRepository.create({
          cognitoId: cognitoUser.cognitoId,
          email: dto.email,
          name: dto.name,
          role: UserRole.ADMIN,
          phone: dto.phoneNumber,
          gender: dto.gender,
        });

        // Note: Custom attributes in Cognito must be created in the User Pool schema first
        // If you need to store user_id in Cognito, create a custom:user_id attribute in AWS Console
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

        await this.notificationRepository.sendWelcomeAdminEmail(
          dto.email,
          dto.name,
          UserRole.ADMIN,
          temporaryPassword,
          frontendUrl,
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
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        gender: createdUser.gender,
        role: createdUser.role,
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
      this.logger.error(`Unexpected error creating admin ${dto.email}`, error);
      throw new DatabaseSaveFailedError(
        `Unexpected error creating admin: ${error.message}`,
      );
    }
  }
}
