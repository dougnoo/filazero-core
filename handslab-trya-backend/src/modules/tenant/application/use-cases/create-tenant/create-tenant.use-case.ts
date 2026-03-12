import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CreateTenantDto } from './create-tenant.dto';
import { CreateTenantResponseDto } from './create-tenant-response.dto';
import * as tenantRepositoryInterface from '../../../domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../domain/repositories/tenant.repository.token';
import { TenantAlreadyExistsError } from '../../../domain/errors/tenant-already-exists.error';
import { IHealthOperatorsRepository } from '../../../../health-operators/domain/repositories/health-operators.repository';
import { HealthOperatorStatus } from '../../../../../shared/domain/enums/health-operator-status.enum';
import { IAuditRepository } from '../../../../../shared/domain/repositories/audit.repository.interface';
import { AuditEventType } from '../../../../../database/entities/audit-event.entity';

export interface CreateTenantParams extends CreateTenantDto {
  userId?: string;
}

@Injectable()
export class CreateTenantUseCase {
  private readonly logger = new Logger(CreateTenantUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: tenantRepositoryInterface.ITenantRepository,
    private readonly healthOperatorsRepository: IHealthOperatorsRepository,
    private readonly auditRepository: IAuditRepository,
  ) {}

  async execute(params: CreateTenantParams): Promise<CreateTenantResponseDto> {
    const { name, operatorId, userId } = params;

    // Verificar se o nome já existe
    const existingTenantByName = await this.tenantRepository.findByName(name);
    if (existingTenantByName) {
      throw new TenantAlreadyExistsError(
        'Nome da empresa já cadastrado no sistema',
      );
    }

    // Validar se a operadora existe
    const operator = await this.healthOperatorsRepository.findById(operatorId);
    if (!operator) {
      throw new BadRequestException('Operadora não encontrada');
    }

    // Validar se a operadora está habilitada (rede credenciada disponível)
    if (operator.status !== HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL) {
      throw new BadRequestException(
        'Operadora ainda não possui rede credenciada disponível. Importe a rede credenciada antes de vincular a um tenant.',
      );
    }

    // Criar tenant
    const tenant = await this.tenantRepository.create({
      name,
      operatorId,
    });

    // Registrar auditoria
    await this.auditRepository.create({
      eventType: AuditEventType.TENANT_CREATED,
      entityType: 'Tenant',
      entityId: tenant.id,
      userId,
      payload: {
        operatorId,
      },
    });

    this.logger.log(
      `Tenant criado com sucesso: ${tenant.id} (${tenant.name}) com operadora ${operatorId}`,
    );

    return {
      id: tenant.id,
      name: tenant.name,
      createdAt: tenant.createdAt,
    };
  }
}
