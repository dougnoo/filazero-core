import { Injectable, ConflictException, Logger } from '@nestjs/common';
import {
  IHealthOperatorsRepository,
  HealthOperatorModel,
} from '../../domain/repositories/health-operators.repository';
import { IAuditRepository } from '../../../../shared/domain/repositories/audit.repository.interface';
import { AuditEventType } from '../../../../database/entities/audit-event.entity';

export type CreateHealthOperatorParams = {
  name: string;
  userId?: string;
};

@Injectable()
export class CreateHealthOperatorUseCase {
  private readonly logger = new Logger(CreateHealthOperatorUseCase.name);

  constructor(
    private readonly repo: IHealthOperatorsRepository,
    private readonly auditRepo: IAuditRepository,
  ) {}

  async execute(params: CreateHealthOperatorParams): Promise<HealthOperatorModel> {
    const { name, userId } = params;

    // Verificar se já existe operadora com esse nome
    const existing = await this.repo.findByName(name);
    if (existing) {
      throw new ConflictException('Já existe uma operadora com esse nome');
    }

    const created = await this.repo.create({ name });

    // Registrar auditoria
    await this.auditRepo.create({
      eventType: AuditEventType.OPERATOR_CREATED,
      entityType: 'HealthOperator',
      entityId: created.id,
      userId,
      payload: {
        status: created.status,
      },
    });

    this.logger.log(
      `Operadora criada: id=${created.id}, name=${created.name}, status=${created.status}`,
    );

    return created;
  }
}
