import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Senha redefinida com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Indica se a senha foi redefinida com sucesso',
    example: true,
  })
  success: boolean;
}
