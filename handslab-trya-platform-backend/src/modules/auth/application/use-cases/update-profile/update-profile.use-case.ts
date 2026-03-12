import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../../users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from '../../../../users/domain/repositories/user-db.repository.interface';
import { DOCTOR_REPOSITORY_TOKEN } from '../../../../users/domain/repositories/doctor.repository.token';
import type { IDoctorRepository } from '../../../../users/domain/repositories/doctor.repository.interface';
import { UpdateAdminProfileDto } from './update-admin-profile.dto';
import { UpdateDoctorProfileDto } from './update-doctor-profile.dto';
import { ProfileResponseDto } from '../get-current-user/profile-response.dto';
import type { User } from '../../../../users/domain/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    accessToken: string,
    cognitoId: string,
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<ProfileResponseDto> {
    const dbUser = await this.findUserOrThrow(cognitoId);

    await this.updateCognitoAttributes(accessToken, dto);
    await this.updateUserBasicFields(dbUser.id, dto);
    await this.updateDoctorFields(dbUser, dto);

    const updatedUser = await this.findUserOrThrow(cognitoId);

    return this.buildProfileResponse(updatedUser);
  }

  private async findUserOrThrow(cognitoId: string): Promise<User> {
    const user = await this.userDbRepository.findByCognitoId(cognitoId);

    if (!user) {
      throw new Error('Usuário não encontrado no banco de dados');
    }

    return user;
  }

  private buildCognitoAttributes(
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (dto.name !== undefined) {
      attributes['name'] = dto.name;
    }

    if (dto.phone !== undefined) {
      attributes['phone_number'] = dto.phone;
    }

    return attributes;
  }

  private async updateCognitoAttributes(
    accessToken: string,
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<void> {
    const cognitoAttributes = this.buildCognitoAttributes(dto);

    if (Object.keys(cognitoAttributes).length > 0) {
      await this.authRepository.updateProfile(accessToken, cognitoAttributes);
    }
  }

  private buildUserUpdateData(
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): { name?: string; phone?: string } {
    const updateData: { name?: string; phone?: string } = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }

    return updateData;
  }

  private async updateUserBasicFields(
    userId: string,
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<void> {
    const userUpdateData = this.buildUserUpdateData(dto);

    if (Object.keys(userUpdateData).length > 0) {
      await this.userDbRepository.update(userId, userUpdateData);
    }
  }

  private buildDoctorUpdateData(dto: UpdateDoctorProfileDto): {
    crm?: string;
    specialty?: string;
  } {
    const updateData: { crm?: string; specialty?: string } = {};

    if (dto.crm !== undefined) {
      updateData.crm = dto.crm;
    }

    if (dto.specialty !== undefined) {
      updateData.specialty = dto.specialty;
    }

    return updateData;
  }

  private hasDoctorFields(dto: UpdateDoctorProfileDto): boolean {
    return dto.crm !== undefined || dto.specialty !== undefined;
  }

  private async updateDoctorFields(
    dbUser: User,
    dto: UpdateAdminProfileDto | UpdateDoctorProfileDto,
  ): Promise<void> {
    const doctorDto = dto as UpdateDoctorProfileDto;

    if (!this.hasDoctorFields(doctorDto) || !dbUser.doctor) {
      return;
    }

    const doctorUpdateData = this.buildDoctorUpdateData(doctorDto);

    if (Object.keys(doctorUpdateData).length > 0) {
      await this.doctorRepository.update(dbUser.doctor.id, doctorUpdateData);
    }
  }

  private buildProfileResponse(user: User): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      active: user.active,
      boardCode: user.doctor?.boardCode,
      boardNumber: user.doctor?.boardNumber ?? '',
      boardState: user.doctor?.boardState ?? '',
      specialty: user.doctor?.specialty,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
