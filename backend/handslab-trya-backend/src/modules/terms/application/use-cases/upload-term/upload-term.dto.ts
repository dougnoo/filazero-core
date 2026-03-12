import { IsEnum, IsNotEmpty, IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TermType } from '../../../../../database/entities/term-version.entity';

export class UploadTermDto {
  @ApiProperty({
    enum: TermType,
    description: 'Tipo do termo',
    example: TermType.TERMS_OF_USE,
  })
  @IsEnum(TermType)
  @IsNotEmpty()
  type: TermType;

  @ApiProperty({
    description: 'Data de vigência do termo',
    example: '2026-03-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiProperty({
    description: 'Descrição das alterações',
    example: 'Atualização da cláusula 5.2 sobre privacidade de dados',
    required: false,
  })
  @IsString()
  @IsOptional()
  changeDescription?: string;

  @ApiProperty({
    description: 'Versão do termo (ex: 1, 2, 3 ou 1.0, 2.1). Quando não informada, é gerada automaticamente.',
    example: '2',
    required: false,
  })
  @IsString()
  @IsOptional()
  version?: string;
}
