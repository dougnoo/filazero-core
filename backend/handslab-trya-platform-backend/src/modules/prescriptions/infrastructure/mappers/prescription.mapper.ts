import {
  Prescription,
  PrescriptionProps,
  PrescriptionMedication,
  PrescriptionExam,
  SentVia,
} from '../../domain/entities/Prescription.entity';
import {
  PrescriptionEntity,
  PrescriptionMedicationData,
  PrescriptionExamData,
} from '../entities/Prescription.entity';

export class PrescriptionMapper {
  static toDomain(entity: PrescriptionEntity): Prescription {
    const props: PrescriptionProps = {
      id: entity.id,
      memedPrescriptionId: entity.memedPrescriptionId,
      tenantId: entity.tenantId,
      doctorId: entity.doctorId,
      patientId: entity.patientId,
      patientName: entity.patientName,
      patientCpf: entity.patientCpf,
      sessionId: entity.sessionId,
      medications: entity.medications as PrescriptionMedication[],
      exams: entity.exams as PrescriptionExam[],
      pdfUrl: entity.pdfUrl,
      sentVia: entity.sentVia as SentVia[] | undefined,
      sentAt: entity.sentAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return new Prescription(props);
  }

  static toPersistence(domain: Prescription): PrescriptionEntity {
    const entity = new PrescriptionEntity();

    entity.id = domain.id;
    entity.memedPrescriptionId = domain.memedPrescriptionId;
    entity.tenantId = domain.tenantId;
    entity.doctorId = domain.doctorId;
    entity.patientId = domain.patientId;
    entity.patientName = domain.patientName;
    entity.patientCpf = domain.patientCpf;
    entity.sessionId = domain.sessionId;
    entity.medications = domain.medications as PrescriptionMedicationData[];
    entity.exams = domain.exams as PrescriptionExamData[];
    entity.pdfUrl = domain.pdfUrl;
    entity.sentVia = domain.sentVia;
    entity.sentAt = domain.sentAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  static toDomainList(entities: PrescriptionEntity[]): Prescription[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
