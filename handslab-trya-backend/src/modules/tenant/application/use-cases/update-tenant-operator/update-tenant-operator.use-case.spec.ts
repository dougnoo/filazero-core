import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateTenantOperatorUseCase } from './update-tenant-operator.use-case';
import { ITenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../domain/repositories/tenant.repository.token';
import { IHealthOperatorsRepository } from '../../../../health-operators/domain/repositories/health-operators.repository';
import { IAuditRepository } from '../../../../../shared/domain/repositories/audit.repository.interface';
import { HealthOperatorStatus } from '../../../../../shared/domain/enums/health-operator-status.enum';
import { AuditEventType } from '../../../../../database/entities/audit-event.entity';

describe('UpdateTenantOperatorUseCase', () => {
  let useCase: UpdateTenantOperatorUseCase;
  let tenantRepo: jest.Mocked<ITenantRepository>;
  let healthOperatorsRepo: jest.Mocked<IHealthOperatorsRepository>;
  let auditRepo: jest.Mocked<IAuditRepository>;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Empresa ABC',
    operatorId: 'op-old',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockOperator = {
    id: 'op-new',
    name: 'Bradesco Saúde',
    status: HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL,
  };

  beforeEach(async () => {
    const mockTenantRepo: jest.Mocked<ITenantRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateOperator: jest.fn(),
    };

    const mockHealthOperatorsRepo: jest.Mocked<IHealthOperatorsRepository> = {
      list: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockAuditRepo: jest.Mocked<IAuditRepository> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTenantOperatorUseCase,
        { provide: TENANT_REPOSITORY_TOKEN, useValue: mockTenantRepo },
        { provide: IHealthOperatorsRepository, useValue: mockHealthOperatorsRepo },
        { provide: IAuditRepository, useValue: mockAuditRepo },
      ],
    }).compile();

    useCase = module.get<UpdateTenantOperatorUseCase>(UpdateTenantOperatorUseCase);
    tenantRepo = module.get(TENANT_REPOSITORY_TOKEN);
    healthOperatorsRepo = module.get(IHealthOperatorsRepository);
    auditRepo = module.get(IAuditRepository);
  });

  it('deve trocar operadora do tenant com sucesso', async () => {
    const params = {
      tenantId: 'tenant-123',
      operatorId: 'op-new',
      userId: 'user-123',
    };

    tenantRepo.findById.mockResolvedValue(mockTenant);
    healthOperatorsRepo.findById.mockResolvedValue(mockOperator);
    tenantRepo.updateOperator.mockResolvedValue({
      ...mockTenant,
      operatorId: 'op-new',
    });
    auditRepo.create.mockResolvedValue(undefined);

    const result = await useCase.execute(params);

    expect(result.previousOperatorId).toBe('op-old');
    expect(result.newOperatorId).toBe('op-new');
    expect(auditRepo.create).toHaveBeenCalledWith({
      eventType: AuditEventType.TENANT_OPERATOR_CHANGED,
      entityType: 'Tenant',
      entityId: 'tenant-123',
      userId: 'user-123',
      payload: {
        before: { operatorId: 'op-old' },
        after: { operatorId: 'op-new' },
      },
    });
  });

  it('deve lançar NotFoundException se tenant não existe', async () => {
    tenantRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 'not-found', operatorId: 'op-new' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se operadora não existe', async () => {
    tenantRepo.findById.mockResolvedValue(mockTenant);
    healthOperatorsRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 'tenant-123', operatorId: 'not-found' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException se operadora não está habilitada', async () => {
    tenantRepo.findById.mockResolvedValue(mockTenant);
    healthOperatorsRepo.findById.mockResolvedValue({
      ...mockOperator,
      status: HealthOperatorStatus.CADASTRADA,
    });

    await expect(
      useCase.execute({ tenantId: 'tenant-123', operatorId: 'op-new' }),
    ).rejects.toThrow(BadRequestException);
  });
});
