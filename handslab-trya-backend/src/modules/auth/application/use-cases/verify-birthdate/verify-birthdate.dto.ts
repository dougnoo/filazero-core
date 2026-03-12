import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class VerifyBirthdateDto {
  @ApiProperty({
    description: 'Hash de rastreamento da etapa anterior',
    example: 'abc123...',
  })
  @IsNotEmpty()
  @IsString()
  registrationHash: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  birthDate: string;
}

export class VerifyBirthdateResponseDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  registrationHash: string;
}
