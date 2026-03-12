import { Inject, Injectable } from '@nestjs/common';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';
import { GetUserResponseDto, DoctorDataDto } from './get-user-response.dto';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(id: string): Promise<GetUserResponseDto> {
    const user = await this.userDbRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    const response: GetUserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.doctor) {
      const doctorData: DoctorDataDto = {
        id: user.doctor.id,
        boardCode: user.doctor.boardCode,
        boardNumber: user.doctor.boardNumber ?? '',
        boardState: user.doctor.boardState ?? '',
        specialty: user.doctor.specialty,
        createdAt: user.doctor.createdAt,
        updatedAt: user.doctor.updatedAt,
      };
      response.doctor = doctorData;
    }

    return response;
  }
}
