import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';

@Injectable()
export class ActivateUserUseCase {
  private readonly logger = new Logger(ActivateUserUseCase.name);

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

    // Handle idempotent behavior - if already active, return success
    if (user.active) {
      this.logger.log(`User ${id} is already active`);
      return;
    }

    // Set active=true in PostgreSQL
    await this.userDbRepository.reactivate(id);
    this.logger.log(`User ${id} reactivated in PostgreSQL`);

    // Enable user in Cognito
    try {
      await this.userRepository.enableUser(user.email);
      this.logger.log(`User ${id} enabled in Cognito`);
    } catch (error) {
      // Rollback: set active=false if Cognito fails
      this.logger.error(
        `Failed to enable user ${id} in Cognito, rolling back PostgreSQL change`,
        error,
      );

      try {
        await this.userDbRepository.deactivate(id);
        this.logger.log(`Successfully rolled back activation for user ${id}`);
      } catch (rollbackError) {
        this.logger.error(
          `Failed to rollback activation for user ${id}. Manual intervention required.`,
          rollbackError,
        );
      }

      throw error;
    }
  }
}
