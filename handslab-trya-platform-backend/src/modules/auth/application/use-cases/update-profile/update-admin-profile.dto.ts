import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiProperty({
    description:
      'Nome completo do administrador. Deve ter no mínimo 3 caracteres. Este campo pode ser atualizado por usuários ADMIN e DOCTOR.',
    example: 'João Silva',
    required: false,
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name?: string;

  @ApiProperty({
    description:
      'Telefone no formato E.164 internacional (ex: +5511999999999). Deve começar com + seguido do código do país e número. Este campo pode ser atualizado por usuários ADMIN e DOCTOR.',
    example: '+5511999999999',
    required: false,
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Telefone deve estar no formato E.164 (+5511999999999)',
  })
  phone?: string;
}
