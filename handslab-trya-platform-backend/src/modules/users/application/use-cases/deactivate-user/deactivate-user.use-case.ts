import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';

@Injectable()
export class DeactivateUserUseCase {
  private readonly logger = new Logger(DeactivateUserUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Find user by ID
    const user = await this.userDbRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    // Handle idempotent behavior - if already deactivated, return success
    if (!user.active) {
      this.logger.log(`User ${id} is already deactivated`);
      return;
    }

    // Set active=false in PostgreSQL
    await this.userDbRepository.deactivate(id);
    this.logger.log(`User ${id} deactivated in PostgreSQL`);

    // Disable user in Cognito
    try {
      await this.userRepository.disableUser(user.email);
      this.logger.log(`User ${id} disabled in Cognito`);
    } catch (error) {
      // Rollback: set active=true if Cognito fails
      this.logger.error(
        `Failed to disable user ${id} in Cognito, rolling back PostgreSQL change`,
        error,
      );

      try {
        await this.userDbRepository.reactivate(id);
        this.logger.log(`Successfully rolled back deactivation for user ${id}`);
      } catch (rollbackError) {
        this.logger.error(
          `Failed to rollback deactivation for user ${id}. Manual intervention required.`,
          rollbackError,
        );
      }

      throw error;
    }
  }
}
