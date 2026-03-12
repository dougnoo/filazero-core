import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

export class CreateAdminResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'us-east-1:12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@broken.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;
}
