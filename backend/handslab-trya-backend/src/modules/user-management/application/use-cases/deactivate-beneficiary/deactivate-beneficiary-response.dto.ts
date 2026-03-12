import { ApiProperty } from '@nestjs/swagger';

export class DeactivateBeneficiaryResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se a desativação foi bem-sucedida',
  })
  success: boolean;

  @ApiProperty({
    example: 'Beneficiário desativado com sucesso',
    description: 'Mensagem de confirmação',
  })
  message: string;
}
