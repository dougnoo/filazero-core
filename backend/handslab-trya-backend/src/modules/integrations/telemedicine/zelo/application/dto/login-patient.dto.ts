import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPatientDto {
  @ApiProperty({
    description: 'CPF do paciente (com ou sem formatação)',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;
}
