import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class DoctorDataDto {
  @ApiProperty({
    description: 'Doctor unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174001',
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
}

export class GetUserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
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

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Profile picture URL',
    example:
      'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
    required: false,
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'Doctor profile data (only present if user is a doctor)',
    type: DoctorDataDto,
    required: false,
  })
  doctor?: DoctorDataDto;
}
