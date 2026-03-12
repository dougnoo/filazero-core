import { Company } from '../entities/company.entity';

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
  findByTenantId(tenantId: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  create(company: Company): Promise<Company>;
  save(company: Company): Promise<Company>;
}
