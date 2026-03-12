import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class SendContactMessageDto {
  @ApiProperty({
    description: 'Assunto da mensagem',
    example: 'Dúvida sobre o plano de saúde',
    minLength: 3,
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'Assunto é obrigatório' })
  @IsString()
  @MinLength(3, { message: 'Assunto deve ter pelo menos 3 caracteres' })
  @MaxLength(120, { message: 'Assunto deve ter no máximo 120 caracteres' })
  subject: string;

  @ApiProperty({
    description: 'Mensagem de contato',
    example: 'Gostaria de saber mais informações sobre a cobertura do meu plano.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'Mensagem é obrigatória' })
  @IsString()
  @MinLength(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' })
  @MaxLength(2000, { message: 'Mensagem deve ter no máximo 2000 caracteres' })
  message: string;
}

export class SendContactMessageResponseDto {
  @ApiProperty({
    description: 'Indica se a mensagem foi enviada com sucesso',
    example: true,
  })
  success: boolean;
}
