import { Doctor } from '../../domain/entities/doctor.entity';
import { User } from '../../domain/entities/user.entity';
import { DoctorEntity } from '../entities/doctor.entity';

export class DoctorMapper {
  static toDomain(entity: DoctorEntity): Doctor {
    const user = entity.user
      ? new User({
          id: entity.user.id,
          cognitoId: entity.user.cognitoId,
          email: entity.user.email,
          name: entity.user.name,
          role: entity.user.role,
          phone: entity.user.phone,
          gender: entity.user.gender,
          active: entity.user.active,
          createdAt: entity.user.createdAt,
          updatedAt: entity.user.updatedAt,
        })
      : ({} as User);

    return new Doctor({
      id: entity.id,
      userId: entity.userId,
      boardCode: entity.boardCode,
      boardNumber: entity.boardNumber,
      boardState: entity.boardState,
      specialty: entity.specialty,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user,
    });
  }

  static toEntity(domain: Doctor): DoctorEntity {
    const entity = new DoctorEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.boardCode = domain.boardCode;
    entity.boardNumber = domain.boardNumber;
    entity.boardState = domain.boardState;
    entity.specialty = domain.specialty;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
