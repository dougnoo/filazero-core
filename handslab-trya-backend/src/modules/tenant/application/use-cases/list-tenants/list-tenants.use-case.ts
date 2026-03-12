import { Injectable, Inject } from '@nestjs/common';
import * as tenantRepositoryInterface from '../../../domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../domain/repositories/tenant.repository.token';
import { ListTenantsResponseDto } from './list-tenants-response.dto';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class ListTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: tenantRepositoryInterface.ITenantRepository,
  ) {}

  async execute(
    activeOnly: boolean = true,
    userRole?: UserRole,
    userTenantId?: string,
  ): Promise<ListTenantsResponseDto[]> {
    const tenants = await this.tenantRepository.list({
      active: activeOnly,
    });

    // Se for HR, retorna apenas o tenant dele
    if (userRole === UserRole.HR && userTenantId) {
      const filtered = tenants.filter((tenant) => tenant.id === userTenantId);
      return filtered.map(
        (tenant) => new ListTenantsResponseDto(tenant.id, tenant.name),
      );
    }

    return tenants.map(
      (tenant) => new ListTenantsResponseDto(tenant.id, tenant.name),
    );
  }
}
