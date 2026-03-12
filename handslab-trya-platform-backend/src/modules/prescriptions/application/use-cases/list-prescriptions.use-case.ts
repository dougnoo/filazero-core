import { Injectable, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { Prescription } from '../../domain/entities/Prescription.entity';

@Injectable()
export class ListPrescriptionsUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
  ) {}

  async byDoctor(doctorId: string): Promise<Prescription[]> {
    return await this.prescriptionRepository.findByDoctorId(doctorId);
  }

  async byPatient(patientId: string): Promise<Prescription[]> {
    return await this.prescriptionRepository.findByPatientId(patientId);
  }

  async byTenant(tenantId: string): Promise<Prescription[]> {
    return await this.prescriptionRepository.findByTenantId(tenantId);
  }

  async bySession(sessionId: string): Promise<Prescription[]> {
    const prescription =
      await this.prescriptionRepository.findBySessionId(sessionId);
    return prescription ? [prescription] : [];
  }
}
