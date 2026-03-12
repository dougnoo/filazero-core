import {
  IsString,
  MinLength,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ImageAnalysisDto } from './image-analysis.dto';
import { AttachmentDto } from './attachment.dto';
import { MedicalSummaryDto } from './medical-summary.dto';

export class PatientDataDto {
  @ApiProperty({
    description: 'Patient full name',
    example: 'João da Silva',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'List of symptoms reported by patient',
    example: ['febre', 'dor de cabeça'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms: string[];

  @ApiProperty({
    description: 'Image analyses from uploaded medical exams (optional)',
    type: () => [ImageAnalysisDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageAnalysisDto)
  @IsOptional()
  image_analyses?: ImageAnalysisDto[];

  @ApiProperty({
    description: 'Uploaded file attachments (optional)',
    type: () => [AttachmentDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ApiProperty({
    description: 'AI-generated medical summary and analysis',
    type: () => MedicalSummaryDto,
  })
  @ValidateNested()
  @Type(() => MedicalSummaryDto)
  medical_summary: MedicalSummaryDto;
}
