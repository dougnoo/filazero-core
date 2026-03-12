import { Inject, Injectable } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { ListDoctorsDto } from './list-doctors.dto';
import {
  ListDoctorsResponseDto,
  DoctorResponseDto,
} from './list-doctors-response.dto';

@Injectable()
export class ListDoctorsUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(dto: ListDoctorsDto): Promise<ListDoctorsResponseDto> {
    const filters = {
      role: UserRole.DOCTOR,
      active: dto.active,
      search: dto.search,
      specialty: dto.specialty,
    };

    const pagination = {
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
    };

    const result = await this.userDbRepository.findAll(filters, pagination);

    const data: DoctorResponseDto[] = result.data.map((user) => ({
      id: user.id,
      boardCode: user.doctor?.boardCode,
      boardNumber: user.doctor?.boardNumber ?? '',
      boardState: user.doctor?.boardState ?? '',
      specialty: user.doctor?.specialty ?? '',
      createdAt: user.doctor?.createdAt ?? user.createdAt,
      updatedAt: user.doctor?.updatedAt ?? user.updatedAt,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
    }));

    return {
      data,
      pagination: result.pagination,
    };
  }
}
