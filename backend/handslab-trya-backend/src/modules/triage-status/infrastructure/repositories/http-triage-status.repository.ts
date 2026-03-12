import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ITriageStatusRepository,
  TriageValidationStatus,
} from '../../domain/interfaces/triage-status.interface';

interface PlatformMedicalApprovalRequest {
  id: string;
  sessionId: string;
  userId: string;
  tenantId: string;
  patientName: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'ADJUSTED';
  assignedDoctorId?: string;
  assignedDoctor?: {
    id: string;
    userId: string;
    boardCode?: string;
    boardNumber?: string;
    boardState?: string;
    specialty: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface PlatformApiResponse {
  data: PlatformMedicalApprovalRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class HttpTriageStatusRepository implements ITriageStatusRepository {
  private readonly logger = new Logger(HttpTriageStatusRepository.name);
  private readonly platformApiUrl: string;
  private readonly platformApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.platformApiUrl = this.configService.get<string>(
      'TRYA_PLATFORM_API_URL',
      '',
    );
    this.platformApiKey = this.configService.get<string>(
      'TRYA_PLATFORM_API_KEY',
      '',
    );

    if (!this.platformApiUrl) {
      this.logger.warn('TRYA_PLATFORM_API_URL não configurada');
    }
  }

  async getLatestValidationStatus(
    userId: string,
    tenantId: string,
  ): Promise<TriageValidationStatus> {
    // Se não houver URL configurada, retorna sem validação
    if (!this.platformApiUrl || !this.platformApiKey) {
      this.logger.debug(
        'Platform API não configurada, retornando sem validação',
      );
      return { hasValidation: false };
    }

    try {
      const url = new URL('/medical-approval-requests', this.platformApiUrl);
      url.searchParams.set('userId', userId);
      url.searchParams.set('limit', '1');
      url.searchParams.set('orderBy', 'createdAt');
      url.searchParams.set('orderDirection', 'DESC');

      this.logger.debug(`Buscando status de validação para userId: ${userId}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.platformApiKey,
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Erro ao buscar status de validação: ${response.status} ${response.statusText}`,
        );
        return { hasValidation: false };
      }

      const data: PlatformApiResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        return { hasValidation: false };
      }

      const latestRequest = data.data[0];

      const result: TriageValidationStatus = {
        hasValidation: true,
        status: latestRequest.status,
        createdAt: latestRequest.createdAt,
        updatedAt: latestRequest.updatedAt,
      };

      // Se houver médico atribuído, incluir informações
      if (latestRequest.assignedDoctor) {
        result.assignedDoctor = {
          name: latestRequest.assignedDoctor.user?.name || 'Médico',
          boardCode: latestRequest.assignedDoctor.boardCode,
          boardNumber: latestRequest.assignedDoctor.boardNumber,
          boardState: latestRequest.assignedDoctor.boardState,
        };
      }

      return result;
    } catch (error) {
      this.logger.error('Erro ao buscar status de validação médica', error);
      return { hasValidation: false };
    }
  }
}
