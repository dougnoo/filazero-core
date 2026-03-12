import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { ISpecialtyExtractor, SpecialtyExtractionResult } from '../../domain/ports/specialty-extractor.interface';

@Injectable()
export class BedrockSpecialtyExtractor implements ISpecialtyExtractor {
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    // Usar Haiku para extração por ser mais rápido e barato
    this.modelId = this.configService.get<string>('aws.bedrock.modelId') || 'anthropic.claude-3-haiku-20240307-v1:0';

    // Configuração do cliente Bedrock
    const clientConfig = {
      region,
      requestHandler: {
        requestTimeout: 30000, // 30 segundos (extração deve ser rápida)
        httpsAgent: {
          maxSockets: 25,
          keepAlive: true,
        },
      },
      maxAttempts: 2,
    };

    // Construir configuração do cliente Bedrock
    if (accessKeyId && secretAccessKey) {
      this.bedrockClient = new BedrockRuntimeClient({
        ...clientConfig,
        ...(profile && { profile }),
        credentials: { accessKeyId, secretAccessKey },
      });
    } else if (profile) {
      this.bedrockClient = new BedrockRuntimeClient({
        ...clientConfig,
        profile,
      });
    } else {
      this.bedrockClient = new BedrockRuntimeClient(clientConfig);
    }

    console.log(
      `[SpecialtyExtractor] Initialized with model: ${this.modelId}, region: ${region}`,
    );
  }

  async extractSpecialty(message: string): Promise<SpecialtyExtractionResult> {
    const prompt = this.buildPrompt(message);

    try {
      const response = await this.invokeModel(prompt);
      const result = JSON.parse(response);
      
      console.log(`[SpecialtyExtractor] Result:`, result);
      
      return {
        specialty: result.specialty === 'NENHUMA' ? null : result.specialty,
        message: result.message,
      };
    } catch (error) {
      console.error('[SpecialtyExtractor] Error extracting specialty:', error);
      // Em caso de erro, retorna mensagem genérica
      return {
        specialty: null,
        message: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
      };
    }
  }

  private buildPrompt(message: string): string {
    return `Você é um assistente especializado em identificar especialidades médicas para busca de rede credenciada.

Analise a mensagem do usuário e retorne um JSON com:
1. "specialty": a especialidade identificada (minúsculas) ou "NENHUMA" se não identificar
2. "message": uma mensagem amigável para o usuário

REGRAS PARA SPECIALTY:
- Use nomenclatura oficial das especialidades médicas brasileiras em minúsculas
- Emergência/hospital/pronto socorro/urgência → "pronto socorro"
- Se houver múltiplas especialidades, retorne a mais relevante
- Se não identificar especialidade → "NENHUMA"

REGRAS PARA MESSAGE:
- Se ENCONTROU especialidade: mensagem confirmando o que foi identificado
- Se NÃO encontrou: mensagem educativa com exemplos de como pedir
- Seja breve, amigável e em português
- Não repita a mensagem do usuário

EXEMPLOS:

Mensagem: "Preciso de um cardiologista"
{
  "specialty": "cardiologia",
  "message": "Entendi! Vou buscar cardiologistas próximos a você."
}

Mensagem: "Meu joelho dói muito"
{
  "specialty": "ortopedia",
  "message": "Identifiquei que você precisa de ortopedia. Buscando especialistas..."
}

Mensagem: "Preciso ir ao pronto socorro"
{
  "specialty": "pronto socorro",
  "message": "Emergência identificada! Buscando hospitais e prontos-socorros próximos."
}

Mensagem: "Onde fica a clínica?"
{
  "specialty": "NENHUMA",
  "message": "Não consegui identificar qual especialidade você procura. Tente: 'Preciso de um cardiologista' ou 'Procuro ortopedista'."
}

Mensagem: "Olá"
{
  "specialty": "NENHUMA",
  "message": "Olá! Para buscar prestadores, diga qual especialidade precisa. Exemplo: 'Quero marcar com dermatologista'."
}

MENSAGEM DO USUÁRIO:
${message}

RESPOSTA (apenas o JSON, sem formatação markdown):`;
  }

  private async invokeModel(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200, // Resposta JSON com mensagem
      temperature: 0.1, // Baixa criatividade para consistência
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as {
      content: Array<{ text: string }>;
    };

    return responseBody.content[0].text.trim();
  }
}
