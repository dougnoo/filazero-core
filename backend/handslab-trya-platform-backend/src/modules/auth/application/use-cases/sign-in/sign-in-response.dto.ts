import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums';

export class SignInResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de atualização',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role do usuário',
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  role: UserRole;

  constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    userId: string,
    email: string,
    role: UserRole,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.userId = userId;
    this.email = email;
    this.role = role;
  }
}
