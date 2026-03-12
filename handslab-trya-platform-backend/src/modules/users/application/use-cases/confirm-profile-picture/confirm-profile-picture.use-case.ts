import { Inject, Injectable } from '@nestjs/common';
import { S3Service } from '../../../../../shared/infrastructure/services/s3.service';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { ConfirmProfilePictureDto } from './confirm-profile-picture.dto';
import { ConfirmProfilePictureResponseDto } from './confirm-profile-picture-response.dto';

@Injectable()
export class ConfirmProfilePictureUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    cognitoId: string,
    dto: ConfirmProfilePictureDto,
  ): Promise<ConfirmProfilePictureResponseDto> {
    // Find user by Cognito ID
    const user = await this.userDbRepository.findByCognitoId(cognitoId);
    if (!user) {
      throw new UserNotFoundError(cognitoId);
    }

    // Note: Old profile picture files remain in S3 for simplicity

    // Generate public URL from file key
    const profilePictureUrl = this.s3Service.getPublicUrl(dto.fileKey);

    // Update user with new profile picture URL
    await this.userDbRepository.update(user.id, {
      profilePictureUrl,
    });

    return {
      profilePictureUrl,
      message: 'Foto de perfil atualizada com sucesso',
    };
  }
}
