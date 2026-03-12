import { ApiProperty } from '@nestjs/swagger';

export class CreateHrResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'us-east-1:12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'rh@broken.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Santos',
  })
  name: string;
}
