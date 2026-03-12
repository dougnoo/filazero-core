export interface BeneficiaryDataDto {
  id: string;
  name: string;
  email: string | null;
  cpf: string | null;
  birthDate: Date;
  phone: string | null;
  allergies: string | null;
  healthPlan: {
    name: string;
    cardNumber: string;
  } | null;
  chronicConditions: Array<{
    name: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string | null;
  }>;
}
