import { Inject, Injectable } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { ListUsersDto } from './list-users.dto';
import {
  ListUsersResponseDto,
  UserResponseDto,
} from './list-users-response.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(dto: ListUsersDto): Promise<ListUsersResponseDto> {
    const filters = {
      role: dto.role,
      active: dto.active,
      search: dto.search,
    };

    const pagination = {
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
    };

    const result = await this.userDbRepository.findAll(filters, pagination);

    const data: UserResponseDto[] = result.data.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      data,
      pagination: result.pagination,
    };
  }
}
