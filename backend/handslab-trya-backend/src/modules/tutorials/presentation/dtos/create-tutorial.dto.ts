import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsInt,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export class CreateTutorialDto {
  @ApiProperty({ example: 'onboarding-welcome' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Bem-vindo ao Trya' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Conheça as principais funcionalidades da plataforma',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BENEFICIARY })
  @IsEnum(UserRole)
  targetRole: UserRole;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'dd6f2fce-c6f5-46e1-bf58-abb1e52d4832' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}
