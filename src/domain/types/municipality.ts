import { UnitType } from '../enums/unit-type';

export interface Municipality {
  id: string;
  name: string;
  state: string;
  ibgeCode: string;
  isActive: boolean;
  createdAt: string;
}

export interface HealthUnit {
  id: string;
  municipalityId: string;
  name: string;
  type: UnitType;
  address: string;
  phone?: string;
  sectors: string[];
  isActive: boolean;
  createdAt: string;
}
