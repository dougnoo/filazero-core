import { Injectable, Inject, Logger } from '@nestjs/common';
import * as authRepositoryInterface from '../../../domain/repositories/auth.repository.interface';
import { ChangePasswordDto } from './change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(authRepositoryInterface.AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: authRepositoryInterface.IAuthRepository,
  ) {}

  async execute(accessToken: string, dto: ChangePasswordDto): Promise<void> {
    this.logger.log('[execute] Changing password for authenticated user');

    await this.authRepository.changePasswordAuthenticated(
      accessToken,
      dto.currentPassword,
      dto.newPassword,
    );

    this.logger.log('[execute] Password changed successfully');
  }
}
