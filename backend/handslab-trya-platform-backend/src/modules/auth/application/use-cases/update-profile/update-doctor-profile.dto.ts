import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateAdminProfileDto } from './update-admin-profile.dto';

export class UpdateDoctorProfileDto extends UpdateAdminProfileDto {
  @ApiProperty({
    description:
      'CRM do médico com UF (ex: 123456-SP). Este campo pode ser atualizado APENAS por usuários com role DOCTOR. Se enviado por ADMIN, será ignorado silenciosamente.',
    example: '123456-SP',
    required: false,
  })
  @IsOptional()
  @IsString()
  crm?: string;

  @ApiProperty({
    description:
      'Especialidade médica do profissional (ex: Cardiologia, Neurologia, Pediatria). Este campo pode ser atualizado APENAS por usuários com role DOCTOR. Se enviado por ADMIN, será ignorado silenciosamente.',
    example: 'Cardiologia',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;
}
