import { Injectable } from '@nestjs/common';
import { IBedrockRepository } from '../domain/interfaces/bedrock-repository.interface';
import { BedrockService } from '@modules/awsbedrock';

@Injectable()
export class BedrockRepositoryAdapter implements IBedrockRepository {
  constructor(private readonly awsbedrockService: BedrockService) {}

  async invokeForTenant(
    tenantId: string,
    agentId: string,
    agentAliasId: string,
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<any> {
    return this.awsbedrockService.invokeForTenant(
      tenantId,
      agentId,
      agentAliasId,
      modelId,
      prompt,
      sessionId,
      audioBuffer,
      audioMimeType,
    );
  }
}