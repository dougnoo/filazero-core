import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  memedToken: string; // Token retornado pelo widget Memed no frontend

  @IsString()
  @IsNotEmpty()
  memedPrescriptionId: string; // ID da prescrição no Memed (data.prescricao.id)

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  patientCpf?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
