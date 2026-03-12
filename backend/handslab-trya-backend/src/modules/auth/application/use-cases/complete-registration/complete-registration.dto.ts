import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CompleteRegistrationDto {
  @ApiProperty({
    description: 'Hash de rastreamento da etapa anterior',
    example: 'abc123...',
  })
  @IsNotEmpty()
  @IsString()
  registrationHash: string;

  @ApiProperty({
    description: 'Email do beneficiário',
    example: 'usuario@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Telefone do beneficiário',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CompleteRegistrationResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  email: string;
}
