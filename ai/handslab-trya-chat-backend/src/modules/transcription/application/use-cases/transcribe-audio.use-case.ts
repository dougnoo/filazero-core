import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioFile } from '../../domain/audio-file.entity';
import { TranscriptionJob, TranscriptionJobStatus } from '../../domain/transcription-job.entity';
import { TranscriptionResult } from '../../domain/transcription-result.entity';
import { IStorageClient } from '../../domain/interfaces/storage-client.interface';
import { ITranscriptionClient } from '../../domain/interfaces/transcription-client.interface';
import { ITranscriptionParser } from '../../domain/interfaces/transcription-parser.interface';
import { STORAGE_CLIENT_TOKEN, TRANSCRIPTION_CLIENT_TOKEN, TRANSCRIPTION_PARSER_TOKEN } from '@modules/transcription/tokens';

/**
 * Application Use Case - Transcribe Audio (Batch)
 * Orchestrates the transcription process following business rules
 * Implements Single Responsibility Principle
 */
@Injectable()
export class TranscribeAudioUseCase {
  private readonly logger = new Logger(TranscribeAudioUseCase.name);
  private readonly defaultTimeout: number;
  private readonly languageCode: string = 'pt-BR';

  constructor(
    @Inject(STORAGE_CLIENT_TOKEN)
    private readonly storageClient: IStorageClient,
    @Inject(TRANSCRIPTION_CLIENT_TOKEN)
    private readonly transcriptionClient: ITranscriptionClient,
    @Inject(TRANSCRIPTION_PARSER_TOKEN)
    private readonly parser: ITranscriptionParser,
    private readonly configService: ConfigService,
  ) {
    const timeoutMs = parseInt(
      this.configService.get<string>('TRANSCRIBE_TIMEOUT_MS', '30000'),
      10,
    );
    this.defaultTimeout = isNaN(timeoutMs) ? 30000 : Math.max(5000, Math.min(300000, timeoutMs));
    
    this.logger.log(`TranscribeAudioUseCase initialized: timeout=${this.defaultTimeout}ms`);
  }

  async execute(audioFile: AudioFile): Promise<TranscriptionResult> {
    this.logger.log(
      `🎤 Starting transcription: ${audioFile.getSizeInKB()}KB, ${audioFile.mimeType}, session=${audioFile.sessionId}`,
    );

    try {
      // Validate audio file size
      if (audioFile.exceedsMaxSize(10)) {
        throw new Error('Audio file exceeds maximum size of 10MB');
      }

      // Step 1: Upload audio to storage
      const audioKey = audioFile.generateStorageKey('transcribe');
      await this.storageClient.upload(audioKey, audioFile.buffer, audioFile.mimeType);

      // Step 2: Create and start transcription job
      const jobName = TranscriptionJob.generateJobName(audioFile.sessionId);
      const audioUri = this.storageClient.getUri(audioKey);
      const outputBucketName = this.configService.get<string>('TRANSCRIBE_BUCKET_NAME', 'bedrock-chat-transcribe');
      const transcriptKey = TranscriptionJob.generateTranscriptKey(jobName);

      const job = new TranscriptionJob(jobName, audioFile.sessionId, audioKey);

      // Get transcription settings from config
      const settings = this.getTranscriptionSettings();

      const externalJob = await this.transcriptionClient.startTranscriptionJob(
        jobName,
        audioUri,
        audioFile.getFileExtension(),
        this.languageCode,
        outputBucketName,
        transcriptKey,
        settings,
      );

      job.markInProgress();

      // Step 3: Wait for completion
      const result = await this.waitForCompletion(job, this.defaultTimeout);

      // Step 4: Cleanup storage
      await this.cleanup(audioKey);

      this.logger.log(`✅ Transcription completed: "${result.text.substring(0, 50)}..."`);
      return result;
    } catch (error) {
      this.logger.error('❌ Transcription failed:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  private async waitForCompletion(
    job: TranscriptionJob,
    maxWaitTime: number,
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const externalJob = await this.transcriptionClient.getTranscriptionJobStatus(job.jobName);

      this.logger.debug(`⏳ Job ${job.jobName} status: ${externalJob.status}`);

      if (externalJob.status === TranscriptionJobStatus.COMPLETED) {
        if (!externalJob.transcriptFileUri) {
          throw new Error('Transcript file URI not found');
        }

        // Download and parse result
        const transcriptKey = externalJob.transcriptFileUri.split('/').slice(-1)[0];
        const transcriptData = await this.storageClient.download(`transcripts/${transcriptKey}`);
        
        job.markCompleted(transcriptKey);
        return this.parser.parseTranscriptionResult(transcriptData);
      }

      if (externalJob.status === TranscriptionJobStatus.FAILED) {
        job.markFailed(externalJob.failureReason || 'Unknown failure');
        throw new Error(`Transcription failed: ${externalJob.failureReason}`);
      }

      // Wait before polling again
      await this.delay(2000);
    }

    throw new Error('Transcription timeout exceeded');
  }

  private async cleanup(audioKey: string): Promise<void> {
    try {
      await this.storageClient.delete(audioKey);
    } catch (error) {
      this.logger.warn(`⚠️ Failed to cleanup audio file: ${audioKey}`, error.message);
      // Don't throw on cleanup failures
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getTranscriptionSettings() {
    const enableSpeakerLabels =
      this.configService.get<string>('TRANSCRIBE_ENABLE_SPEAKER_LABELS', 'false') === 'true';
    const maxSpeakerLabels = parseInt(
      this.configService.get<string>('TRANSCRIBE_MAX_SPEAKER_LABELS', '2'),
      10,
    );
    const maxAlternatives = parseInt(
      this.configService.get<string>('TRANSCRIBE_MAX_ALTERNATIVES', '2'),
      10,
    );

    return {
      showAlternatives: true,
      maxAlternatives: isNaN(maxAlternatives) ? 2 : maxAlternatives,
      showSpeakerLabels: enableSpeakerLabels,
      maxSpeakerLabels: isNaN(maxSpeakerLabels) ? 2 : maxSpeakerLabels,
    };
  }
}
