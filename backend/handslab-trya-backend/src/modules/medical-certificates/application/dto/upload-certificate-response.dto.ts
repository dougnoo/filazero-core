import { ApiProperty } from '@nestjs/swagger';
import { AnalysisStatus } from '../../../../database/entities/medical-certificate.entity';

export class UploadCertificateResponseDto {
  @ApiProperty({ description: 'ID do atestado' })
  id: string;

  @ApiProperty({ description: 'Nome do arquivo' })
  fileName: string;

  @ApiProperty({ description: 'URL do arquivo no S3' })
  fileUrl: string;

  @ApiProperty({
    description:
      'Status da análise (PENDING = análise em andamento, PROCESSING = processando, COMPLETED = concluída, FAILED = falhou)',
    enum: AnalysisStatus,
  })
  analysisStatus: AnalysisStatus;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}
