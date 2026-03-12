import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';

export class CreateAdminResponseDto {
  @ApiProperty({
    description: 'Admin unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Admin full name',
    example: 'John Smith',
  })
  name: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: 'User role',
    example: UserRole.ADMIN,
    enum: UserRole,
  })
  role: UserRole;
}
