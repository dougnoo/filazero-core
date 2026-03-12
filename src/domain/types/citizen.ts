export interface Citizen {
  id: string;
  fullName: string;
  cpf: string;
  cns?: string; // Cartão Nacional de Saúde
  phone: string;
  email?: string;
  birthDate: string;
  gender: 'M' | 'F' | 'OTHER';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  chronicConditions?: string[];
  medications?: string[];
  allergies?: string[];
  isPregnant?: boolean;
  hasDisability?: boolean;
  isElderly?: boolean; // computed from birthDate
  createdAt: string;
  updatedAt: string;
}
