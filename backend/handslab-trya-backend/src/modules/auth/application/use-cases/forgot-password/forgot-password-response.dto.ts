import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Código de verificação enviado para o email',
  })
  message: string;

  @ApiProperty({
    description: 'Indica se o email foi enviado com sucesso',
    example: true,
  })
  success: boolean;
}
