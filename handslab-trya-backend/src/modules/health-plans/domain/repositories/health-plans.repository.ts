export type ListHealthPlansParams = {
  name?: string;
  operatorId?: string;
};

export type HealthPlanModel = {
  id: string;
  name: string;
};

export abstract class IHealthPlansRepository {
  abstract list(params: ListHealthPlansParams): Promise<HealthPlanModel[]>;
  abstract findByNameAndOperator(
    name: string,
    operatorId: string,
  ): Promise<HealthPlanModel | null>;
  abstract create(name: string, operatorId: string): Promise<HealthPlanModel>;
}
