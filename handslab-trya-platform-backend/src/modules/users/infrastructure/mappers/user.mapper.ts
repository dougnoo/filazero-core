import { User } from '../../domain/entities/user.entity';
import { Doctor } from '../../domain/entities/doctor.entity';
import { UserEntity } from '../entities/user.entity';
import { DoctorEntity } from '../entities/doctor.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    let doctor: Doctor | undefined;
    if (entity.doctor) {
      doctor = new Doctor({
        id: entity.doctor.id,
        userId: entity.doctor.userId,
        boardCode: entity.doctor.boardCode,
        boardNumber: entity.doctor.boardNumber,
        boardState: entity.doctor.boardState,
        specialty: entity.doctor.specialty,
        createdAt: entity.doctor.createdAt,
        updatedAt: entity.doctor.updatedAt,
        user: {} as User, // Avoid circular reference
      });
    }

    return new User({
      id: entity.id,
      cognitoId: entity.cognitoId,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      phone: entity.phone,
      gender: entity.gender,
      active: entity.active,
      profilePictureUrl: entity.profilePictureUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      doctor,
    });
  }

  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.cognitoId = domain.cognitoId;
    entity.email = domain.email;
    entity.name = domain.name;
    entity.role = domain.role;
    entity.phone = domain.phone;
    entity.gender = domain.gender;
    entity.active = domain.active;
    entity.profilePictureUrl = domain.profilePictureUrl;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    if (domain.doctor) {
      const doctorEntity = new DoctorEntity();
      doctorEntity.id = domain.doctor.id;
      doctorEntity.userId = domain.doctor.userId;
      doctorEntity.boardCode = domain.doctor.boardCode;
      doctorEntity.boardNumber = domain.doctor.boardNumber;
      doctorEntity.boardState = domain.doctor.boardState;
      doctorEntity.specialty = domain.doctor.specialty;
      doctorEntity.createdAt = domain.doctor.createdAt;
      doctorEntity.updatedAt = domain.doctor.updatedAt;
      entity.doctor = doctorEntity;
    }
    return entity;
  }
}
