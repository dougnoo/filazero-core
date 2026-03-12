import { HealthOperatorStatus } from '../../../../shared/domain/enums/health-operator-status.enum';

export type ListHealthOperatorsParams = {
  name?: string;
  /** Se true, retorna apenas operadoras com status REDE_CREDENCIADA_DISPONIVEL */
  enabledOnly?: boolean;
};

export type HealthOperatorModel = {
  id: string;
  name: string;
  status: HealthOperatorStatus;
};

export type CreateHealthOperatorData = {
  name: string;
};

export abstract class IHealthOperatorsRepository {
  abstract list(
    params: ListHealthOperatorsParams,
  ): Promise<HealthOperatorModel[]>;
  abstract findByName(name: string): Promise<HealthOperatorModel | null>;
  abstract findById(id: string): Promise<HealthOperatorModel | null>;
  abstract create(data: CreateHealthOperatorData): Promise<HealthOperatorModel>;
  abstract updateStatus(
    id: string,
    status: HealthOperatorStatus,
  ): Promise<HealthOperatorModel>;
}
