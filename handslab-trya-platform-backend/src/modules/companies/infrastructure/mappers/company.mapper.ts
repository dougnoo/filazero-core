import { Company } from '../../domain/entities/company.entity';
import { CompanyEntity } from '../entities/company.entity';

export class CompanyMapper {
  static toDomain(entity: CompanyEntity): Company {
    return Company.reconstitute({
      id: entity.id,
      name: entity.name,
      cnpj: entity.cnpj,
      email: entity.email,
      tenantId: entity.tenantId,
      baseUrl: entity.baseUrl,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(domain: Company): CompanyEntity {
    const entity = new CompanyEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.cnpj = domain.cnpj;
    entity.email = domain.email;
    entity.tenantId = domain.tenantId;
    entity.baseUrl = domain.baseUrl;
    entity.active = domain.active;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
