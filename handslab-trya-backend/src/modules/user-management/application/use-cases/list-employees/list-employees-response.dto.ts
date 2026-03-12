import { ApiProperty } from '@nestjs/swagger';

export class ListEmployeesResponseDto {
  @ApiProperty({ description: 'ID do usuário' })
  id: string;

  @ApiProperty({ description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ description: 'CPF do usuário', nullable: true })
  cpf: string | null;

  @ApiProperty({ description: 'Email do usuário' })
  email: string | null;

  @ApiProperty({ description: 'Tipo do usuário (HR ou BENEFICIARY)' })
  type: string;

  @ApiProperty({ description: 'Nome da empresa' })
  tenantName: string;

  @ApiProperty({ description: 'Status ativo/inativo' })
  active: boolean;
}
