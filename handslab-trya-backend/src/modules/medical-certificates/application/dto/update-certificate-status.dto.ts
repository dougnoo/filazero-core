import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CertificateStatus } from '../../../../database/entities/medical-certificate.entity';

export class UpdateCertificateStatusDto {
  @ApiProperty({
    description: 'Novo status do atestado',
    enum: CertificateStatus,
    example: CertificateStatus.VIEWED,
  })
  @IsNotEmpty()
  @IsEnum(CertificateStatus)
  status: CertificateStatus;
}
