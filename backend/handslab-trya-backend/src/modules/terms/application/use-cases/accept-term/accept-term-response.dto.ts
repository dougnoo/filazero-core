import { ApiProperty } from '@nestjs/swagger';

export class AcceptTermResponseDto {
  @ApiProperty({ example: 'Termo aceito com sucesso' })
  message: string;

  @ApiProperty({ example: true })
  alreadyAccepted: boolean;
}
