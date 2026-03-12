import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'ID único do usuário no banco de dados PostgreSQL',
    example: '01234567-89ab-cdef-0123-456789abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário (usado para login)',
    example: 'user@trya.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    enum: UserRole,
    description:
      'Role do usuário no sistema. ADMIN tem acesso administrativo completo. DOCTOR pode revisar aprovações.',
    example: UserRole.ADMIN,
    examples: ['ADMIN', 'DOCTOR'],
  })
  role: UserRole;

  @ApiProperty({
    description:
      'Telefone do usuário no formato E.164 internacional (+5511999999999)',
    example: '+5511999999999',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description:
      'Status de ativação do usuário. Usuários inativos não podem fazer login.',
    example: true,
  })
  active: boolean;

  @ApiPropertyOptional({
    description: 'Medical board code',
    enum: BoardCode,
    example: BoardCode.CRM,
  })
  boardCode?: BoardCode;

  @ApiProperty({
    description: 'Board registration number',
    example: '123456',
  })
  boardNumber?: string;

  @ApiProperty({
    description: 'Board state (UF)',
    example: 'SP',
  })
  boardState?: string;

  @ApiProperty({
    description:
      'Especialidade médica do profissional. Este campo é retornado APENAS para usuários com role DOCTOR.',
    example: 'Cardiologia',
    required: false,
  })
  specialty?: string;

  @ApiProperty({
    description: 'Data e hora de criação da conta no formato ISO 8601',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description:
      'Data e hora da última atualização do perfil no formato ISO 8601',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'URL da foto de perfil do usuário armazenada no S3',
    example:
      'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
    required: false,
  })
  profilePictureUrl?: string;
}
