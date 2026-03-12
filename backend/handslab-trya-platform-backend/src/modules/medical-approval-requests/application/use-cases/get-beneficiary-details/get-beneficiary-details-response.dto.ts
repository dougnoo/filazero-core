import { ApiProperty } from '@nestjs/swagger';

export class HealthPlanDto {
  @ApiProperty({ example: 'Empresarial QC' })
  name: string;

  @ApiProperty({ example: '123456789' })
  cardNumber: string;
}

export class ChronicConditionDto {
  @ApiProperty({ example: 'Asma' })
  name: string;
}

export class MedicationDto {
  @ApiProperty({ example: 'Atenolol' })
  name: string;

  @ApiProperty({ example: '50mg', nullable: true })
  dosage: string | null;
}

export class GetBeneficiaryDetailsResponseDto {
  @ApiProperty({ example: '3017c88d-acdf-4be3-9443-36083f13836d' })
  id: string;

  @ApiProperty({ example: 'Bruno Amorim' })
  name: string;

  @ApiProperty({ example: 'bamorim@skopiadigital.com.br' })
  email: string;

  @ApiProperty({ example: '***.***.676-17' })
  cpf: string;

  @ApiProperty({ example: '10/10/1946' })
  birthDate: string;

  @ApiProperty({ example: '(68) 99151-5613' })
  phone: string;

  @ApiProperty({ example: 'poeira' })
  allergies: string;

  @ApiProperty({ type: HealthPlanDto })
  healthPlan: HealthPlanDto;

  @ApiProperty({ type: [ChronicConditionDto] })
  chronicConditions: ChronicConditionDto[];

  @ApiProperty({ type: [MedicationDto] })
  medications: MedicationDto[];
}
