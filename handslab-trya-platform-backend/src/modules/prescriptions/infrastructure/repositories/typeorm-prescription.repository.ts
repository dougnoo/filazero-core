import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { Prescription } from '../../domain/entities/Prescription.entity';
import { PrescriptionEntity } from '../entities/Prescription.entity';
import { PrescriptionMapper } from '../mappers/prescription.mapper';

@Injectable()
export class TypeOrmPrescriptionRepository implements PrescriptionRepository {
  constructor(
    @InjectRepository(PrescriptionEntity)
    private readonly repository: Repository<PrescriptionEntity>,
  ) {}

  async create(prescription: Prescription): Promise<Prescription> {
    const entity = PrescriptionMapper.toPersistence(prescription);
    const savedEntity = await this.repository.save(entity);
    return PrescriptionMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Prescription | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['doctor'],
    });
    return entity ? PrescriptionMapper.toDomain(entity) : null;
  }

  async findByDoctorId(doctorId: string): Promise<Prescription[]> {
    const entities = await this.repository.find({
      where: { doctorId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
    return PrescriptionMapper.toDomainList(entities);
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const entities = await this.repository.find({
      where: { patientId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
    return PrescriptionMapper.toDomainList(entities);
  }

  async findByTenantId(tenantId: string): Promise<Prescription[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
    return PrescriptionMapper.toDomainList(entities);
  }

  async findBySessionId(sessionId: string): Promise<Prescription | null> {
    const entity = await this.repository.findOne({
      where: { sessionId },
      relations: ['doctor'],
    });
    return entity ? PrescriptionMapper.toDomain(entity) : null;
  }

  async update(prescription: Prescription): Promise<Prescription> {
    const entity = PrescriptionMapper.toPersistence(prescription);
    const updatedEntity = await this.repository.save(entity);
    return PrescriptionMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
