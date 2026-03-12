import { Injectable } from '@nestjs/common';
import type { ITelemedicineStrategy } from '../../domain/interfaces/telemedicine-strategy.interface';
import type { MagicLinkResult } from '../../domain/interfaces/magic-link-result.interface';
import type { ConsultationResult } from '../../domain/interfaces/consultation-result.interface';
import { GeneratePatientMagicLinkUseCase } from '../zelo/application/use-cases/generate-patient-magic-link.use-case';
import { CreatePatientUseCase } from '../zelo/application/use-cases/create-patient.use-case';
import { FilterPatientsUseCase } from '../zelo/application/use-cases/filter-patients.use-case';
import { GetConsultationHistoryUseCase } from '../zelo/application/use-cases/get-consultation-history.use-case';

@Injectable()
export class ZeloTelemedicineStrategy implements ITelemedicineStrategy {
  constructor(
    private readonly generateMagicLinkZelo: GeneratePatientMagicLinkUseCase,
    private readonly createPatientZelo: CreatePatientUseCase,
    private readonly filterPatientsZelo: FilterPatientsUseCase,
    private readonly getConsultationHistoryZelo: GetConsultationHistoryUseCase,
  ) {}

  async generateMagicLink(
    cpf: string,
    userName: string,
    userEmail: string,
  ): Promise<MagicLinkResult> {
    const cleanCpf = cpf.replace(/\D/g, '');

    const existingPatients = await this.filterPatientsZelo.execute({
      cpf: cleanCpf,
      page: 1,
      page_size: 1,
    });

    if (existingPatients.count === 0) {
      await this.createPatientZelo.execute({
        name: userName,
        email: userEmail,
        cpf: cleanCpf,
      });
    }

    const zeloResult = await this.generateMagicLinkZelo.execute({
      cpf: cleanCpf,
    });

    return {
      magicLink: zeloResult.magic_link,
      expiresAt: zeloResult.expires_at,
      message: zeloResult.message,
    };
  }

  async getConsultationHistory(
    cpf: string,
    limit?: number,
  ): Promise<ConsultationResult[]> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const pageSize = limit && limit > 0 && limit <= 50 ? limit : 50;

    const history = await this.getConsultationHistoryZelo.execute({
      cpf: cleanCpf,
      page: 1,
      page_size: pageSize,
    });

    const results = history.results
      .map((consultation) => ({
        doctorName: consultation.doctor?.name || 'N/A',
        speciality: consultation.speciality?.name || 'N/A',
        consultationDate:
          consultation.startAt ||
          consultation.scheduledFor ||
          consultation.requestedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.consultationDate).getTime() -
          new Date(a.consultationDate).getTime(),
      );

    return limit ? results.slice(0, limit) : results;
  }
}
