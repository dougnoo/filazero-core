export interface IAudioTranscriptionService {
  transcribeAudio(audioBuffer: Buffer, audioMimeType: string): Promise<string>;
}