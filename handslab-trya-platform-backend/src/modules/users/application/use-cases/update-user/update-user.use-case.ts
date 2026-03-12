import { Inject, Injectable } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { UpdateUserDto } from './update-user.dto';
import { UpdateUserResponseDto } from './update-user-response.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.userDbRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const updatedUser = await this.userDbRepository.update(userId, {
      name: dto.name,
      phone: dto.phone,
    });

    const response: UpdateUserResponseDto = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      active: updatedUser.active,
      profilePictureUrl: updatedUser.profilePictureUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return response;
  }
}
