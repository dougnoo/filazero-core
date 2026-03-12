import { Inject, Injectable } from '@nestjs/common';
import { S3Service } from '../../../../../shared/infrastructure/services/s3.service';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { UploadProfilePictureDto } from './upload-profile-picture.dto';
import { UploadProfilePictureResponseDto } from './upload-profile-picture-response.dto';

@Injectable()
export class UploadProfilePictureUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    cognitoId: string,
    dto: UploadProfilePictureDto,
  ): Promise<UploadProfilePictureResponseDto> {
    // Find user by Cognito ID
    const user = await this.userDbRepository.findByCognitoId(cognitoId);
    if (!user) {
      throw new UserNotFoundError(cognitoId);
    }

    // Generate file key and content type
    const fileKey = this.s3Service.generateProfilePictureKey(
      user.id,
      dto.fileExtension,
    );
    const contentType =
      dto.fileExtension === 'jpg' ? 'image/jpeg' : 'image/png';

    // Generate presigned URL
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      fileKey,
      contentType,
    );

    // Generate public URL
    const publicUrl = this.s3Service.getPublicUrl(fileKey);

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  }
}
