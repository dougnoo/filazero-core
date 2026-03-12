import { Injectable } from '@nestjs/common';
import { IAudioTranscriptionService } from '../domain/interfaces/audio-transcription-service.interface';
import { TranscriptionService } from '../../transcription/transcription.service';

@Injectable()
export class TranscriptionServiceAdapter implements IAudioTranscriptionService {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  async transcribeAudio(audioBuffer: Buffer, audioMimeType: string): Promise<string> {
    // Gerar um sessionId único para a transcrição
    const sessionId = `transcription-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    const result = await this.transcriptionService.transcribeAudio(audioBuffer, audioMimeType, sessionId);
    return result.text;
  }
}