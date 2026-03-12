import { ApiProperty } from '@nestjs/swagger';

export class DeactivateHrResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Usuário RH desativado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'ID do usuário RH desativado',
    example: 'uuid-do-hr',
  })
  id: string;
}
