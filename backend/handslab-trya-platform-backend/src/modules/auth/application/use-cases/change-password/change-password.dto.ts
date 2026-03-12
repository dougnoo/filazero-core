import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Senha atual do usuário',
    example: 'SenhaAtual@123',
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha@456',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
  newPassword: string;
}
