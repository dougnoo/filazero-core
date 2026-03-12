import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @ApiProperty({
    description: 'Role do usuário',
    enum: UserRole,
    example: UserRole.DOCTOR,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser um valor válido' })
  role?: UserRole;

  @ApiProperty({
    description: 'Se o email foi verificado',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isEmailVerified deve ser um boolean' })
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'URL da foto de perfil',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Picture deve ser uma string (URL)' })
  picture?: string;
}
