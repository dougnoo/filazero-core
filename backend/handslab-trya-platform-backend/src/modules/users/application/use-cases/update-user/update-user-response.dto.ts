import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';

export class UpdateUserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    example: UserRole.ADMIN,
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
}
