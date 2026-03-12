import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class CreateDoctorResponseDto {
  @ApiProperty({
    description: 'Doctor unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Doctor email address',
    example: 'doctor@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Doctor full name',
    example: 'Dr. John Smith',
  })
  name: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: 'Medical specialty',
    example: 'Cardiology',
  })
  specialty: string;

  @ApiProperty({
    description: 'Medical board code',
    enum: BoardCode,
    example: BoardCode.CRM,
  })
  boardCode: BoardCode;

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
}
