import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { IUserDbRepository } from '../../../domain/repositories/user-db.repository.interface';
import type { IDoctorRepository } from '../../../domain/repositories/doctor.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../domain/repositories/user-db.repository.token';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../domain/repositories/doctor.repository.token';
import { DoctorNotFoundError } from '../../../domain/errors/doctor-not-found.error';
import { DatabaseSaveFailedError } from '../../../domain/errors/database-save-failed.error';
import { UpdateDoctorDto } from './update-doctor.dto';
import { UpdateDoctorResponseDto } from './update-doctor-response.dto';

@Injectable()
export class UpdateDoctorUseCase {
  private readonly logger = new Logger(UpdateDoctorUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    userId: string,
    dto: UpdateDoctorDto,
  ): Promise<UpdateDoctorResponseDto> {
    // Find doctor by userId ao invés de doctorId
    const doctor = await this.doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new DoctorNotFoundError(userId);
    }

    // Use transaction to update both User and Doctor
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update User fields (name, phone) if provided
      if (dto.name !== undefined || dto.phoneNumber !== undefined) {
        await this.userDbRepository.update(userId, {
          name: dto.name,
          phone: dto.phoneNumber,
        });
      }

      // Update Doctor fields if provided
      if (
        dto.boardCode !== undefined ||
        dto.boardNumber !== undefined ||
        dto.boardState !== undefined ||
        dto.specialty !== undefined
      ) {
        await this.doctorRepository.update(doctor.id, {
          boardCode: dto.boardCode,
          boardNumber: dto.boardNumber,
          boardState: dto.boardState,
          specialty: dto.specialty,
        });
      }

      await queryRunner.commitTransaction();

      // Fetch updated doctor with user data
      const updatedDoctor = await this.doctorRepository.findByUserId(userId);

      // Return response com userId como id
      return {
        id: updatedDoctor!.userId, // id representa o userId
        boardCode: updatedDoctor!.boardCode,
        boardNumber: updatedDoctor!.boardNumber ?? '',
        boardState: updatedDoctor!.boardState ?? '',
        specialty: updatedDoctor!.specialty,
        createdAt: updatedDoctor!.createdAt,
        updatedAt: updatedDoctor!.updatedAt,
        email: updatedDoctor!.user.email,
        name: updatedDoctor!.user.name,
        role: updatedDoctor!.user.role,
        phone: updatedDoctor!.user.phone,
        gender: updatedDoctor!.user.gender,
        active: updatedDoctor!.user.active,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update doctor ${userId}`, error);

      if (error instanceof DoctorNotFoundError) {
        throw error;
      }

      throw new DatabaseSaveFailedError(
        `Failed to update doctor: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
