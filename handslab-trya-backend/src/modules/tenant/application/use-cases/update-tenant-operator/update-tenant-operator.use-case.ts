import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTenantOperatorResponseDto } from './update-tenant-operator-response.dto';
import type { ITenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../domain/repositories/tenant.repository.token';
import { IHealthOperatorsRepository } from '../../../../health-operators/domain/repositories/health-operators.repository';
import { HealthOperatorStatus } from '../../../../../shared/domain/enums/health-operator-status.enum';
import { IAuditRepository } from '../../../../../shared/domain/repositories/audit.repository.interface';
import { AuditEventType } from '../../../../../database/entities/audit-event.entity';

export interface UpdateTenantOperatorParams {
  tenantId: string;
  operatorId: string;
  userId?: string;
}

@Injectable()
export class UpdateTenantOperatorUseCase {
  private readonly logger = new Logger(UpdateTenantOperatorUseCase.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
    private readonly healthOperatorsRepository: IHealthOperatorsRepository,
    private readonly auditRepository: IAuditRepository,
  ) {}

  async execute(
    params: UpdateTenantOperatorParams,
  ): Promise<UpdateTenantOperatorResponseDto> {
    const { tenantId, operatorId, userId } = params;

    // Buscar tenant
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    // Validar se a operadora existe
    const operator = await this.healthOperatorsRepository.findById(operatorId);
    if (!operator) {
      throw new BadRequestException('Operadora não encontrada');
    }

    // Validar se a operadora está habilitada
    if (operator.status !== HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL) {
      throw new BadRequestException(
        'Operadora ainda não possui rede credenciada disponível',
      );
    }

    const previousOperatorId = tenant.operatorId || null;

    // Atualizar operadora do tenant
    const updatedTenant = await this.tenantRepository.updateOperator(
      tenantId,
      operatorId,
    );

    // Registrar auditoria com before/after (somente IDs)
    await this.auditRepository.create({
      eventType: AuditEventType.TENANT_OPERATOR_CHANGED,
      entityType: 'Tenant',
      entityId: tenantId,
      userId,
      payload: {
        before: { operatorId: previousOperatorId },
        after: { operatorId },
      },
    });

    this.logger.log(
      `Operadora do tenant ${tenantId} alterada de ${previousOperatorId} para ${operatorId}`,
    );

    return {
      id: updatedTenant.id,
      name: updatedTenant.name,
      previousOperatorId,
      newOperatorId: operatorId,
      updatedAt: updatedTenant.updatedAt,
    };
  }
}
