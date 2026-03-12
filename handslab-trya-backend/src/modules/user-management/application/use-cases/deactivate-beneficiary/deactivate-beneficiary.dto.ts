import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateBeneficiaryDto {
  @ApiProperty({
    example: '3017c88d-acdf-4be3-9443-36083f13836d',
    description: 'ID do beneficiário',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
