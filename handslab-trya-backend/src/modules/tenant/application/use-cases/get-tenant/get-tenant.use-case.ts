import { Injectable, Inject } from '@nestjs/common';
import * as tenantRepositoryInterface from '../../../domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../domain/repositories/tenant.repository.token';
import { Tenant } from '../../../../../database/entities/tenant.entity';
import { TenantNotFoundError } from '../../../domain/errors/tenant-not-found.error';

@Injectable()
export class GetTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: tenantRepositoryInterface.ITenantRepository,
  ) {}

  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);

    if (!tenant) {
      throw new TenantNotFoundError();
    }

    return tenant;
  }
}
