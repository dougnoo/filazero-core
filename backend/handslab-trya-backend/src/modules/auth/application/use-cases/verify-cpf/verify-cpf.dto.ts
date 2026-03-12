import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsCPF } from '../../../../../shared/validators/is-cpf.validator';

export class VerifyCpfDto {
  @ApiProperty({
    description: 'CPF do beneficiário',
    example: '123.456.789-00',
  })
  @IsNotEmpty()
  @IsString()
  @IsCPF()
  cpf: string;
}

export class VerifyCpfResponseDto {
  @ApiProperty()
  canProceed: boolean;

  @ApiProperty()
  registrationHash: string;
}
