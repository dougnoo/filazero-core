import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicalDocumentType } from '../../../../database/entities/medical-document.entity';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'ID do membro da família associado ao documento',
    example: 'uuid-member-id',
  })
  @IsNotEmpty()
  @IsUUID()
  memberUserId: string;

  @ApiProperty({
    description: 'Tipo do documento',
    enum: MedicalDocumentType,
    example: MedicalDocumentType.LAB_EXAM,
  })
  @IsNotEmpty()
  @IsEnum(MedicalDocumentType)
  documentType: MedicalDocumentType;

  @ApiProperty({
    description: 'Categoria do documento (deve ser compatível com o tipo)',
    example: 'Hemograma',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Título do documento',
    example: 'Exame de Sangue - Janeiro 2026',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description:
      'Data de emissão do documento (para exames/vacinas, inserir a data de realização)',
    example: '2026-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({
    description: 'Data de validade do documento (opcional)',
    example: '2027-01-15',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais (opcional)',
    example: 'Jejum de 12 horas antes do exame',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
