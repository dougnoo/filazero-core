import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ImportBeneficiariesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel file (.xlsx, .xls) or CSV file',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class BeneficiaryImportRow {
  Subestipulante?: string;
  Plano?: string;
  'Código Beneficiário'?: string;
  CPF: string;
  'Nome Beneficiário': string;
  'Matrícula'?: string;
  Tipo?: string; // TITULAR, CONJUGE, FILHO/FILHA, ENTEADO(A)
  Sexo?: string;
  'Data Nascimento': string;
  'Data Inclusão'?: string;
  Idade?: number;
  Situação?: string;
  'Data fim Inatividade'?: string;
  Cargo?: string;
  'Centro de Custo'?: string;
}

export class ImportResultDto {
  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  errorCount: number;

  @ApiProperty({ type: [Object] })
  errors: Array<{
    row: number;
    data: Partial<BeneficiaryImportRow>;
    error: string;
  }>;

  @ApiProperty({ type: [String] })
  createdUserIds: string[];
}
