import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CertificateAnalysisCronService {
  private readonly logger = new Logger(CertificateAnalysisCronService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private isInitialized = false;

  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
    private readonly configService: ConfigService,
  ) {
    const region = this.configService.get<string>(
      'aws.s3.bucketRegion',
      'sa-east-1',
    );
    this.bucketName = this.configService.get<string>('aws.s3.bucketName')!;

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.s3Client = new S3Client({
      region,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: { accessKeyId, secretAccessKey },
          }
        : {}),
    });

    // Aguarda 2 minutos após inicialização antes de permitir execução do cron
    setTimeout(() => {
      this.isInitialized = true;
      this.logger.log('Cron de análise de atestados habilitado');
    }, 120000); // 2 minutos
  }

  @Cron(CronExpression.EVERY_HOUR)
  async analyzePendingCertificates() {
    // Não executa se ainda não inicializou
    if (!this.isInitialized) {
      this.logger.debug('Aguardando inicialização completa da aplicação...');
      return;
    }

    this.logger.log('Iniciando análise de atestados pendentes...');

    try {
      // Busca apenas 1 atestado por vez para evitar rate limiting da API Bedrock
      // Como o cron roda a cada 5 minutos, isso garante processamento controlado
      const pendingCertificates = await this.repository.findPendingAnalysis(1);

      if (pendingCertificates.length === 0) {
        this.logger.log('Nenhum atestado pendente encontrado');
        return;
      }

      this.logger.log(
        `Encontrados ${pendingCertificates.length} atestados pendentes de análise`,
      );

      // Processa cada atestado (agora apenas 1 por execução)
      for (const certificate of pendingCertificates) {
        try {
          this.logger.log(
            `Processando atestado ${certificate.id} (${certificate.fileName})`,
          );

          // Baixa o arquivo do S3
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: certificate.s3Key,
          });

          const response = await this.s3Client.send(command);
          const fileBuffer = Buffer.from(
            await response.Body!.transformToByteArray(),
          );

          // Dispara análise assíncrona
          await this.repository.analyzeAsync(
            certificate.id,
            fileBuffer,
            certificate.mimeType,
          );

          this.logger.log(`Análise disparada para atestado ${certificate.id}`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro desconhecido';
          this.logger.error(
            `Erro ao processar atestado ${certificate.id}: ${errorMessage}`,
            error,
          );
          // Continua para o próximo atestado mesmo em caso de erro
        }
      }

      this.logger.log(
        `Análise de atestados pendentes concluída. Processados: ${pendingCertificates.length}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro no cron de análise de atestados: ${errorMessage}`,
        error,
      );
    }
  }
}
