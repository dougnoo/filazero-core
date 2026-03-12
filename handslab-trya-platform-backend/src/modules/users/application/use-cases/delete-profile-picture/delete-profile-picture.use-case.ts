import { Inject, Injectable } from '@nestjs/common';
import { S3Service } from '../../../../../shared/infrastructure/services/s3.service';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { DeleteProfilePictureResponseDto } from './delete-profile-picture-response.dto';

@Injectable()
export class DeleteProfilePictureUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(cognitoId: string): Promise<DeleteProfilePictureResponseDto> {
    // Find user by Cognito ID
    const user = await this.userDbRepository.findByCognitoId(cognitoId);
    if (!user) {
      throw new UserNotFoundError(cognitoId);
    }

    // Check if user has a profile picture
    if (!user.profilePictureUrl) {
      return {
        message: 'Nenhuma foto de perfil para remover',
      };
    }

    // Update user profile to remove picture URL (keep file in S3)
    await this.userDbRepository.update(user.id, {
      profilePictureUrl: null,
    });

    return {
      message: 'Foto de perfil removida com sucesso',
    };
  }
}
