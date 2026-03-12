import { Prescription } from '../entities/Prescription.entity';

export abstract class PrescriptionRepository {
  abstract create(prescription: Prescription): Promise<Prescription>;
  abstract findById(id: string): Promise<Prescription | null>;
  abstract findByDoctorId(doctorId: string): Promise<Prescription[]>;
  abstract findByPatientId(patientId: string): Promise<Prescription[]>;
  abstract findByTenantId(tenantId: string): Promise<Prescription[]>;
  abstract findBySessionId(sessionId: string): Promise<Prescription | null>;
  abstract update(prescription: Prescription): Promise<Prescription>;
  abstract delete(id: string): Promise<void>;
}
