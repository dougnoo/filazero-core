import { Inject, Injectable } from '@nestjs/common';
import { ZELO_REPOSITORY_TOKEN } from '../../domain/repositories/zelo.repository.token';
import type {
  IZeloRepository,
  ZeloConsultationFilters,
  ZeloPaginatedResult,
} from '../../domain/repositories/zelo.repository.interface';
import { ZeloConsultation } from '../../domain/ZeloConsultation.entity';
import { GetConsultationHistoryDto } from '../dto/get-consultation-history.dto';

/**
 * Caso de uso: Buscar histórico de consultas de um paciente
 */
@Injectable()
export class GetConsultationHistoryUseCase {
  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async execute(
    dto: GetConsultationHistoryDto,
  ): Promise<ZeloPaginatedResult<ZeloConsultation>> {
    // Validação de regras de negócio
    this.validateBusinessRules(dto);

    // Prepara os filtros
    const filters: ZeloConsultationFilters = {
      cpf: dto.cpf,
      status: dto.status,
      type: dto.type,
      doctor_cpf: dto.doctor_cpf,
      speciality_name: dto.speciality_name,
      start_date_min: dto.start_date_min,
      start_date_max: dto.start_date_max,
      end_date_min: dto.end_date_min,
      end_date_max: dto.end_date_max,
      scheduled_for_min: dto.scheduled_for_min,
      scheduled_for_max: dto.scheduled_for_max,
      is_paid: dto.is_paid,
      page: dto.page || 1,
      page_size: dto.page_size || 50,
    };

    // Chama o repositório
    return this.zeloRepository.getConsultationHistory(filters);
  }

  /**
   * Validações de regras de negócio
   */
  private validateBusinessRules(dto: GetConsultationHistoryDto): void {
    // Validar intervalo de datas de início
    if (dto.start_date_min && dto.start_date_max) {
      const minDate = new Date(dto.start_date_min);
      const maxDate = new Date(dto.start_date_max);

      if (minDate > maxDate) {
        throw new Error(
          'Data de início mínima não pode ser maior que a data de início máxima',
        );
      }
    }

    // Validar intervalo de datas de fim
    if (dto.end_date_min && dto.end_date_max) {
      const minDate = new Date(dto.end_date_min);
      const maxDate = new Date(dto.end_date_max);

      if (minDate > maxDate) {
        throw new Error(
          'Data de fim mínima não pode ser maior que a data de fim máxima',
        );
      }
    }

    // Validar intervalo de datas de agendamento
    if (dto.scheduled_for_min && dto.scheduled_for_max) {
      const minDate = new Date(dto.scheduled_for_min);
      const maxDate = new Date(dto.scheduled_for_max);

      if (minDate > maxDate) {
        throw new Error(
          'Data de agendamento mínima não pode ser maior que a data de agendamento máxima',
        );
      }
    }

    // Validar paginação
    if (dto.page && dto.page < 1) {
      throw new Error('Número da página deve ser maior ou igual a 1');
    }

    if (dto.page_size && (dto.page_size < 1 || dto.page_size > 50)) {
      throw new Error('Tamanho da página deve estar entre 1 e 50');
    }
  }
}
