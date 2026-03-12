import { Inject, Injectable } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { DoctorNotFoundError } from '../../../domain/errors/doctor-not-found.error';
import { GetDoctorResponseDto } from './get-doctor-response.dto';

@Injectable()
export class GetDoctorUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(userId: string): Promise<GetDoctorResponseDto> {
    const user = await this.userDbRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    if (!user.doctor) {
      throw new DoctorNotFoundError(userId);
    }

    // Retorna estrutura flat com dados do doctor e user no mesmo nível
    const response: GetDoctorResponseDto = {
      id: user.id,
      boardCode: user.doctor.boardCode,
      boardNumber: user.doctor.boardNumber ?? '',
      boardState: user.doctor.boardState ?? '',
      specialty: user.doctor.specialty,
      createdAt: user.doctor.createdAt,
      updatedAt: user.doctor.updatedAt,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
    };

    return response;
  }
}
