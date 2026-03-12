import { Injectable, Inject } from '@nestjs/common';
import { ZELO_REPOSITORY_TOKEN } from '../../domain/repositories/zelo.repository.token';
import type {
  IZeloRepository,
  ZeloPaginatedResult,
} from '../../domain/repositories/zelo.repository.interface';
import { FilterPatientsDto } from '../dto';
import { ZeloPatient } from '../../domain/ZeloPatient.entity';

@Injectable()
export class FilterPatientsUseCase {
  constructor(
    @Inject(ZELO_REPOSITORY_TOKEN)
    private readonly zeloRepository: IZeloRepository,
  ) {}

  async execute(
    filters: FilterPatientsDto,
  ): Promise<ZeloPaginatedResult<ZeloPatient>> {
    // Validar page_size (máximo 50)
    if (filters.page_size && filters.page_size > 50) {
      throw new Error('Page size cannot exceed 50');
    }

    // Validar page (mínimo 1)
    if (filters.page && filters.page < 1) {
      throw new Error('Page must be greater than 0');
    }

    // Definir valores padrão
    const page = filters.page || 1;
    const page_size = filters.page_size || 50;

    // Filtrar pacientes via repository
    return await this.zeloRepository.filterPatients(filters, {
      page,
      page_size,
    });
  }
}
