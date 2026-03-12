import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../../database/entities/tenant.entity';
import {
  ITenantRepository,
  CreateTenantData,
  UpdateTenantData,
  ListTenantsFilters,
} from '../../domain/repositories/tenant.repository.interface';
import { TenantNotFoundError } from '../../domain/errors/tenant-not-found.error';

@Injectable()
export class TypeOrmTenantRepository implements ITenantRepository {
  private readonly logger = new Logger(TypeOrmTenantRepository.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(data: CreateTenantData): Promise<Tenant> {
    try {
      const tenant = this.tenantRepository.create({
        name: data.name,
        operatorId: data.operatorId,
        active: true,
      });

      const savedTenant = await this.tenantRepository.save(tenant);

      this.logger.log(`Tenant criado: ${savedTenant.id} (${savedTenant.name})`);

      return savedTenant;
    } catch (error) {
      this.logger.error(`Erro ao criar tenant: ${error}`);

      if (error instanceof Error && error.message.includes('duplicate key')) {
        if (error.message.includes('name')) {
          throw new Error('CNPJ já cadastrado no sistema');
        }
      }

      throw new Error(
        `Erro ao criar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { id },
        relations: ['users'],
      });

      return tenant || null;
    } catch (error) {
      this.logger.error(`Erro ao buscar tenant por ID: ${error}`);
      return null;
    }
  }

  async findByName(name: string): Promise<Tenant | null> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { name },
      });

      return tenant || null;
    } catch (error) {
      this.logger.error(`Erro ao buscar tenant por nome: ${error}`);
      return null;
    }
  }

  async list(filters: ListTenantsFilters): Promise<Tenant[]> {
    try {
      const query = this.tenantRepository.createQueryBuilder('tenant');

      if (filters.active !== undefined) {
        query.andWhere('tenant.active = :active', { active: filters.active });
      }

      if (filters.limit) {
        query.take(filters.limit);
      }

      if (filters.offset) {
        query.skip(filters.offset);
      }

      query.orderBy('tenant.name', 'ASC');

      const tenants = await query.getMany();

      return tenants;
    } catch (error) {
      this.logger.error(`Erro ao listar tenants: ${error}`);
      throw new Error(
        `Erro ao listar tenants: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    try {
      const tenant = await this.findById(id);

      if (!tenant) {
        throw new TenantNotFoundError();
      }

      Object.assign(tenant, data);

      const updatedTenant = await this.tenantRepository.save(tenant);

      this.logger.log(`Tenant atualizado: ${updatedTenant.id}`);

      return updatedTenant;
    } catch (error) {
      if (error instanceof TenantNotFoundError) {
        throw error;
      }

      this.logger.error(`Erro ao atualizar tenant: ${error}`);
      throw new Error(
        `Erro ao atualizar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const tenant = await this.findById(id);

      if (!tenant) {
        throw new TenantNotFoundError();
      }

      // Soft delete - marca como inativo
      tenant.active = false;
      await this.tenantRepository.save(tenant);

      this.logger.log(`Tenant desativado: ${id}`);
    } catch (error) {
      if (error instanceof TenantNotFoundError) {
        throw error;
      }

      this.logger.error(`Erro ao desativar tenant: ${error}`);
      throw new Error(
        `Erro ao desativar tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async updateOperator(tenantId: string, operatorId: string): Promise<Tenant> {
    try {
      const tenant = await this.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError();
      }

      tenant.operatorId = operatorId;
      const updatedTenant = await this.tenantRepository.save(tenant);

      this.logger.log(
        `Tenant ${tenantId} atualizado com operadora ${operatorId}`,
      );

      return updatedTenant;
    } catch (error) {
      if (error instanceof TenantNotFoundError) {
        throw error;
      }

      this.logger.error(`Erro ao atualizar operadora do tenant: ${error}`);
      throw new Error(
        `Erro ao atualizar operadora do tenant: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }
}
