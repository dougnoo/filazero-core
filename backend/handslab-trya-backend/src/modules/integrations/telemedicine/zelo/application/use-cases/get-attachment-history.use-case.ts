import { Inject, Injectable } from '@nestjs/common';
import { ZELO_REPOSITORY_TOKEN } from '../../domain/repositories/zelo.repository.token';
import type {
  IZeloRepository,
  ZeloAttachmentFilters,
  ZeloPaginatedResult,
} from '../../domain/repositories/zelo.repository.interface';
import { ZeloAttachment } from '../../domain/ZeloAttachment.entity';
import { GetAttachmentHistoryDto } from '../dto/get-attachment-history.dto';

/**
 * Caso de uso: Buscar histórico de anexos de um paciente
 */
@Injectable()
export class GetAttachmentHistoryUseCase {
  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async execute(
    dto: GetAttachmentHistoryDto,
  ): Promise<ZeloPaginatedResult<ZeloAttachment>> {
    // Validação de regras de negócio
    this.validateBusinessRules(dto);

    // Prepara os filtros
    const filters: ZeloAttachmentFilters = {
      cpf: dto.cpf,
      consultation_code: dto.consultation_code,
      file_type: dto.file_type,
      origin: dto.origin,
      created_at_min: dto.created_at_min,
      created_at_max: dto.created_at_max,
      page: dto.page || 1,
      page_size: dto.page_size || 50,
    };

    // Chama o repositório
    return this.zeloRepository.getAttachmentHistory(filters);
  }

  /**
   * Validações de regras de negócio
   */
  private validateBusinessRules(dto: GetAttachmentHistoryDto): void {
    // Validar intervalo de datas de criação
    if (dto.created_at_min && dto.created_at_max) {
      const minDate = new Date(dto.created_at_min);
      const maxDate = new Date(dto.created_at_max);

      if (minDate > maxDate) {
        throw new Error(
          'Data de criação mínima não pode ser maior que a data de criação máxima',
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
