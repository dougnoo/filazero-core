/**
 * Domain Entity - Represents a transcription job in the system
 */
export enum TranscriptionJobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class TranscriptionJob {
  constructor(
    public readonly jobName: string,
    public readonly sessionId: string,
    public readonly audioStorageKey: string,
    public status: TranscriptionJobStatus = TranscriptionJobStatus.PENDING,
    public readonly createdAt: Date = new Date(),
    public completedAt?: Date,
    public failureReason?: string,
    public transcriptStorageKey?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.jobName || this.jobName.trim().length === 0) {
      throw new Error('Job name is required');
    }

    if (!this.sessionId || this.sessionId.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    if (!this.audioStorageKey || this.audioStorageKey.trim().length === 0) {
      throw new Error('Audio storage key is required');
    }
  }

  /**
   * Mark job as in progress
   */
  markInProgress(): void {
    if (this.status !== TranscriptionJobStatus.PENDING) {
      throw new Error(`Cannot mark job as in progress from status: ${this.status}`);
    }
    this.status = TranscriptionJobStatus.IN_PROGRESS;
  }

  /**
   * Mark job as completed
   */
  markCompleted(transcriptKey: string): void {
    if (this.status !== TranscriptionJobStatus.IN_PROGRESS) {
      throw new Error(`Cannot mark job as completed from status: ${this.status}`);
    }
    this.status = TranscriptionJobStatus.COMPLETED;
    this.completedAt = new Date();
    this.transcriptStorageKey = transcriptKey;
  }

  /**
   * Mark job as failed
   */
  markFailed(reason: string): void {
    if (this.status === TranscriptionJobStatus.COMPLETED) {
      throw new Error('Cannot mark completed job as failed');
    }
    this.status = TranscriptionJobStatus.FAILED;
    this.completedAt = new Date();
    this.failureReason = reason;
  }

  /**
   * Check if job is in a terminal state
   */
  isTerminal(): boolean {
    return (
      this.status === TranscriptionJobStatus.COMPLETED ||
      this.status === TranscriptionJobStatus.FAILED
    );
  }

  /**
   * Get processing duration in milliseconds
   */
  getProcessingDuration(): number | null {
    if (!this.completedAt) return null;
    return this.completedAt.getTime() - this.createdAt.getTime();
  }

  /**
   * Check if job has exceeded timeout
   */
  hasExceededTimeout(timeoutMs: number): boolean {
    if (this.isTerminal()) return false;
    const now = Date.now();
    return now - this.createdAt.getTime() > timeoutMs;
  }

  /**
   * Generate transcript storage key
   */
  static generateTranscriptKey(jobName: string): string {
    return `transcripts/${jobName}.json`;
  }

  /**
   * Create a unique job name
   */
  static generateJobName(sessionId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `transcribe-${sessionId}-${timestamp}-${random}`;
  }
}
