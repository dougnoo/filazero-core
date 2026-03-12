import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

export class GetUserInfoResponseDto {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName?: string | null;
  cpf: string | null;
  phone?: string | null;
  birthDate: Date;
  onboardedAt?: Date | null;
  medications?: Array<{ id: string; name: string; dosage?: string | null }>;
  chronicConditions?: Array<{ id: string; name: string }>;
  allergies?: string;
  activePlan?: {
    planName: string;
    operatorName: string;
    activeUntil?: Date | null;
    cardNumber?: string;
  } | null;
}
