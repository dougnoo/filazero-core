import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { GetIntegrationApiKeyUseCase } from '../../../../application/use-cases/get-integration-api-key.use-case';
import { IntegrationType } from '../../../../domain/enums/integration-type.enum';
import { IntegrationProvider } from '../../../../domain/enums/integration-provider.enum';
import {
  IZeloRepository,
  ZeloPatientFilters,
  ZeloPagination,
  ZeloPaginatedResult,
  ZeloMagicLink,
  ZeloConsultationFilters,
  ZeloAttachmentFilters,
} from '../../domain/repositories/zelo.repository.interface';
import { ZeloPatient } from '../../domain/ZeloPatient.entity';
import { ZeloConsultation } from '../../domain/ZeloConsultation.entity';
import { ZeloAttachment } from '../../domain/ZeloAttachment.entity';

/**
 * Implementação HTTP do repository Zelo
 * Faz chamadas diretas para a API da Zelo Saúde
 */
@Injectable()
export class HttpZeloRepository implements IZeloRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly getIntegrationApiKeyUseCase: GetIntegrationApiKeyUseCase,
  ) {
    this.baseUrl =
      this.configService.get<string>('ZELO_API_URL') ||
      'https://trya.zelosaude.com.br';
  }

  /**
   * Headers comuns para todas as requisições
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const apiKey = await this.getIntegrationApiKeyUseCase.execute(
      IntegrationType.TELEMEDICINE,
      IntegrationProvider.ZELO,
    );
    headers['Authorization'] = `Bearer ${apiKey}`;

    return headers;
  }

  /**
   * Cria um novo paciente na Zelo
   */
  async createPatient(patient: ZeloPatient): Promise<ZeloPatient> {
    try {
      const payload = this.mapPatientToApiFormat(patient);

      const response$ = this.httpService.post<any>(
        `${this.baseUrl}/api/clinic/create-patient/`,
        payload,
        { headers: await this.getHeaders() },
      );

      const response: AxiosResponse<any> = await firstValueFrom(response$);

      return this.mapApiResponseToPatient(response.data);
    } catch (error: any) {
      this.handleError(error, 'Failed to create patient in Zelo');
    }
  }

  /**
   * Gera magic link de login para um paciente
   */
  async generateMagicLink(cpf: string): Promise<ZeloMagicLink> {
    try {
      const response$ = this.httpService.post<ZeloMagicLink>(
        `${this.baseUrl}/api/clinic/login-patient/`,
        { cpf },
        { headers: await this.getHeaders() },
      );

      const response: AxiosResponse<ZeloMagicLink> =
        await firstValueFrom(response$);
      response.data.magic_link += '?mode=attendance_only';

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Failed to generate magic link');
    }
  }

  /**
   * Filtra pacientes com base em critérios
   */
  async filterPatients(
    filters: ZeloPatientFilters,
    pagination: ZeloPagination,
  ): Promise<ZeloPaginatedResult<ZeloPatient>> {
    try {
      // Construir query params
      const params: Record<string, any> = {
        ...filters,
        page: pagination.page,
        page_size: pagination.page_size,
      };

      // Remover valores undefined/null
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response$ = this.httpService.get<ZeloPaginatedResult<any>>(
        `${this.baseUrl}/api/clinic/filter-patients/`,
        {
          params,
          headers: await this.getHeaders(),
        },
      );

      const response: AxiosResponse<ZeloPaginatedResult<any>> =
        await firstValueFrom(response$);

      const data = response.data;

      return {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results.map((item) => this.mapApiResponseToPatient(item)),
      };
    } catch (error: any) {
      this.handleError(error, 'Failed to filter patients');
    }
  }

  /**
   * Busca histórico de consultas/atendimentos de um paciente
   */
  async getConsultationHistory(
    filters: ZeloConsultationFilters,
  ): Promise<ZeloPaginatedResult<ZeloConsultation>> {
    try {
      // Prepara os parâmetros de query removendo valores undefined
      const params: Record<string, any> = {
        cpf: filters.cpf,
        page: filters.page || 1,
        page_size: filters.page_size || 50,
      };

      // Adiciona filtros opcionais apenas se estiverem definidos
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.doctor_cpf) params.doctor_cpf = filters.doctor_cpf;
      if (filters.speciality_name)
        params.speciality_name = filters.speciality_name;
      if (filters.start_date_min)
        params.start_date_min = filters.start_date_min;
      if (filters.start_date_max)
        params.start_date_max = filters.start_date_max;
      if (filters.end_date_min) params.end_date_min = filters.end_date_min;
      if (filters.end_date_max) params.end_date_max = filters.end_date_max;
      if (filters.scheduled_for_min)
        params.scheduled_for_min = filters.scheduled_for_min;
      if (filters.scheduled_for_max)
        params.scheduled_for_max = filters.scheduled_for_max;
      if (filters.is_paid !== undefined) params.is_paid = filters.is_paid;

      const response$ = this.httpService.get<ZeloPaginatedResult<any>>(
        `${this.baseUrl}/api/clinic/consultation-history/`,
        {
          params,
          headers: await this.getHeaders(),
        },
      );

      const response: AxiosResponse<ZeloPaginatedResult<any>> =
        await firstValueFrom(response$);

      // Mapeia os resultados da API para entidades de domínio
      const consultations = response.data.results.map((item) =>
        this.mapApiResponseToConsultation(item),
      );

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: consultations,
      };
    } catch (error: any) {
      this.handleError(error, 'Failed to get consultation history');
    }
  }

  /**
   * Busca histórico de anexos (receitas, atestados, exames) de um paciente
   */
  async getAttachmentHistory(
    filters: ZeloAttachmentFilters,
  ): Promise<ZeloPaginatedResult<ZeloAttachment>> {
    try {
      // Prepara os parâmetros de query removendo valores undefined
      const params: Record<string, any> = {
        cpf: filters.cpf,
        page: filters.page || 1,
        page_size: filters.page_size || 50,
      };

      // Adiciona filtros opcionais apenas se estiverem definidos
      if (filters.consultation_code)
        params.consultation_code = filters.consultation_code;
      if (filters.file_type) params.file_type = filters.file_type;
      if (filters.origin) params.origin = filters.origin;
      if (filters.created_at_min)
        params.created_at_min = filters.created_at_min;
      if (filters.created_at_max)
        params.created_at_max = filters.created_at_max;

      const response$ = this.httpService.get<ZeloPaginatedResult<any>>(
        `${this.baseUrl}/api/clinic/attachment-history/`,
        {
          params,
          headers: await this.getHeaders(),
        },
      );

      const response: AxiosResponse<ZeloPaginatedResult<any>> =
        await firstValueFrom(response$);

      // Mapeia os resultados da API para entidades de domínio
      const attachments = response.data.results.map((item) =>
        this.mapApiResponseToAttachment(item),
      );

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: attachments,
      };
    } catch (error: any) {
      this.handleError(error, 'Failed to get attachment history');
    }
  }

  /**
   * Busca histórico de atendimentos de um paciente (deprecated - use getConsultationHistory)
   */
  async getPatientHistory(cpf: string): Promise<any> {
    try {
      const response$ = this.httpService.get<any>(
        `${this.baseUrl}/api/clinic/patient-history/`,
        {
          params: { cpf },
          headers: await this.getHeaders(),
        },
      );

      const response: AxiosResponse<any> = await firstValueFrom(response$);

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Failed to get patient history');
    }
  }

  /**
   * Busca histórico de anexos de um paciente (deprecated - use getAttachmentHistory)
   */
  async getPatientAttachments(cpf: string): Promise<any> {
    try {
      const response$ = this.httpService.get<any>(
        `${this.baseUrl}/api/clinic/patient-attachments/`,
        {
          params: { cpf },
          headers: await this.getHeaders(),
        },
      );

      const response: AxiosResponse<any> = await firstValueFrom(response$);

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'Failed to get patient attachments');
    }
  }

  /**
   * Mapeia entidade de domínio para formato da API Zelo
   */
  private mapPatientToApiFormat(patient: ZeloPatient): any {
    return {
      name: patient.name,
      cpf: patient.cpf,
      email: patient.email,
      birth_date: patient.birthDate,
      phone: patient.phone,
      insurance_card_number: patient.insuranceCardNumber,
      insurance_plan_code: patient.insurancePlanCode,
      plan_adherence_date: patient.planAdherenceDate,
      plan_expiry_date: patient.planExpiryDate,
      extra_fields: patient.extraFields,
      address: patient.address
        ? {
            street: patient.address.street,
            number: patient.address.number,
            neighborhood: patient.address.neighborhood,
            city: patient.address.city,
            state: patient.address.state,
            zip_code: patient.address.zipCode,
          }
        : undefined,
    };
  }

  /**
   * Mapeia resposta da API Zelo para entidade de domínio
   */
  private mapApiResponseToPatient(data: any): ZeloPatient {
    return new ZeloPatient({
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      birthDate: data.birth_date,
      phone: data.phone,
      insuranceCardNumber: data.insurance_card_number,
      insurancePlanCode: data.insurance_plan_code,
      planAdherenceDate: data.plan_adherence_date,
      planExpiryDate: data.plan_expiry_date,
      extraFields: data.extra_fields,
      address: data.address
        ? {
            street: data.address.street,
            number: data.address.number,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zip_code,
          }
        : undefined,
    });
  }

  /**
   * Mapeia resposta da API Zelo para entidade de consulta
   */
  private mapApiResponseToConsultation(data: any): ZeloConsultation {
    return new ZeloConsultation({
      code: data.code,
      type: data.type,
      meetingStatus: data.meeting_status,
      requestedAt: data.requested_at,
      scheduledFor: data.scheduled_for,
      startAt: data.start_at,
      endAt: data.end_at,
      durationTotalSeconds: data.duration_total_seconds,
      durationFormatted: data.duration_formatted,
      price: data.price,
      isPaid: data.is_paid,
      paidAt: data.paid_at,
      chiefComplaint: data.chief_complaint,
      doctorNotes: data.doctor_notes,
      patient: data.patient
        ? {
            name: data.patient.name,
            cpf: data.patient.cpf,
          }
        : undefined,
      doctor: data.doctor
        ? {
            name: data.doctor.name,
            cpf: data.doctor.cpf,
            crm: data.doctor.crm,
          }
        : undefined,
      speciality: data.speciality
        ? {
            name: data.speciality.name,
          }
        : undefined,
      helpdeskAgent: data.helpdesk_agent
        ? {
            name: data.helpdesk_agent.name,
            cpf: data.helpdesk_agent.cpf,
          }
        : undefined,
    });
  }

  /**
   * Mapeia resposta da API Zelo para entidade de anexo
   */
  private mapApiResponseToAttachment(data: any): ZeloAttachment {
    return new ZeloAttachment({
      fileType: data.file_type,
      origin: data.origin,
      fileName: data.file_name,
      fileUrl: data.file_url,
      fileIcon: data.file_icon,
      createdAt: data.created_at,
      consultation: data.consultation
        ? {
            code: data.consultation.code,
            type: data.consultation.type,
            meetingStatus: data.consultation.meeting_status,
            scheduledFor: data.consultation.scheduled_for,
            startAt: data.consultation.start_at,
            endAt: data.consultation.end_at,
            patient: data.consultation.patient
              ? {
                  name: data.consultation.patient.name,
                  cpf: data.consultation.patient.cpf,
                }
              : undefined,
            doctor: data.consultation.doctor
              ? {
                  name: data.consultation.doctor.name,
                  cpf: data.consultation.doctor.cpf,
                  crm: data.consultation.doctor.crm,
                }
              : undefined,
            speciality: data.consultation.speciality
              ? {
                  name: data.consultation.speciality.name,
                }
              : undefined,
          }
        : undefined,
    });
  }

  /**
   * Trata erros HTTP
   */
  private handleError(error: any, defaultMessage: string): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || defaultMessage;

    throw new HttpException(
      {
        message,
        details: error.response?.data,
        status,
      },
      status,
    );
  }
}
