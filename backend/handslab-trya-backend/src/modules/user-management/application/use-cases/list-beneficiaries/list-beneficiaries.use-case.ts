import { Injectable, Inject } from '@nestjs/common';
import { User as AuthUser } from '../../../../auth/domain/entities/user.entity';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { IBeneficiaryRepository } from '../../../domain/repositories/beneficiary.repository.interface';
import { BENEFICIARY_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary.repository.token';
import { ListBeneficiariesDto } from './list-beneficiaries.dto';
import { PaginatedListBeneficiariesResponseDto } from './paginated-list-beneficiaries-response.dto';
import { ListBeneficiariesResponseDto } from './list-beneficiaries-response.dto';

/**
 * Use Case para listar beneficiários (Application Layer)
 *
 * Implementa a lógica de negócio para listagem de beneficiários.
 * Depende apenas de abstrações (interfaces) da camada Domain.
 * Não conhece detalhes de implementação (TypeORM, Prisma, etc).
 */
@Injectable()
export class ListBeneficiariesUseCase {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY_TOKEN)
    private readonly beneficiaryRepository: IBeneficiaryRepository,
  ) {}

  async execute(
    params: ListBeneficiariesDto,
    currentUser: AuthUser,
  ): Promise<PaginatedListBeneficiariesResponseDto> {
    // Lógica de negócio: Se o usuário for HR, filtra automaticamente pelo tenant dele
    const filters = {
      tenantId:
        currentUser.role === UserRole.HR
          ? currentUser.tenantId
          : params.tenantId,
      search: params.search,
      active: params.active,
      page: params.page,
      limit: params.limit,
    };

    const result = await this.beneficiaryRepository.listBeneficiaries(filters);

    const data = result.data.map(
      (beneficiary) =>
        new ListBeneficiariesResponseDto(
          beneficiary.id,
          beneficiary.name,
          beneficiary.cpf,
          beneficiary.email,
          !beneficiary.deletedAt,
          beneficiary.dependentType,
          beneficiary.subscriberName,
        ),
    );

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
