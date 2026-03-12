import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class UpdateDoctorResponseDto {
  @ApiProperty({
    description: 'User unique identifier (same as userId for consistency)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

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
  boardNumber: string;

  @ApiProperty({
    description: 'Board state (UF)',
    example: 'SP',
  })
  boardState: string;

  @ApiProperty({
    description: 'Medical specialty',
    example: 'Cardiology',
  })
  specialty: string;

  @ApiProperty({
    description: 'Doctor creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Doctor last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User email address',
    example: 'doctor@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Dr. John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    example: UserRole.DOCTOR,
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Phone number',
    example: '+5511999999999',
  })
  phone: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  active: boolean;
}
