import { Injectable, Inject } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { Prescription } from '../../domain/entities/Prescription.entity';
import { CreatePrescriptionDto } from '../dtos/create-prescription.dto';
import { MEMED_REPOSITORY_TOKEN } from '../../domain/repositories/memed.repository.token';
import type {
  IMemedRepository,
  MemedCredentials,
} from '../../domain/repositories/memed.repository.interface';

@Injectable()
export class CreatePrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    @Inject(MEMED_REPOSITORY_TOKEN)
    private readonly memedRepository: IMemedRepository,
  ) {}

  /**
   * Salva referência de uma prescrição criada via frontend (Memed Widget)
   * O frontend envia o memedPrescriptionId (data.prescricao.id) após o médico criar a prescrição no widget
   */
  async execute(
    data: CreatePrescriptionDto,
    credentials: MemedCredentials,
  ): Promise<Prescription> {
    // Buscar detalhes da prescrição na Memed para validar e obter dados estruturados
    // Usar o memedPrescriptionId (143384) e as credenciais que já incluem o userToken
    const userToken = data.memedToken;
    const enhancedCredentials: MemedCredentials = {
      ...credentials,
      userToken,
    };
    const memedDetails = await this.memedRepository.getPrescriptionDetails(
      data.memedPrescriptionId,
      enhancedCredentials,
      true, // structuredDocuments
    );

    // Obter URL do PDF usando o memedPrescriptionId
    const pdfUrl = await this.memedRepository.getPrescriptionPDF(
      data.memedPrescriptionId,
      enhancedCredentials,
    );

    // Criar entidade de domínio
    const prescription = new Prescription({
      id: uuidv7(),
      memedPrescriptionId: data.memedPrescriptionId,
      tenantId: data.tenantId,
      doctorId: data.doctorId,
      patientId: data.patientId,
      patientName: data.patientName,
      patientCpf: data.patientCpf,
      sessionId: data.sessionId,
      // Medicamentos e exames vêm dos detalhes da Memed (podem ser vazios)
      medications: this.extractMedications(memedDetails),
      exams: this.extractExams(memedDetails),
      pdfUrl: pdfUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Salvar no banco
    return await this.prescriptionRepository.create(prescription);
  }

  /**
   * Extrai medicamentos dos dados estruturados da Memed
   */
  private extractMedications(memedDetails: any): any[] {
    // TODO: Mapear estrutura real retornada pela Memed
    // Depende do formato do structuredDocuments
    return memedDetails.data?.attributes?.medications || [];
  }

  /**
   * Extrai exames dos dados estruturados da Memed
   */
  private extractExams(memedDetails: any): any[] {
    // TODO: Mapear estrutura real retornada pela Memed
    // Depende do formato do structuredDocuments
    return memedDetails.data?.attributes?.exams || [];
  }
}
