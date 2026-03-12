import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../../shared/domain/enums/user-role.enum';

export class ListUsersDto {
  @ApiProperty({
    description: 'ID do tenant para filtrar usuários',
    example: 'broken-company-id',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tenant ID deve ser uma string' })
  tenantId?: string;

  @ApiProperty({
    description: 'Role para filtrar usuários',
    enum: UserRole,
    example: UserRole.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser um valor válido' })
  role?: UserRole;

  @ApiProperty({
    description: 'Número máximo de usuários por página',
    example: 10,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser pelo menos 1' })
  limit?: number;

  @ApiProperty({
    description: 'Token para paginação (próxima página)',
    example: 'eyJ0b2tlbiI6InNvbWV0aGluZyJ9',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Next token deve ser uma string' })
  nextToken?: string;
}
