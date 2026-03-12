import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateHealthOperatorUseCase } from './create-health-operator.use-case';
import { IHealthOperatorsRepository } from '../../domain/repositories/health-operators.repository';
import { IAuditRepository } from '../../../../shared/domain/repositories/audit.repository.interface';
import { HealthOperatorStatus } from '../../../../shared/domain/enums/health-operator-status.enum';
import { AuditEventType } from '../../../../database/entities/audit-event.entity';

describe('CreateHealthOperatorUseCase', () => {
  let useCase: CreateHealthOperatorUseCase;
  let healthOperatorsRepo: jest.Mocked<IHealthOperatorsRepository>;
  let auditRepo: jest.Mocked<IAuditRepository>;

  beforeEach(async () => {
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
        CreateHealthOperatorUseCase,
        { provide: IHealthOperatorsRepository, useValue: mockHealthOperatorsRepo },
        { provide: IAuditRepository, useValue: mockAuditRepo },
      ],
    }).compile();

    useCase = module.get<CreateHealthOperatorUseCase>(CreateHealthOperatorUseCase);
    healthOperatorsRepo = module.get(IHealthOperatorsRepository);
    auditRepo = module.get(IAuditRepository);
  });

  it('deve criar uma operadora com sucesso', async () => {
    const params = { name: 'Bradesco Saúde', userId: 'user-123' };
    const createdOperator = {
      id: 'op-123',
      name: 'Bradesco Saúde',
      status: HealthOperatorStatus.CADASTRADA,
    };

    healthOperatorsRepo.findByName.mockResolvedValue(null);
    healthOperatorsRepo.create.mockResolvedValue(createdOperator);
    auditRepo.create.mockResolvedValue(undefined);

    const result = await useCase.execute(params);

    expect(result).toEqual(createdOperator);
    expect(healthOperatorsRepo.findByName).toHaveBeenCalledWith('Bradesco Saúde');
    expect(healthOperatorsRepo.create).toHaveBeenCalledWith({ name: 'Bradesco Saúde' });
    expect(auditRepo.create).toHaveBeenCalledWith({
      eventType: AuditEventType.OPERATOR_CREATED,
      entityType: 'HealthOperator',
      entityId: 'op-123',
      userId: 'user-123',
      payload: { status: HealthOperatorStatus.CADASTRADA },
    });
  });

  it('deve lançar ConflictException se operadora já existe', async () => {
    const params = { name: 'Amil' };
    const existingOperator = {
      id: 'op-existing',
      name: 'Amil',
      status: HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL,
    };

    healthOperatorsRepo.findByName.mockResolvedValue(existingOperator);

    await expect(useCase.execute(params)).rejects.toThrow(ConflictException);
    expect(healthOperatorsRepo.create).not.toHaveBeenCalled();
  });
});
