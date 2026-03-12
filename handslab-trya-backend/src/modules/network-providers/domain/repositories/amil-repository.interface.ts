import { AmilPlan } from '../entities/amil-plan.entity';
import { AmilState } from '../entities/amil-state.entity';
import { AmilMunicipality } from '../entities/amil-municipality.entity';
import { AmilNeighborhood } from '../entities/amil-neighborhood.entity';
import { AmilServiceType } from '../entities/amil-service-type.entity';
import { AmilSpecialty } from '../entities/amil-specialty.entity';
import { AmilResult } from '../entities/amil-provider.entity';

export const AMIL_REPOSITORY_TOKEN = Symbol('AMIL_REPOSITORY_TOKEN');

export interface IAmilRepository {
  getPlans(operadora: string): Promise<AmilPlan[]>;
  searchByCpf(cpf: string): Promise<AmilPlan[]>;
  getStates(networkCode: string, operadora: string): Promise<{ UF: string }[]>;
  getMunicipalities(
    networkCode: string,
    state: string,
    operadora: string,
  ): Promise<{ Municipality: string }[]>;
  getNeighborhoods(
    networkCode: string,
    state: string,
    municipality: string,
    operadora: string,
  ): Promise<{ Neighborhood: string }[]>;
  getServiceTypes(
    networkCode: string,
    state: string,
    municipality: string,
    neighborhood: string,
    operadora: string,
  ): Promise<{ ServiceType: string }[]>;
  getSpecialties(
    networkCode: string,
    state: string,
    municipality: string,
    neighborhood: string,
    serviceType: string,
    operadora: string,
  ): Promise<{ Specialty: string }[]>;
  searchProvidersInstitucional(params: {
    networkCode: string;
    state: string;
    municipality: string;
    neighborhood: string;
    specialty: string;
    serviceType: string;
    operator?: string;
    modality?: string;
    context?: string;
  }): Promise<any[]>;
  searchProviders(params: {
    networkCode: string;
    planCode: string;
    state: string;
    municipality: string;
    serviceType: string;
    specialty: string;
    neighborhood?: string;
  }): Promise<AmilResult>;
}
