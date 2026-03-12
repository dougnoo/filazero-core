import { Injectable, Inject, Logger } from '@nestjs/common';
import * as authRepositoryInterface from '../../../domain/repositories/auth.repository.interface';
import { UpdatePasswordDto } from './update-password.dto';

@Injectable()
export class UpdatePasswordUseCase {
  private readonly logger = new Logger(UpdatePasswordUseCase.name);

  constructor(
    @Inject(authRepositoryInterface.AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: authRepositoryInterface.IAuthRepository,
  ) {}

  async execute(userEmail: string, dto: UpdatePasswordDto): Promise<void> {
    this.logger.log(
      '[execute] Updating password for user via admin API: %s',
      userEmail,
    );

    await this.authRepository.changeUserPassword(userEmail, dto.newPassword);

    this.logger.log('[execute] Password updated successfully');
  }
}
