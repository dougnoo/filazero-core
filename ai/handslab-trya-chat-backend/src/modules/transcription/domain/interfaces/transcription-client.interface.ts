import { TranscriptionResult } from '../transcription-result.entity';
import { TranscriptionJob, TranscriptionJobStatus } from '../transcription-job.entity';

/**
 * Port Interface - Defines contract for transcription client operations
 * Infrastructure adapters must implement this interface
 */
export interface ITranscriptionClient {
  /**
   * Start a batch transcription job
   */
  startTranscriptionJob(
    jobName: string,
    audioStorageUri: string,
    mediaFormat: string,
    languageCode: string,
    outputBucketName: string,
    outputKey: string,
    settings?: TranscriptionJobSettings,
  ): Promise<ExternalTranscriptionJob>;

  /**
   * Get the status of a transcription job
   */
  getTranscriptionJobStatus(jobName: string): Promise<ExternalTranscriptionJob>;
}

/**
 * Settings for transcription job
 */
export interface TranscriptionJobSettings {
  showAlternatives?: boolean;
  maxAlternatives?: number;
  showSpeakerLabels?: boolean;
  maxSpeakerLabels?: number;
}

/**
 * External transcription job representation from AWS
 */
export interface ExternalTranscriptionJob {
  jobName: string;
  status: TranscriptionJobStatus;
  transcriptFileUri?: string;
  failureReason?: string;
  createdAt: Date;
  completedAt?: Date;
}
