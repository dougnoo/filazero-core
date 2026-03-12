import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { MEMED_REPOSITORY_TOKEN } from '../../domain/repositories/memed.repository.token';
import { GetPrescriptorTokenUseCase } from './get-prescriptor-token.use-case';
import type {
  IMemedRepository,
  MemedCredentials,
} from '../../domain/repositories/memed.repository.interface';

export interface PrescriptionWithMemedDataResponse {
  // Dados do banco local
  id: string;
  sessionId?: string;
  createdAt: string;

  // Dados da API Memed
  memedPrescriptionId: string;
  patientName?: string;
  medications: any[];
  exams: any[];
  pdfUrl?: string;

  // Dados estruturados completos do Memed (opcional)
  memedData?: any;
}

@Injectable()
export class GetPrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    @Inject(MEMED_REPOSITORY_TOKEN)
    private readonly memedRepository: IMemedRepository,
    private readonly getPrescriptorTokenUseCase: GetPrescriptorTokenUseCase,
  ) {}

  async executeBySession(
    sessionId: string,
    baseCredentials: MemedCredentials,
  ): Promise<PrescriptionWithMemedDataResponse | null> {
    // Buscar prescrição no banco pelo sessionId
    const prescription =
      await this.prescriptionRepository.findBySessionId(sessionId);

    if (!prescription) {
      return null;
    }

    return await this.enrichWithMemedData(prescription, baseCredentials);
  }

  async executeById(
    prescriptionId: string,
    baseCredentials: MemedCredentials,
  ): Promise<PrescriptionWithMemedDataResponse> {
    // Buscar prescrição no banco pelo ID
    const prescription =
      await this.prescriptionRepository.findById(prescriptionId);

    if (!prescription) {
      throw new NotFoundException(
        `Prescription with ID ${prescriptionId} not found`,
      );
    }

    return await this.enrichWithMemedData(prescription, baseCredentials);
  }

  private async enrichWithMemedData(
    prescription: any,
    baseCredentials: MemedCredentials,
  ): Promise<PrescriptionWithMemedDataResponse> {
    try {
      // Buscar token do médico para autenticação na API Memed
      const doctorTokenData = await this.getPrescriptorTokenUseCase.execute(
        prescription.doctorId,
      );

      // Criar credenciais completas com o token do médico
      const credentials: MemedCredentials = {
        ...baseCredentials,
        userToken: doctorTokenData.memedToken,
      };
      // Buscar dados estruturados da prescrição no Memed
      const memedDetails = await this.memedRepository.getPrescriptionDetails(
        prescription.memedPrescriptionId,
        credentials,
        true, // structuredDocuments = true
      );

      // Extrair medicamentos, exames e dados do paciente
      const medications = this.extractMedications(memedDetails.data);
      const exams = this.extractExams(memedDetails.data);

      return {
        // Dados do banco local
        id: prescription.id,
        sessionId: prescription.sessionId,
        createdAt: prescription.createdAt.toISOString(),
        patientName: prescription.patientName,
        memedPrescriptionId: prescription.memedPrescriptionId,
        pdfUrl: prescription.pdfUrl,

        // Dados enriquecidos do Memed
        medications,
        exams,

        // Dados completos do Memed (para debug/futuro uso)
        memedData: memedDetails.data,
      };
    } catch (error) {
      console.error('Error fetching Memed data:', error);

      // Fallback: retornar dados do banco local
      return {
        id: prescription.id,
        sessionId: prescription.sessionId,
        createdAt: prescription.createdAt.toISOString(),
        memedPrescriptionId: prescription.memedPrescriptionId,
        patientName: prescription.patientName,
        medications: prescription.medications || [],
        exams: prescription.exams || [],
        pdfUrl: prescription.pdfUrl,
      };
    }
  }

  /**
   * Extrai medicamentos dos dados estruturados da Memed
   */
  private extractMedications(memedData: any): any[] {
    try {
      // Baseado na estrutura real: memedData.attributes.medicamentos
      const medications = memedData?.attributes?.medicamentos || [];

      return Array.isArray(medications) ? medications : [];
    } catch (error) {
      console.warn('Error extracting medications:', error);
      return [];
    }
  }

  /**
   * Extrai exames dos dados estruturados da Memed
   */
  private extractExams(memedData: any): any[] {
    try {
      // Baseado na estrutura real: memedData.attributes.exames (se existir)
      const exams = memedData?.attributes?.exames || [];

      return Array.isArray(exams) ? exams : [];
    } catch (error) {
      console.warn('Error extracting exams:', error);
      return [];
    }
  }
}
