import { IIntegrationRepository } from './integration.repository.interface';

export interface ITelemedicineRepository extends IIntegrationRepository {
  createPatient(data: any): Promise<any>;
  generateMagicLink(identifier: string): Promise<any>;
  filterPatients(filters: any): Promise<any>;
  getConsultationHistory(filters: any): Promise<any>;
  getAttachmentHistory(filters: any): Promise<any>;
}
