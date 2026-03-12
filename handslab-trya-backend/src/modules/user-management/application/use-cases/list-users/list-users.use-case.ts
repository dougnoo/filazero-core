import { Injectable } from '@nestjs/common';
import { ListUsersDto } from './list-users.dto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../domain/repositories/user.repository.token';
import { Inject } from '@nestjs/common';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(listUsersDto: ListUsersDto) {
    const { tenantId, role, limit = 20, nextToken } = listUsersDto;

    return await this.userRepository.listUsers({
      tenantId,
      role,
      limit,
      nextToken,
    });
  }
}
