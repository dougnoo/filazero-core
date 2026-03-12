import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { Company } from '../../domain/entities/company.entity';
import { CompanyEntity } from '../entities/company.entity';
import { CompanyMapper } from '../mappers/company.mapper';

@Injectable()
export class TypeORMCompanyRepository implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async findById(id: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { id } });
    return entity ? CompanyMapper.toDomain(entity) : null;
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { cnpj } });
    return entity ? CompanyMapper.toDomain(entity) : null;
  }

  async findByTenantId(tenantId: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({
      where: { tenantId },
    });
    return entity ? CompanyMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Company[]> {
    const entities = await this.companyRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => CompanyMapper.toDomain(entity));
  }

  async create(company: Company): Promise<Company> {
    const entity = CompanyMapper.toEntity(company);
    const savedEntity = await this.companyRepository.save(entity);
    return CompanyMapper.toDomain(savedEntity);
  }

  async save(company: Company): Promise<Company> {
    const entity = CompanyMapper.toEntity(company);
    const savedEntity = await this.companyRepository.save(entity);
    return CompanyMapper.toDomain(savedEntity);
  }
}
