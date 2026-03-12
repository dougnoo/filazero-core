import { Injectable, Inject } from '@nestjs/common';
import { ITelemedicineRepository } from '../../domain/repositories/telemedicine.repository.interface';
import { IntegrationType } from '../../domain/enums/integration-type.enum';
import { ZELO_REPOSITORY_TOKEN } from '../../telemedicine/zelo/domain/repositories/zelo.repository.token';
import type { IZeloRepository } from '../../telemedicine/zelo/domain/repositories/zelo.repository.interface';

@Injectable()
export class ZeloTelemedicineAdapter implements ITelemedicineRepository {
  readonly type = IntegrationType.TELEMEDICINE;
  readonly name = 'Zelo';

  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async healthCheck(): Promise<boolean> {
    try {
      await this.zeloRepository.filterPatients({}, { page: 1, page_size: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async execute(operation: string, params: any): Promise<any> {
    const methodMap: Record<string, keyof IZeloRepository> = {
      createPatient: 'createPatient',
      generateMagicLink: 'generateMagicLink',
      filterPatients: 'filterPatients',
      getConsultationHistory: 'getConsultationHistory',
      getAttachmentHistory: 'getAttachmentHistory',
    };

    const method = methodMap[operation];
    if (!method || typeof this.zeloRepository[method] !== 'function') {
      throw new Error(`Operation ${operation} not supported`);
    }

    return (this.zeloRepository[method] as any)(params);
  }

  async createPatient(data: any): Promise<any> {
    return this.zeloRepository.createPatient(data);
  }

  async generateMagicLink(identifier: string): Promise<any> {
    return this.zeloRepository.generateMagicLink(identifier);
  }

  async filterPatients(filters: any): Promise<any> {
    return this.zeloRepository.filterPatients(filters, {
      page: 1,
      page_size: 20,
    });
  }

  async getConsultationHistory(filters: any): Promise<any> {
    return this.zeloRepository.getConsultationHistory(filters);
  }

  async getAttachmentHistory(filters: any): Promise<any> {
    return this.zeloRepository.getAttachmentHistory(filters);
  }
}
