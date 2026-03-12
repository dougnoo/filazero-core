import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  LanguageCode as AWSLanguageCode,
  MediaFormat as AWSMediaFormat,
} from '@aws-sdk/client-transcribe';
import {
  ITranscriptionClient,
  ExternalTranscriptionJob,
  TranscriptionJobSettings,
} from '../domain/interfaces/transcription-client.interface';
import { TranscriptionJobStatus } from '../domain/transcription-job.entity';

/**
 * Infrastructure Adapter - AWS Transcribe Client Implementation
 * Implements ITranscriptionClient interface using AWS SDK
 */
@Injectable()
export class TranscribeClientAdapter implements ITranscriptionClient {
  private readonly logger = new Logger(TranscribeClientAdapter.name);
  private readonly client: TranscribeClient;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const runtime = this.configService.get<string>('AWS_RUNTIME', 'aws');

    const config = { region };
    this.client = new TranscribeClient(config);

    this.logger.log(`Transcribe Client initialized: region=${region}, runtime=${runtime}`);
  }

  async startTranscriptionJob(
    jobName: string,
    audioStorageUri: string,
    mediaFormat: string,
    languageCode: string,
    outputBucketName: string,
    outputKey: string,
    settings?: TranscriptionJobSettings,
  ): Promise<ExternalTranscriptionJob> {
    try {
      const awsSettings = this.buildAWSSettings(settings);

      const params = {
        TranscriptionJobName: jobName,
        LanguageCode: this.mapLanguageCode(languageCode),
        MediaFormat: this.mapMediaFormat(mediaFormat),
        Media: {
          MediaFileUri: audioStorageUri,
        },
        Settings: awsSettings,
        OutputBucketName: outputBucketName,
        OutputKey: outputKey,
      };

      this.logger.debug(`Starting transcription job: ${jobName}`);
      const command = new StartTranscriptionJobCommand(params);
      const response = await this.client.send(command);

      this.logger.log(`🚀 Transcription job started: ${jobName}`);

      return this.mapToExternalJob(response.TranscriptionJob!);
    } catch (error) {
      this.logger.error(`❌ Failed to start transcription job: ${jobName}`, error);
      throw new Error(`Failed to start transcription: ${error.message}`);
    }
  }

  async getTranscriptionJobStatus(jobName: string): Promise<ExternalTranscriptionJob> {
    try {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      });

      const response = await this.client.send(command);
      const job = response.TranscriptionJob!;

      this.logger.debug(`Job ${jobName} status: ${job.TranscriptionJobStatus}`);

      return this.mapToExternalJob(job);
    } catch (error) {
      this.logger.error(`❌ Failed to get job status: ${jobName}`, error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  private buildAWSSettings(settings?: TranscriptionJobSettings): Record<string, any> {
    const awsSettings: Record<string, any> = {
      ShowAlternatives: settings?.showAlternatives ?? true,
      MaxAlternatives: this.validateNumber(settings?.maxAlternatives, 2, 1, 10),
    };

    if (settings?.showSpeakerLabels) {
      awsSettings.ShowSpeakerLabels = true;
      awsSettings.MaxSpeakerLabels = this.validateNumber(settings?.maxSpeakerLabels, 2, 2, 10);
    }

    return awsSettings;
  }

  private validateNumber(value: number | undefined, defaultValue: number, min: number, max: number): number {
    if (value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
  }

  private mapLanguageCode(code: string): AWSLanguageCode {
    const mapping: Record<string, AWSLanguageCode> = {
      'pt-BR': AWSLanguageCode.PT_BR,
      'en-US': AWSLanguageCode.EN_US,
      'es-US': AWSLanguageCode.ES_US,
    };
    return mapping[code] || AWSLanguageCode.PT_BR;
  }

  private mapMediaFormat(format: string): AWSMediaFormat {
    const mapping: Record<string, AWSMediaFormat> = {
      'webm': AWSMediaFormat.WEBM,
      'mp3': AWSMediaFormat.MP3,
      'mp4': AWSMediaFormat.MP4,
      'wav': AWSMediaFormat.WAV,
      'flac': AWSMediaFormat.FLAC,
      'ogg': AWSMediaFormat.OGG,
      'amr': AWSMediaFormat.AMR,
      'm4a': AWSMediaFormat.M4A,
    };
    return mapping[format.toLowerCase()] || AWSMediaFormat.WEBM;
  }

  private mapToExternalJob(awsJob: any): ExternalTranscriptionJob {
    return {
      jobName: awsJob.TranscriptionJobName,
      status: this.mapStatus(awsJob.TranscriptionJobStatus),
      transcriptFileUri: awsJob.Transcript?.TranscriptFileUri,
      failureReason: awsJob.FailureReason,
      createdAt: awsJob.CreationTime || new Date(),
      completedAt: awsJob.CompletionTime,
    };
  }

  private mapStatus(awsStatus: string): TranscriptionJobStatus {
    const mapping: Record<string, TranscriptionJobStatus> = {
      'QUEUED': TranscriptionJobStatus.PENDING,
      'IN_PROGRESS': TranscriptionJobStatus.IN_PROGRESS,
      'COMPLETED': TranscriptionJobStatus.COMPLETED,
      'FAILED': TranscriptionJobStatus.FAILED,
    };
    return mapping[awsStatus] || TranscriptionJobStatus.PENDING;
  }
}
