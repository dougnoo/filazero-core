import { IntegrationType } from '../enums/integration-type.enum';

export interface IIntegrationRepository<T = any> {
  readonly type: IntegrationType;
  readonly name: string;

  healthCheck(): Promise<boolean>;
  execute(operation: string, params: any): Promise<T>;
}
